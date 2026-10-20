"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  Receipt,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { useToast } from "@/components/providers/Toaster";
import { PHONE, whatsappLink } from "@/data/contact";
import { CV_ORDER_NOTES, CV_PACKAGES, CV_WRITING, type CvPackage } from "@/data/cv-writing";

const MAX_BYTES = 5 * 1024 * 1024;
const DOC_TYPES =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const RECEIPT_TYPES = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

/** Accepts 0802…, 08026568715 or +234802…; anything else is rejected. */
function looksLikeNigerianPhone(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return /^0\d{10}$/.test(digits) || /^234\d{10}$/.test(digits);
}

/**
 * The packages and the order form.
 *
 * They live in one component because choosing a package has to land in the
 * form. Files can never travel through a browser link, so the last step hands
 * the candidate a WhatsApp button with their order already written out — the
 * CV and the receipt are attached in that chat.
 */
export function CvOrder() {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<CvPackage["id"]>("standard");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvName, setCvName] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [done, setDone] = useState<{ firstName: string; pkg: CvPackage; link: string } | null>(null);

  const pkg = CV_PACKAGES.find((item) => item.id === selected) ?? CV_PACKAGES[0];

  function choosePackage(next: CvPackage["id"]) {
    setSelected(next);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickCv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setCvName("");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That CV is larger than 5MB. Compress it, or send it on WhatsApp instead.");
      event.target.value = "";
      return;
    }
    setError(null);
    setCvName(file.name);
  }

  function pickReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setReceiptName("");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That receipt is larger than 5MB. Compress it, or send it on WhatsApp instead.");
      event.target.value = "";
      return;
    }
    setError(null);
    setReceiptName(file.name);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const notes = String(data.get("notes") ?? "").trim();
    const chosen = CV_PACKAGES.find((item) => item.id === String(data.get("package"))) ?? pkg;

    if (!cvName) {
      setError("Attach your current CV so the writers know what they are working with.");
      return;
    }
    if (!looksLikeNigerianPhone(phone)) {
      setError("Enter a valid Nigerian WhatsApp number, for example 0802 656 8715.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          plan: `${CV_WRITING.planPrefix} · ${chosen.name} — ${chosen.price}`,
          kind: "cv",
          cvFileName: cvName,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok) throw new Error(payload.message || "Could not save your order");

      const message = [
        `Hi GetAJob, I have ordered the ${chosen.name} CV writing package (${chosen.price}).`,
        `Name: ${fullName}`,
        `Email: ${email}`,
        `WhatsApp: ${phone}`,
        `Package: ${chosen.name} — ${chosen.price}`,
        notes ? `About my search: ${notes}` : "",
        receiptName ? `Payment receipt: ${receiptName}` : "",
        "My current CV is attached. Please send the payment details.",
      ]
        .filter(Boolean)
        .join("\n");

      setDone({ firstName, pkg: chosen, link: whatsappLink(message) });
      toast({
        title: "Order received 🎉",
        description: "One last step — send your CV on WhatsApp so the rewrite can start.",
        variant: "success",
      });
      form.reset();
      setCvName("");
      setReceiptName("");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Network error. Please try again.";
      setError(message);
      toast({ title: "Could not save your order", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {/* ── Packages ─────────────────────────────────────────────────── */}
      <div id="packages" className="grid scroll-mt-24 grid-cols-1 gap-3 md:grid-cols-3">
        {CV_PACKAGES.map((item) => {
          const active = item.id === selected;
          return (
            <article
              key={item.id}
              className={`relative flex min-w-0 flex-col rounded-2xl border p-4 transition sm:p-5 ${
                item.popular
                  ? "border-ink-950 bg-ink-950 text-white shadow-[0_30px_70px_-40px_rgba(5,20,15,0.9)]"
                  : "border-ink-100 bg-white"
              } ${active && !item.popular ? "border-brand-300 ring-2 ring-brand-100" : ""}`}
            >
              {item.popular ? (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-ink-950">
                  <Star className="size-2.5 fill-current" aria-hidden="true" />
                  Most popular
                </span>
              ) : null}

              <p
                className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
                  item.popular ? "text-brand-300" : "text-ink-400"
                }`}
              >
                {item.name}
              </p>
              <p className="mt-1 font-display text-[30px] font-extrabold leading-none">{item.price}</p>
              <p
                className={`mt-1 text-[11px] font-medium ${
                  item.popular ? "text-white/50" : "text-ink-400"
                }`}
              >
                one-time payment
              </p>
              <p
                className={`mt-2 text-[12px] leading-relaxed ${
                  item.popular ? "text-white/70" : "text-ink-500"
                }`}
              >
                {item.blurb}
              </p>

              <ul className="mt-3 flex-1 space-y-1.5">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[12px] leading-relaxed">
                    <Check
                      className={`mt-0.5 size-3.5 shrink-0 ${
                        item.popular ? "text-brand-400" : "text-brand-600"
                      }`}
                      aria-hidden="true"
                    />
                    <span className={`min-w-0 ${item.popular ? "text-white/80" : "text-ink-700"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => choosePackage(item.id)}
                className={`btn mt-4 w-full justify-center ${
                  item.popular ? "btn-amber" : "btn-outline"
                }`}
              >
                {active ? "Selected" : `Choose ${item.name}`}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>

      {/* ── Order form ───────────────────────────────────────────────── */}
      <div
        id="order"
        ref={formRef}
        className="mt-8 grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8"
      >
        <div className="min-w-0">
          <p className="eyebrow">
            <Sparkles className="size-3.5 text-brand-600" aria-hidden="true" />
            Start here
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            Send your CV for a rewrite
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
            Fill this in and we will message you on WhatsApp with the bank details. Attach your current
            CV and your receipt in that same chat — no waiting on email.
          </p>

          <ul className="mt-4 space-y-2.5">
            {CV_ORDER_NOTES.map((note) => (
              <li key={note} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-700">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="min-w-0">{note}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-800">
              <MessageCircle className="size-3.5" aria-hidden="true" />
              Rather talk it through?
            </p>
            <a
              href={whatsappLink(`Hi GetAJob, I have a question about CV writing.`)}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 block text-[13px] font-semibold text-brand-800 hover:text-brand-900"
            >
              {PHONE.display}
            </a>
            <p className="mt-1 text-[11px] text-brand-900/60">Monday to Saturday, 9am – 6pm.</p>
          </div>
        </div>

        {done ? (
          <div className="rounded-2xl border border-brand-100 bg-white p-5 text-ink-900 shadow-[0_24px_60px_-32px_rgba(5,20,15,0.35)] sm:p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 font-display text-xl font-extrabold tracking-tight">
              Order saved, {done.firstName}.
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
              One step left: tap below and attach your current CV in the WhatsApp chat. Our team replies
              with the payment details and confirms your <strong>{done.pkg.name}</strong> order —{" "}
              {done.pkg.price} once.
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
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-ink-50 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
              <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
              <p className="min-w-0">
                Your CV lands with a Nigerian HR writer within 2–3 working days of payment, in PDF and
                Word.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-2xl border border-ink-100 bg-white p-4 text-ink-900 shadow-[0_24px_60px_-32px_rgba(5,20,15,0.35)] sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-base font-extrabold leading-tight">Your order</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                  No card needed. Payment is by bank transfer after we confirm your package.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink-950">
                {pkg.price} once
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="cv-first">
                    First name
                  </label>
                  <input
                    id="cv-first"
                    name="firstName"
                    required
                    autoComplete="given-name"
                    className="field"
                    placeholder="Chioma"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="cv-last">
                    Last name
                  </label>
                  <input
                    id="cv-last"
                    name="lastName"
                    required
                    autoComplete="family-name"
                    className="field"
                    placeholder="Eze"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="cv-email">
                  Email
                </label>
                <input
                  id="cv-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="label" htmlFor="cv-phone">
                  WhatsApp number
                </label>
                <input
                  id="cv-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  className="field"
                  placeholder="0802 656 8715"
                />
              </div>

              <div>
                <label className="label" htmlFor="cv-package">
                  Package
                </label>
                <select
                  id="cv-package"
                  name="package"
                  className="field"
                  value={selected}
                  onChange={(event) => setSelected(event.target.value as CvPackage["id"])}
                >
                  {CV_PACKAGES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.price} ({item.blurb})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="cv-file">
                  Your current CV
                </label>
                {cvName ? (
                  <span className="flex items-start justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[12px] text-brand-900">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{cvName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCvName("")}
                      aria-label="Remove attached CV"
                      className="shrink-0 rounded-full p-0.5 text-brand-700 hover:text-rose-600"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ) : (
                  <label
                    htmlFor="cv-file"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 px-3 py-3 text-[12px] font-medium text-ink-500 transition hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    <FileText className="size-4" aria-hidden="true" />
                    Attach one Word or PDF document (up to 5MB)
                  </label>
                )}
                <input
                  id="cv-file"
                  name="cv"
                  type="file"
                  accept={DOC_TYPES}
                  onChange={pickCv}
                  className="sr-only"
                />
              </div>

              <div>
                <label className="label" htmlFor="cv-receipt">
                  Payment receipt <span className="font-normal text-ink-400">(optional)</span>
                </label>
                {receiptName ? (
                  <span className="flex items-start justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[12px] text-brand-900">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Receipt className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{receiptName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReceiptName("")}
                      aria-label="Remove attached receipt"
                      className="shrink-0 rounded-full p-0.5 text-brand-700 hover:text-rose-600"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ) : (
                  <label
                    htmlFor="cv-receipt"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 px-3 py-3 text-[12px] font-medium text-ink-500 transition hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    <Receipt className="size-4" aria-hidden="true" />
                    Already paid? Attach your receipt (JPG, PNG or PDF)
                  </label>
                )}
                <input
                  id="cv-receipt"
                  name="receipt"
                  type="file"
                  accept={RECEIPT_TYPES}
                  onChange={pickReceipt}
                  className="sr-only"
                />
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-400">
                  The files stay on your phone until you attach them in the WhatsApp chat at the end —
                  that is how they reach the writing team.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="cv-notes">
                  Anything we should know? <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <textarea
                  id="cv-notes"
                  name="notes"
                  rows={3}
                  className="field"
                  placeholder="The roles you are going for, and any experience you want highlighted."
                />
              </div>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p>
            ) : null}

            <button
              type="submit"
              className="btn btn-primary mt-4 w-full justify-center"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-4" aria-hidden="true" />
              )}
              {pending ? "Saving…" : `${CV_WRITING.cta} — ${pkg.price}`}
            </button>
            <p className="mt-2 text-center text-[10.5px] leading-relaxed text-ink-400">
              One-time payment. No subscription, nothing renewing.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
