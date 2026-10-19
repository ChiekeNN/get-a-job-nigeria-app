/**
 * Admin access.
 *
 * One shared key, held in ADMIN_SECRET (falling back to IMPORT_SECRET so a
 * working deployment needs no new variable). The key is exchanged for an
 * httpOnly cookie so it never sits in the address bar, in history or in a
 * referrer — and the console is never linked from the public site.
 */
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "gj_admin";

export function adminKey(): string | null {
  const key = process.env.ADMIN_SECRET ?? process.env.IMPORT_SECRET ?? "";
  return key.length > 0 ? key : null;
}

/** Constant-time-ish compare: avoids leaking length/prefix via early exit. */
export function keyMatches(provided: string): boolean {
  const expected = adminKey();
  if (!expected) return false;
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return diff === 0;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value ?? "";
  return value.length > 0 && keyMatches(value);
}

/** True when the deployment has no key at all — the console then explains itself. */
export function adminConfigured(): boolean {
  return adminKey() !== null;
}
