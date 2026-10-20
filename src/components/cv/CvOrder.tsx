"use client";

import { ArrowRight, Check, CheckCircle2, MessageCircle, Star } from "lucide-react";
import { useState } from "react";

import { CheckoutFlow } from "@/components/payments/CheckoutFlow";
import { PHONE, whatsappLink } from "@/data/contact";
import { CV_ORDER_NOTES, CV_PACKAGES } from "@/data/cv-writing";

/**
 * Packages and payment, in one place.
 *
 * Picking a package updates the amount on the bank-transfer card beside the
 * form, so the price someone reads on the card is the price they are told to
 * transfer. The receipt upload is the payment record — there is no separate
 * order step any more.
 */
export function CvOrder() {
  const [selected, setSelected] = useState<(typeof CV_PACKAGES)[number]["id"]>("standard");

  return (
    <div>
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
                onClick={() => setSelected(item.id)}
                aria-pressed={active}
                className={`btn mt-4 w-full justify-center ${
                  item.popular ? "btn-amber" : "btn-outline"
                }`}
              >
                {active ? "Selected" : `Pay for ${item.name}`}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>

      <div
        id="order"
        className="mt-8 grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8"
      >
        <div className="min-w-0">
          <p className="eyebrow">
            <CheckCircle2 className="size-3.5 text-brand-600" aria-hidden="true" />
            Start here
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[32px]">
            Pay, then send us the receipt
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
            Transfer the package price to {""}
            <span className="font-semibold text-ink-700">Jojuni Technologies Ltd</span> at Fidelity
            Bank, then upload a screenshot of the receipt. We confirm it the same working day and the
            writers start.
          </p>

          <ul className="mt-4 space-y-2.5">
            {CV_ORDER_NOTES.map((note) => (
              <li
                key={note}
                className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-700"
              >
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
              href={whatsappLink("Hi GetAJob, I have a question about CV writing.")}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 block text-[13px] font-semibold text-brand-800 hover:text-brand-900"
            >
              {PHONE.display}
            </a>
            <p className="mt-1 text-[11px] text-brand-900/60">Monday to Saturday, 9am – 6pm.</p>
          </div>
        </div>

        <div className="min-w-0">
          <CheckoutFlow
            initialPlan={`cv-${selected}`}
            controlledPlan={`cv-${selected}`}
            compact
          />
        </div>
      </div>
    </div>
  );
}
