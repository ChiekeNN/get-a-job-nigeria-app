"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes the site installable and gives it an
 * offline fallback.
 *
 * Production only: a service worker in front of `next dev` caches hot-reload
 * chunks and produces bugs that look like application bugs.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration is an enhancement; the site works without it.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
