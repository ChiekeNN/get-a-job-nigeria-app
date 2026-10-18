const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

export function cleanText(value: unknown, max = 2000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function splitLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item, 240)).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n|;/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function normalizeNigerianPhone(value: unknown): string {
  const raw = cleanText(value, 30).replace(/[\s-]/g, "");
  if (!raw) return "";
  return raw;
}

export function isValidNigerianPhone(value: string): boolean {
  const raw = value.replace(/[^\d+]/g, "");
  if (/^\+234\d{10}$/.test(raw)) return true;
  if (/^0\d{10}$/.test(raw)) return true;
  return /^\d{11}$/.test(raw);
}

export function requiredError(fields: Array<[string, string]>): string | null {
  for (const [value, label] of fields) {
    if (!value) return `${label} is required`;
  }
  return null;
}
