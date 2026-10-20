"use client";

import { CheckCircle2, Loader2, Lock, UploadCloud } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useToast } from "@/components/providers/Toaster";
import { PHONE } from "@/data/contact";
import type { ActionState, Job } from "@/types";

export function ApplyForm({ job }: { job: Job }) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");
  const [cvName, setCvName] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ActionState | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.set("jobId", String(job.id));
      for (const key of ["fullName", "email", "phone", "location", "coverLetter", "website"]) {
        formData.set(key, String(data.get(key) ?? ""));
      }
      if (cvFile) formData.set("cv", cvFile);

      const response = await fetch("/api/applications", { method: "POST", body: formData });
      const payload = (await response.json()) as ActionState;
      if (!response.ok) throw new Error(payload.message || "Could not send application");
      setDone(true);
      setDoneMessage(payload.message);
      toast({ title: "Application sent ✅", description: payload.message, variant: "success" });
      form.reset();
      setCvFile(null);
      setCvName("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      setStatus({ ok: false, message });
      toast({ title: "Application failed", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card p-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-3 font-display text-lg font-bold text-ink-900">Application received</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          {doneMessage ||
            `Your CV is with the GetAJob placement team. We review every application and forward shortlists to ${job.company} — expect to hear from us within 7 working days.`}
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setDoneMessage("");
          }}
          className="btn btn-outline btn-sm mt-4"
        >
          Apply again for someone else
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card relative p-5">
      {/* Honeypot: hidden from people and from assistive tech, filled only by
          scripts. See src/lib/throttle.ts for what happens when it is. */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="cv-website">Website</label>
        <input id="cv-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <h3 className="font-display text-lg font-bold text-ink-900">Apply for this role</h3>
      <p className="mt-1 text-xs text-ink-500">
        Takes under 60 seconds. Your CV goes straight to the GetAJob placement team, who forward
        shortlists to {job.company}.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="detail-name">
            Full name
          </label>
          <input id="detail-name" name="fullName" required className="field" placeholder="Your full name" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <label className="label" htmlFor="detail-email">
              Email
            </label>
            <input
              id="detail-email"
              name="email"
              type="email"
              required
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="detail-phone">
              Phone / WhatsApp
            </label>
            <input
              id="detail-phone"
              name="phone"
              required
              inputMode="tel"
              className="field"
              placeholder={PHONE.local}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="detail-location">
            Current location
          </label>
          <input id="detail-location" name="location" className="field" placeholder="Ikeja, Lagos" />
        </div>
        <div>
          <label className="label" htmlFor="detail-cover">
            Cover note (optional)
          </label>
          <textarea
            id="detail-cover"
            name="coverLetter"
            rows={4}
            className="field resize-y"
            placeholder="Highlight your most relevant experience."
          />
        </div>
        <label
          htmlFor="detail-cv"
          className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-3 py-2.5 text-sm transition hover:border-brand-300 hover:bg-brand-50/60"
        >
          <span className="flex min-w-0 items-center gap-2 font-medium text-ink-700">
            <UploadCloud className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span className="truncate">{cvName || "Attach CV (PDF or Word) *"}</span>
          </span>
          <span className="shrink-0 text-xs font-semibold text-brand-700">
            {cvName ? "Change" : "Browse"}
          </span>
          <input
            id="detail-cv"
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setCvFile(null);
                setCvName("");
                return;
              }
              if (file.size > 4 * 1024 * 1024) {
                toast({
                  title: "CV too large",
                  description: "Keep it under 4 MB — compress the PDF or send a Word file.",
                  variant: "error",
                });
                event.target.value = "";
                setCvFile(null);
                setCvName("");
                return;
              }
              setCvFile(file);
              setCvName(file.name);
            }}
          />
        </label>
      </div>

      {status && !status.ok ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
      ) : null}

      <button type="submit" className="btn btn-primary mt-4 w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Sending…" : "Submit application"}
      </button>
      <p className="mt-2 flex items-center justify-center gap-1 text-[10.5px] text-ink-400">
        <Lock className="size-3" aria-hidden="true" />
        GetAJob never charges candidates to apply.
      </p>
    </form>
  );
}
