"use client";

import { Check, Link2, MessageCircle } from "lucide-react";
import { useState } from "react";

/**
 * WhatsApp is where this advice actually travels in Nigeria, so the share
 * button is the primary one. Both buttons read the URL at click time — never
 * during render — so nothing depends on hydration matching the server.
 */
export function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function currentUrl() {
    return window.location.href.split("#")[0];
  }

  function shareOnWhatsApp() {
    const text = `${title} — ${currentUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function copy() {
    const url = currentUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers without the clipboard API.
      const field = document.createElement("textarea");
      field.value = url;
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">Share</span>
      <button
        type="button"
        onClick={shareOnWhatsApp}
        className="btn btn-sm !border-brand-200 !bg-brand-50 !text-brand-800 hover:!bg-brand-100"
      >
        <MessageCircle className="size-3.5" aria-hidden="true" />
        WhatsApp
      </button>
      <button type="button" onClick={copy} className="btn btn-sm btn-outline" aria-live="polite">
        {copied ? (
          <>
            <Check className="size-3.5 text-brand-600" aria-hidden="true" />
            Link copied
          </>
        ) : (
          <>
            <Link2 className="size-3.5" aria-hidden="true" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
