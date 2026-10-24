"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useToast } from "@/components/providers/Toaster";
import { PHONE } from "@/data/contact";
import { NIGERIAN_STATES } from "@/data/site";
import { CATEGORIES, type ActionState } from "@/types";

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
        Join the free digest and still get verified roles on WhatsApp.
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
