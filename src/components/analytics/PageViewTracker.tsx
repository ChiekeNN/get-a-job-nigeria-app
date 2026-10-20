"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SESSION_KEY = "gj_visit_id";

/**
 * Sends one anonymous beacon per page view.
 *
 * No cookies: the id lives in sessionStorage and dies with the tab, which is
 * enough to tell "one person reading eight pages" from "eight people reading
 * one page". Deliberately silent — never blocks, never reports errors, and
 * respects Do Not Track and Global Privacy Control.
 */
function visitId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    // Storage blocked (private mode, embedded webview): count the view, skip the visit.
    return null;
  }
}

function externalReferrer(): string {
  try {
    if (!document.referrer) return "";
    const url = new URL(document.referrer);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (navigator.doNotTrack === "1") return;
    if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;

    const payload = JSON.stringify({
      path: pathname,
      referrer: externalReferrer(),
      sessionId: visitId(),
    });

    // keepalive lets the request finish even if the visitor navigates away.
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
