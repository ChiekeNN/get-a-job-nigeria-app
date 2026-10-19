"use client";

import { ArrowRight, CheckCircle2, Loader2, MessageCircle, Paperclip, X } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { useToast } from "@/components/providers/Toaster";
import { PHONE, whatsappLink } from "@/data/contact";
import { PRO } from "@/data/pro";
import { NIGERIAN_STATES } from "@/data/site";
import { CATEGORIES, type ActionState } from "@/types";

const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_TYPES = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * The Job Seeker Pro signup form.
 *
 * The details land in the database immediately. The CV itself cannot travel
 * through a browser link, so the last step hands the candidate a WhatsApp
 * button: one tap, attach the file, done. Their preferences ride along in the
 * pre-filled message, which is what the career team reads first.
 */
export function ProSignupForm() {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; link: string } | null>(null);
  const [cvName, setCvName] = useState("");

  function pickCv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setCvName("");
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setError("That file is larger than 5MB. Compress it, or send it on WhatsApp after signing up.");
      event.target.value = "";
      return;
    }
    setError(null);
    setCvName(file.name);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const preferences = String(data.get("preferences") ?? "").trim();
    const name = String(data.get("fullName") ?? "").trim();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email: data.get("email"),
          phone: data.get("phone"),
          state: data.get("state"),
          category: data.get("category"),
          plan: PRO.plan,
          kind: "pro",
          cvFileName: cvName || undefined,
        }),
      });
      const payload = (await response.json()) as ActionState;
      if (!response.ok) throw new Error(payload.message || "Could not save your signup");

      const message = [
        `Hi GetAJob, I have signed up for ${PRO.name}.`,
        `Name: ${name}`,
        `Email: ${String(data.get("email") ?? "")}`,
        `State: ${String(data.get("state") ?? "")}`,
        `Field: ${String(data.get("category") ?? "")}`,
        preferences ? `Jobs I want: ${preferences}` : "",
        "My CV is attached.",
      ]
        .filter(Boolean)
        .join("\n");

      setDone({ name, link: whatsappLink(message) });
      toast({
        title: "Signup received 🎉",
        description: "One last step — send your CV on WhatsApp so the rewrite can begin.",
        variant: "success",
      });
      form.reset();
      setCvName("");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Network error. Please try again.";
      setError(message);
      toast({ title: "Could not save your signup", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-5 text-ink-900 shadow-[0_24px_60px_-32px_rgba(5,20,15,0.35)] sm:p-6">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-3 font-display text-xl font-extrabold tracking-tight">
          You&apos;re in, {done.name.split(" ")[0]}.
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
          One step left: send your CV on WhatsApp so our team can start the rewrite — the button
          below opens the chat with your details already written.
        </p>
        <a
          href={done.link}
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-primary mt-4 w-full justify-center"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Send my CV on WhatsApp
        </a>
        <p className="mt-2 text-center text-[10.5px] leading-relaxed text-ink-400">
          Attach one Word or PDF document in the chat. We reply within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-ink-100 bg-white p-4 text-ink-900 shadow-[0_24px_60px_-32px_rgba(5,20,15,0.35)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-extrabold leading-tight">
            Join {PRO.name}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
            {PRO.price} once. Our team sends the payment details on WhatsApp within 24 hours.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-700">
          {PRO.price} once
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        <div>
          <label className="label" htmlFor="pro-name">
            Full name
          </label>
          <input
            id="pro-name"
            name="fullName"
            required
            autoComplete="name"
            className="field"
            placeholder="First and last name"
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pro-email">
              Email
            </label>
            <input
              id="pro-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="pro-phone">
              WhatsApp number
            </label>
            <input
              id="pro-phone"
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              className="field"
              placeholder={PHONE.local}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pro-state">
              State
            </label>
            <select id="pro-state" name="state" className="field" defaultValue="Lagos">
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pro-category">
              Field
            </label>
            <select id="pro-category" name="category" className="field" defaultValue={CATEGORIES[0]}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="pro-preferences">
            What kind of jobs are you looking for?
          </label>
          <textarea
            id="pro-preferences"
            name="preferences"
            required
            rows={3}
            className="field resize-y"
            placeholder="e.g. HSE Officer in Port Harcourt, ₦300,000 and above"
          />
        </div>

        <div>
          <span className="label">Your CV</span>
          <label
            htmlFor="pro-cv"
            className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-ink-200 bg-cream px-3 py-2.5 text-[12px] text-ink-600 transition hover:border-brand-300 hover:bg-brand-50/60"
          >
            <Paperclip className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">
              {cvName || "Attach one Word or PDF document (up to 5MB)"}
            </span>
            {cvName ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setCvName("");
                  const input = document.getElementById("pro-cv") as HTMLInputElement | null;
                  if (input) input.value = "";
                }}
                aria-label="Remove attached CV"
                className="shrink-0 rounded-full p-0.5 text-ink-400 hover:bg-white hover:text-rose-600"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </label>
          <input
            id="pro-cv"
            name="cv"
            type="file"
            accept={CV_TYPES}
            onChange={pickCv}
            className="sr-only"
          />
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-400">
            The file stays on your phone until you send it in the WhatsApp chat at the end — that is
            how it reaches our HR team.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p>
      ) : null}

      <button type="submit" className="btn btn-primary mt-4 w-full justify-center" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="size-4" aria-hidden="true" />
        )}
        {pending ? "Starting…" : PRO.cta}
      </button>
      <p className="mt-2 text-center text-[10.5px] leading-relaxed text-ink-400">
        One payment of {PRO.price}. No monthly charge.
      </p>
    </form>
  );
}

/** Free daily digest — the no-cost way onto the list. */
export function AlertsForm() {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          phone: data.get("phone"),
          state: data.get("state"),
          category: data.get("category"),
          plan: "Daily WhatsApp Alerts",
          kind: "alerts",
        }),
      });
      const payload = (await response.json()) as ActionState;
      if (!response.ok) throw new Error(payload.message || "Could not save your details");
      toast({
        title: "You're on the alert list ✅",
        description: payload.message,
        variant: "success",
      });
      form.reset();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Network error";
      toast({ title: "Alerts not activated", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="card min-w-0 p-4 sm:p-5">
      <p className="font-display text-base font-extrabold text-ink-900">Not ready for Pro?</p>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
        Join the free daily digest and still get verified roles on WhatsApp every morning.
      </p>

      <div className="mt-3 space-y-2.5">
        <div>
          <label className="label" htmlFor="alert-name">
            Full name
          </label>
          <input id="alert-name" name="fullName" required className="field" placeholder="Your name" />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="alert-email">
              Email
            </label>
            <input
              id="alert-email"
              name="email"
              type="email"
              required
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="alert-phone">
              WhatsApp number
            </label>
            <input
              id="alert-phone"
              name="phone"
              required
              inputMode="tel"
              className="field"
              placeholder={PHONE.local}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="alert-state">
              State
            </label>
            <select id="alert-state" name="state" className="field" defaultValue="Lagos">
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="alert-category">
              Field
            </label>
            <select id="alert-category" name="category" className="field" defaultValue={CATEGORIES[0]}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-outline mt-3 w-full justify-center" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Saving…" : "Get free alerts"}
      </button>
      <p className="mt-2 text-center text-[10px] leading-relaxed text-ink-400">
        Unsubscribe any time. We never sell your data.
      </p>
    </form>
  );
}
