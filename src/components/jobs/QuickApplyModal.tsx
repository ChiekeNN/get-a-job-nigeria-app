"use client";

import { CheckCircle2, Loader2, Lock, MapPin, Sparkles, UploadCloud } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useToast } from "@/components/providers/Toaster";
import { PHONE } from "@/data/contact";
import { Modal } from "@/components/ui/Modal";
import { salaryLabel, salaryRange } from "@/lib/format";
import type { ActionState, Job } from "@/types";

interface Props {
  job: Job | null;
  onClose: () => void;
  onApplied: (job: Job) => void;
}

export function QuickApplyModal({ job, onClose, onApplied }: Props) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [cvName, setCvName] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ActionState | null>(null);

  function handleClose() {
    onClose();
    window.setTimeout(() => {
      setDone(false);
      setStatus(null);
      setCvName("");
      setCvFile(null);
    }, 250);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.set("jobId", String(job.id));
      for (const key of ["fullName", "email", "phone", "location", "coverLetter"]) {
        formData.set(key, String(data.get(key) ?? ""));
      }
      if (cvFile) formData.set("cv", cvFile);

      const response = await fetch("/api/applications", { method: "POST", body: formData });
      const payload = (await response.json()) as ActionState;
      if (!response.ok) throw new Error(payload.message || "Could not submit application");
      setDone(true);
      onApplied(job);
      toast({
        title: "Application sent ✅",
        description: `Your CV is with our placement team. Watch your inbox and WhatsApp.`,
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setStatus({ ok: false, message });
      toast({ title: "Application failed", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={Boolean(job)}
      onClose={handleClose}
      title={done ? "You're in the queue 🎉" : `Quick apply — ${job?.title ?? ""}`}
      description={
        done
          ? `Your CV is with the GetAJob placement team. We forward shortlists to ${job?.company ?? "the employer"} — expect to hear from us within 7 working days.`
          : `Apply in under 60 seconds. Our team reviews every CV and forwards shortlists to ${job?.company ?? "this company"}.`
      }
    >
      {job && !done ? (
        <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{job.company}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-600">
                <MapPin className="size-3" aria-hidden="true" />
                {job.city}, {job.state} · {job.jobType}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                Salary
              </p>
              <p className="text-xs font-bold text-brand-700">
                {salaryLabel(job.salaryMin, job.salaryMax)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-ink-500">{salaryRange(job.salaryMin, job.salaryMax)} per month · {job.applicants} applicants so far</p>
        </div>
      ) : null}

      {done ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            Application recorded successfully.
          </div>
          <ul className="space-y-2 text-sm text-ink-600">
            <li>1. Your CV reached the GetAJob placement team.</li>
            <li>2. We forward shortlists to the employer — watch your inbox and WhatsApp.</li>
            <li>3. Turn on WhatsApp alerts so you never miss the next role.</li>
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className="btn btn-primary flex-1" onClick={handleClose}>
              Keep exploring jobs
            </button>
            <button type="button" className="btn btn-outline flex-1" onClick={handleClose}>
              <Sparkles className="size-4" aria-hidden="true" />
              Upgrade to Pro
            </button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="apply-name">
                Full name
              </label>
              <input
                id="apply-name"
                name="fullName"
                required
                className="field"
                placeholder="Adaeze Okonkwo"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label" htmlFor="apply-email">
                Email address
              </label>
              <input
                id="apply-email"
                name="email"
                type="email"
                required
                className="field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="apply-phone">
                Phone / WhatsApp
              </label>
              <input
                id="apply-phone"
                name="phone"
                required
                inputMode="tel"
                className="field"
                placeholder={PHONE.local}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="label" htmlFor="apply-location">
                Current location
              </label>
              <input
                id="apply-location"
                name="location"
                className="field"
                placeholder="Surulere, Lagos"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="apply-cover">
              Short note (optional)
            </label>
            <textarea
              id="apply-cover"
              name="coverLetter"
              rows={3}
              className="field resize-y"
              placeholder="Tell them why you fit — two or three sentences is enough."
            />
          </div>

          <label
            htmlFor="apply-cv"
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-3 py-3 transition hover:border-brand-300 hover:bg-brand-50/60"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <UploadCloud className="size-4 text-brand-600" aria-hidden="true" />
              {cvName || "Attach CV (PDF or Word) *"}
            </span>
            <span className="text-xs font-semibold text-brand-700">
              {cvName ? "Change" : "Browse"}
            </span>
            <input
              id="apply-cv"
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

          {status && !status.ok ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
          ) : null}

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? "Sending application…" : "Submit application"}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-400">
            <Lock className="size-3" aria-hidden="true" />
            Your details are shared only with this employer.
          </p>
        </form>
      )}
    </Modal>
  );
}
