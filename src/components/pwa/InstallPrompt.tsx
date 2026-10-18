"use client";

import { Download, Share, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/**
 * Install prompt, on a fixed schedule.
 *
 *   t = 0s   page load
 *   t = 5s   the card appears
 *   t = 20s  it slides away on its own (visible for 15s)
 *   t = 80s  it appears one final time, 60s after it went away
 *
 * It stays on screen that last time until the visitor closes it or installs.
 *
 * It never appears to someone who already has the app: an installed PWA runs in
 * standalone display mode, and iOS reports itself through `navigator.standalone`
 * instead. Neither is visible from the server, so the check happens on mount.
 *
 * The schedule is remembered in localStorage, so a reload does not restart it.
 */
const APPEAR_AFTER_MS = 5_000;
const VISIBLE_FOR_MS = 15_000;
const FINAL_AFTER_MS = 60_000;
const STORAGE_KEY = "getajob:install-prompt";

type Phase = "waiting" | "first" | "away" | "final" | "closed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** True when the site is already running as an installed app. */
function isStandalone(): boolean {
  if (typeof window === "undefined") return true;

  const modes = [
    "(display-mode: standalone)",
    "(display-mode: fullscreen)",
    "(display-mode: minimal-ui)",
  ];
  if (modes.some((mode) => window.matchMedia?.(mode).matches)) return true;

  // iOS Safari exposes this on navigator rather than through a media query.
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;

  // Launched from the Android app shell.
  return document.referrer.startsWith("android-app://");
}

/** iOS has no beforeinstallprompt, so the button becomes instructions. */
function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function remember(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    // Private browsing: the prompt still works, it just cannot be remembered.
  }
}

function alreadyPrompted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [phase, setPhase] = useState<Phase>("waiting");
  // Held in state, not a ref: the button has to re-render once the browser
  // offers an install event, otherwise the first paint shows a dead control.
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  // Start the clock, unless this visitor is already running the installed app
  // or has seen the prompt before.
  useEffect(() => {
    if (isStandalone() || alreadyPrompted()) return;

    const timer = window.setTimeout(() => setPhase("first"), APPEAR_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Capture the browser's install event so our own button can trigger it.
  useEffect(() => {
    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      remember();
      setPhase("closed");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Each visible phase owns the timer that moves it on.
  useEffect(() => {
    if (phase === "first") {
      const timer = window.setTimeout(() => setPhase("away"), VISIBLE_FOR_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "away") {
      const timer = window.setTimeout(() => setPhase("final"), FINAL_AFTER_MS);
      return () => window.clearTimeout(timer);
    }
    return;
  }, [phase]);

  // Reaching the final appearance is what a reload should not repeat.
  useEffect(() => {
    if (phase === "final") remember();
  }, [phase]);

  const dismiss = useCallback(() => {
    // Closing the first look only hides it: the visitor still gets the single
    // follow-up appearance a minute later. Closing that one ends it for good.
    setPhase((current) => {
      if (current !== "final") return "away";
      remember();
      return "closed";
    });
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);

    remember();
    setPhase("closed");
  }, [promptEvent]);

  // Rendered only on the client, and only while one of the two appearances is
  // active, so the browser sniffing below never runs during server rendering.
  if (phase !== "first" && phase !== "final") return null;

  // beforeinstallprompt is Chromium-only. Safari on iOS and Firefox never fire
  // it, so those visitors get instructions instead of a button that does nothing.
  const canPrompt = !isIos() && promptEvent !== null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-body"
      aria-live="polite"
      className="pwa-card fixed inset-x-3 bottom-3 z-[80] mx-auto w-auto max-w-md rounded-2xl border border-ink-100 bg-white p-4 shadow-[0_28px_60px_-24px_rgba(5,20,15,0.45)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[380px]"
    >
      <div className="flex items-start gap-3">
        <Image
          src="/brand/mark.png"
          alt=""
          width={44}
          height={44}
          className="size-11 shrink-0"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <p
            id="install-prompt-title"
            className="font-display text-[15px] font-extrabold leading-tight text-ink-900"
          >
            Install the GetAJob app
          </p>
          <p id="install-prompt-body" className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
            {canPrompt
              ? "One tap from your home screen — openings, alerts and applications, even on a weak connection."
              : isIos()
                ? "Tap the Share button, then choose “Add to Home Screen”."
                : "Open your browser menu and choose “Install app” or “Add to Home screen”."}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {canPrompt ? (
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-brand-700"
              >
                <Download className="size-4" aria-hidden="true" />
                Install app
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 py-2 text-[12.5px] font-semibold text-brand-800">
                {isIos() ? (
                  <Share className="size-4" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                {isIos() ? "Share → Add to Home Screen" : "Install from browser menu"}
              </span>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl px-3 py-2 text-[12.5px] font-semibold text-ink-500 transition hover:bg-ink-50 hover:text-ink-800"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close install prompt"
          className="-mr-1 -mt-1 rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-800"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
