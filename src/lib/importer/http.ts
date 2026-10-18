const USER_AGENT = "NaijaHireBot/1.0 (+job listing sync; contact: support@naijahire.ng)";

export class FetchError extends Error {
  readonly status?: number;
  readonly blocked: boolean;

  constructor(message: string, options: { status?: number; blocked?: boolean } = {}) {
    super(message);
    this.name = "FetchError";
    this.status = options.status;
    this.blocked = options.blocked ?? false;
  }
}

/** True when the response looks like a Cloudflare / WAF challenge rather than content. */
function looksBlocked(status: number, body: string): boolean {
  if (status === 403 || status === 429 || status === 503) return true;
  const head = body.slice(0, 4000).toLowerCase();
  return (
    head.includes("just a moment") ||
    head.includes("cf-challenge") ||
    head.includes("attention required") ||
    head.includes("enable javascript and cookies")
  );
}

/**
 * Fetch a page as text with retries and a descriptive error for WAF blocks.
 * Kept dependency-free so it runs on Node and the Edge runtime alike.
 */
export async function fetchText(
  url: string,
  options: { timeoutMs?: number; retries?: number } = {},
): Promise<string> {
  const { timeoutMs = 20_000, retries = 2 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "en-NG,en;q=0.9",
        },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });

      const body = await response.text();

      if (!response.ok) {
        throw new FetchError(`HTTP ${response.status} for ${url}`, {
          status: response.status,
          blocked: looksBlocked(response.status, body),
        });
      }

      if (looksBlocked(response.status, body)) {
        throw new FetchError(`Blocked by bot protection at ${url}`, {
          status: response.status,
          blocked: true,
        });
      }

      return body;
    } catch (error) {
      lastError = error;
      if (error instanceof FetchError && error.blocked) throw error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new FetchError(`Could not fetch ${url}`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
