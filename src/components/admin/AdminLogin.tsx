"use client";

import { Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useId, useState, type FormEvent } from "react";

import { BRAND } from "@/data/site";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [key, setKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [keep, setKeep] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keepId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, keep }),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not sign in");
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4 py-12">
      <div className="admin-rise w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5">
          <span className="grid size-11 place-items-center rounded-2xl bg-white">
            <Image src="/brand/mark.png" alt="" width={34} height={34} className="size-8" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold leading-none text-white">
              {BRAND.name} <span className="text-brand-300">Admin</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Control room
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300/25 bg-brand-400/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-200">
            <Lock className="size-3" aria-hidden="true" />
            Private
          </span>

          <label className="mt-4 block text-[11px] font-semibold uppercase tracking-wide text-white/50" htmlFor="admin-key">
            Admin key
          </label>
          <div className="relative mt-1.5">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" aria-hidden="true" />
            <input
              id="admin-key"
              type={reveal ? "text" : "password"}
              autoComplete="current-password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-11 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand-400 focus:bg-white/10"
              placeholder="Paste the key"
              spellCheck={false}
              autoCapitalize="off"
              required
            />
            {/* Read the key back before submitting — the commonest reason a
                correct key is rejected is a typo nobody can see. */}
            <button
              type="button"
              onClick={() => setReveal((value) => !value)}
              aria-label={reveal ? "Hide the key" : "Show the key"}
              aria-pressed={reveal}
              title={reveal ? "Hide the key" : "Show the key"}
              className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
            >
              {reveal ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="mt-3 flex items-start gap-2.5">
            <input
              id={keepId}
              type="checkbox"
              checked={keep}
              onChange={(event) => setKeep(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-white/25 bg-white/10 accent-brand-500"
            />
            <label htmlFor={keepId} className="cursor-pointer text-[11.5px] leading-snug text-white/70">
              Keep me signed in on this device
              <span className="mt-0.5 block text-[10px] leading-snug text-white/35">
                Stays signed in for 30 days instead of 12 hours. Leave it off on a shared computer.
              </span>
            </label>
          </div>

          {!configured ? (
            <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
              This deployment has no admin key. Add <span className="font-mono">ADMIN_SECRET</span> (or
              <span className="font-mono"> IMPORT_SECRET</span>) in Vercel, then redeploy.
            </p>
          ) : null}

          {error ? (
            <p className="mt-3 rounded-lg bg-rose-400/10 px-3 py-2 text-[11px] text-rose-200">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending || !configured}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-brand-400 disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Open the console
          </button>

          <p className="mt-3 text-center text-[10px] leading-relaxed text-white/30">
            The key is exchanged for a private cookie — nothing is stored on this device. Sign out
            clears it.
          </p>
        </form>
      </div>
    </div>
  );
}
