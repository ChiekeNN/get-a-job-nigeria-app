"use client";

import { FileText, Loader2, UploadCloud } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/Toaster";
import { CATEGORIES, type ActionState } from "@/types";
import { NIGERIAN_STATES } from "@/data/site";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CvUploadModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<ActionState | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(data.get("fullName") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          state: String(data.get("state") ?? ""),
          category: String(data.get("category") ?? ""),
          plan: "Free CV review",
          kind: "cv",
          cvFileName: fileName || "candidate-cv.pdf",
        }),
      });
      const payload = (await response.json()) as ActionState;
      if (!response.ok) throw new Error(payload.message || "Could not upload your CV");
      setStatus({ ok: true, message: payload.message });
      toast({
        title: "CV received 🎉",
        description: "A recruiter will review it and send matching roles to your inbox.",
        variant: "success",
      });
      form.reset();
      setFileName("");
      window.setTimeout(onClose, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setStatus({ ok: false, message });
      toast({ title: "Upload failed", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload your CV"
      description="Get a free CV review and be matched with vetted employers across Nigeria."
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="cv-name">
              Full name
            </label>
            <input
              id="cv-name"
              name="fullName"
              required
              className="field"
              placeholder="Chidera Nwosu"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="label" htmlFor="cv-email">
              Email address
            </label>
            <input
              id="cv-email"
              name="email"
              type="email"
              required
              className="field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="cv-phone">
              WhatsApp number
            </label>
            <input
              id="cv-phone"
              name="phone"
              required
              className="field"
              placeholder="0803 000 4421"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="label" htmlFor="cv-state">
              Preferred state
            </label>
            <select id="cv-state" name="state" className="field" defaultValue="Lagos">
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="cv-category">
            Field of interest
          </label>
          <select id="cv-category" name="category" className="field" defaultValue="Technology">
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">CV file</span>
          <label
            htmlFor="cv-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 px-4 py-7 text-center transition hover:bg-brand-50"
          >
            {fileName ? (
              <>
                <FileText className="size-6 text-brand-700" aria-hidden="true" />
                <span className="max-w-full truncate text-sm font-semibold text-brand-800">
                  {fileName}
                </span>
                <span className="text-xs text-ink-500">Click to replace file</span>
              </>
            ) : (
              <>
                <UploadCloud className="size-7 text-brand-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-ink-800">
                  Tap to upload PDF or Word CV
                </span>
                <span className="text-xs text-ink-500">Max 5MB · reviewed within 48 hours</span>
              </>
            )}
            <input
              id="cv-file"
              name="cvFile"
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
            />
          </label>
        </div>

        {status ? (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              status.ok
                ? "bg-brand-50 text-brand-800"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {status.message}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Uploading…" : "Submit CV for free review"}
        </button>
        <p className="text-center text-[11px] leading-relaxed text-ink-400">
          By uploading you agree to our CV policy. Your details are never sold to third parties.
        </p>
      </form>
    </Modal>
  );
}
