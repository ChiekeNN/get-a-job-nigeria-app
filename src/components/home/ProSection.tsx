"use client";

import {
  BadgeCheck,
  BellRing,
  Check,
  Loader2,
  MessageCircle,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { CONTACT, PHONE, mailto } from "@/data/contact";
import { useToast } from "@/components/providers/Toaster";
import { Modal } from "@/components/ui/Modal";
import { PRO_FEATURES, NIGERIAN_STATES } from "@/data/site";
import { CATEGORIES, type ActionState } from "@/types";

interface Plan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  plan: string;
  kind: "alerts" | "pro";
  blurb: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "alerts",
    name: "Daily alerts",
    price: "₦3,500",
    cadence: "per month",
    plan: "Daily WhatsApp Alerts",
    kind: "alerts",
    blurb: "5 matched roles on WhatsApp every morning",
  },
  {
    id: "pro",
    name: "Job Seeker Pro",
    price: "₦8,000",
    cadence: "per month",
    plan: "Job Seeker Pro · ₦8,000/month",
    kind: "pro",
    blurb: "CV rewrite, alerts and 2 referrals monthly",
    featured: true,
  },
  {
    id: "referral",
    name: "Referral sprint",
    price: "₦18,000",
    cadence: "one-off",
    plan: "Referral Sprint · ₦18,000",
    kind: "pro",
    blurb: "5 warm introductions in 14 days",
  },
];

export function ProSection() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Plan | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ActionState | null>(null);
  const [alertPending, setAlertPending] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setStatus(null);
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
          plan: selected.plan,
          kind: selected.kind,
        }),
      });
      const payload = (await response.json()) as ActionState;
      if (!response.ok) throw new Error(payload.message || "Could not start this plan");
      toast({ title: `${selected.name} activated`, description: payload.message, variant: "success" });
      setSelected(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      setStatus({ ok: false, message });
      toast({ title: "Something went wrong", description: message, variant: "error" });
    } finally {
      setPending(false);
    }
  }

  async function startAlerts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setAlertPending(true);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      toast({ title: "Alerts not activated", description: message, variant: "error" });
    } finally {
      setAlertPending(false);
    }
  }

  return (
    <section id="pro" className="wrap mt-16 scroll-mt-24">
      <div className="relative overflow-hidden rounded-[26px] bg-ink-950 p-5 text-white sm:p-8 lg:p-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 size-64 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Job Seeker Pro
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">
              Get shortlisted, not just seen.
              <span className="block text-brand-300">Career support priced in Naira.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-[15px]">
              Stop paying to apply. Invest once in the things that actually move a Nigerian
              recruiter: a strong CV, direct referrals and alerts you see before the crowd.
            </p>

            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {PRO_FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-white">{feature.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-xl border p-3.5 transition ${
                    plan.featured
                      ? "border-amber-300/60 bg-gradient-to-b from-amber-300/15 to-white/5"
                      : "border-white/12 bg-white/5 hover:border-white/25"
                  }`}
                >
                  {plan.featured ? (
                    <span className="absolute -top-2 right-2 rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink-950">
                      Most popular
                    </span>
                  ) : null}
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    {plan.name}
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold text-white">
                    {plan.price}
                    <span className="ml-1 text-[10px] font-medium text-white/50">{plan.cadence}</span>
                  </p>
                  <p className="mt-1 flex-1 text-[10.5px] leading-relaxed text-white/55">{plan.blurb}</p>
                  <button
                    type="button"
                    onClick={() => setSelected(plan)}
                    className={`btn btn-sm mt-3 w-full ${
                      plan.featured ? "btn-amber" : "btn-outline !bg-white/10 !text-white !border-white/25 hover:!bg-white/15"
                    }`}
                  >
                    Choose plan
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/55">
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="size-3.5 text-brand-400" aria-hidden="true" />
                Cancel anytime
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 text-amber-300" aria-hidden="true" />
                4.8/5 member rating
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="size-3.5 text-brand-400" aria-hidden="true" />
                48-hour CV turnaround
              </span>
            </div>
          </div>

          <form
            onSubmit={startAlerts}
            className="rounded-2xl border border-white/15 bg-white p-4 text-ink-900 shadow-2xl sm:p-5"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <BellRing className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold">Free daily job alerts</p>
                <p className="text-[11px] text-ink-500">WhatsApp digest · unsubscribe anytime</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <div>
                <label className="label" htmlFor="alert-name">
                  Full name
                </label>
                <input id="alert-name" name="fullName" required className="field" placeholder="Your name" />
              </div>
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
              <div className="grid grid-cols-2 gap-2">
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

            <button type="submit" className="btn btn-primary mt-4 w-full" disabled={alertPending}>
              {alertPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <MessageCircle className="size-4" aria-hidden="true" />
              )}
              {alertPending ? "Saving…" : "Get free alerts"}
            </button>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-ink-400">
              By joining you accept our privacy policy. We never sell your data.
            </p>
          </form>
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Start ${selected?.name ?? "Job Seeker Pro"}`}
        description={`${selected?.price ?? ""} ${selected?.cadence ?? ""} · a career adviser confirms on WhatsApp within 24 hours.`}
      >
        <form onSubmit={subscribe} className="space-y-3">
          <div className="rounded-xl border border-brand-100 bg-brand-50/70 px-3 py-2.5 text-sm">
            <p className="font-semibold text-brand-900">{selected?.plan}</p>
            <p className="mt-0.5 text-xs text-brand-800/80">{selected?.blurb}</p>
          </div>
          <div>
            <label className="label" htmlFor="pro-name">
              Full name
            </label>
            <input id="pro-name" name="fullName" required className="field" placeholder="Your name" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="pro-email">
                Email
              </label>
              <input
                id="pro-email"
                name="email"
                type="email"
                required
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
                className="field"
                placeholder={PHONE.local}
              />
            </div>
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
          {status && !status.ok ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
          ) : null}
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? "Activating…" : "Confirm my plan"}
          </button>
          <p className="text-center text-[10.5px] text-ink-400">
            No card needed for this demo. You can cancel before payment is collected.
          </p>
          <p className="text-center text-[10.5px] text-ink-400">
            Plan questions:{" "}
            <a href={mailto(CONTACT.jobSeekerPro, "Job Seeker Pro")} className="font-semibold text-brand-700 hover:text-brand-900">
              {CONTACT.jobSeekerPro}
            </a>
            {" · "}
            Billing:{" "}
            <a href={mailto(CONTACT.billings, "Billing")} className="font-semibold text-brand-700 hover:text-brand-900">
              {CONTACT.billings}
            </a>
          </p>
        </form>
      </Modal>
    </section>
  );
}
