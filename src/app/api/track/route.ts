import { BRAND } from "@/data/site";
import { recordPageView } from "@/lib/analytics";

/**
 * Anonymous page-view beacon.
 *
 * Always answers 204 and never surfaces an error to the browser: measurement
 * must never get in the way of the page it is measuring. Bots, admin traffic
 * and anyone sending Do Not Track / Global Privacy Control are dropped.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pagespeed|facebookexternalhit|whatsapp|telegram|preview|monitor/i;
const SKIP = /^\/(admin|api|_next|sitemap|robots|manifest|icon|apple-icon|opengraph-image|favicon)/;

function deviceFrom(userAgent: string): string {
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobi|android|iphone|ipod/i.test(userAgent)) return "mobile";
  return "desktop";
}

function cleanPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/") || path.length > 300) return null;
  if (SKIP.test(path)) return null;
  // Static assets and files are not pages.
  if (/\.[a-z0-9]{2,5}$/i.test(path)) return null;
  return path;
}

function cleanReferrer(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const host = value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .slice(0, 120);
  if (!host || host.includes(" ")) return null;
  const self = BRAND.domain.toLowerCase();
  if (host === self || host.endsWith(".vercel.app")) return null;
  return host;
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") {
      return new Response(null, { status: 204 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    if (!userAgent || BOT.test(userAgent)) return new Response(null, { status: 204 });

    const body = (await request.json()) as Record<string, unknown>;
    const path = cleanPath(body.path);
    if (!path) return new Response(null, { status: 204 });

    const sessionId =
      typeof body.sessionId === "string" && /^[a-z0-9-]{8,64}$/i.test(body.sessionId)
        ? body.sessionId
        : null;

    const countryHeader = request.headers.get("x-vercel-ip-country") ?? "";
    const country = /^[A-Z]{2}$/.test(countryHeader) ? countryHeader : null;

    await recordPageView({
      path,
      referrer: cleanReferrer(body.referrer),
      device: deviceFrom(userAgent),
      country,
      sessionId,
    });
  } catch (error) {
    console.error("[track] page view not stored", error);
  }

  return new Response(null, { status: 204 });
}
