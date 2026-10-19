import { BadgeCheck, BellRing, MapPin, Sparkles, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroSearch } from "@/components/home/HeroSearch";

export function Hero() {
  return (
    <section className="hero-mesh relative overflow-hidden border-b border-ink-100/80">
      <div className="grid-lines absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="wrap relative grid grid-cols-1 items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.06fr_0.94fr] lg:py-16">
        <div className="animate-fade-up">
          <p className="eyebrow">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            Trusted by 47,000+ Nigerian job seekers
          </p>

          <h1 className="mt-4 font-display text-[30px] font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-[42px] lg:text-[46px]">
            Stop Applying Without Results.{" "}
            <span className="relative inline-block text-brand-700">
              Let Employers Start Calling You.
              <svg
                className="absolute -bottom-1 left-0 h-2.5 w-full text-brand-300"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9c48-6 100-8 148-7 48 1 95 4 148 1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-ink-600 sm:text-base">
            Verified openings from Lagos to Maiduguri, with real Naira salaries and recruiters who
            actually reply. Search once, get matched, and walk into interviews prepared.
          </p>

          <HeroSearch />

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  ["AO", "bg-emerald-100 text-emerald-700"],
                  ["IL", "bg-amber-100 text-amber-800"],
                  ["CE", "bg-sky-100 text-sky-700"],
                  ["TB", "bg-violet-100 text-violet-700"],
                ].map(([initials, tint]) => (
                  <span
                    key={initials}
                    className={`grid size-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold ${tint}`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3 fill-current" aria-hidden="true" />
                  ))}
                  <span className="ml-1 text-[11px] font-bold text-ink-700">4.8/5</span>
                </div>
                <p className="text-[11px] text-ink-500">from 2,148 placed candidates</p>
              </div>
            </div>
            <span className="hidden h-8 w-px bg-ink-200 sm:block" aria-hidden="true" />
            <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-600">
              <BadgeCheck className="size-4 text-brand-600" aria-hidden="true" />
              No recruiter fees. Ever.
            </p>
          </div>
        </div>

        <div className="animate-fade-up delay-1 relative mx-auto w-full max-w-[420px] lg:max-w-none">
          <div className="absolute -left-4 top-8 hidden size-20 rounded-2xl border border-brand-200 bg-white/70 backdrop-blur sm:block" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white p-2 shadow-[0_30px_70px_-40px_rgba(5,20,15,0.55)]">
            <div className="relative overflow-hidden rounded-[20px]">
              <Image
                src="https://images.pexels.com/photos/36551042/pexels-photo-36551042.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800"
                alt="Nigerian professional smiling after being shortlisted for a role"
                width={800}
                height={1000}
                priority
                unoptimized
                className="h-[320px] w-full object-cover object-top sm:h-[400px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-transparent p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-200">
                  This week on GetAJob
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  412 candidates invited to interview
                </p>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -left-3 top-16 w-[190px] rounded-xl border border-ink-100 bg-white p-3 shadow-[0_18px_40px_-24px_rgba(5,20,15,0.4)] sm:-left-6">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <BellRing className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                  New alert
                </p>
                <p className="text-[11px] font-bold text-ink-900">Shortlisted ✅</p>
              </div>
            </div>
            <p className="mt-2 text-[10.5px] leading-snug text-ink-500">
              Access Bank viewed your profile 4 minutes ago.
            </p>
          </div>

          <div className="absolute -bottom-4 right-0 w-[205px] rounded-xl border border-ink-100 bg-white p-3 shadow-[0_18px_40px_-24px_rgba(5,20,15,0.4)] sm:-right-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                Offer received
              </p>
              <TrendingUp className="size-3.5 text-brand-600" aria-hidden="true" />
            </div>
            <p className="mt-1 font-display text-lg font-extrabold text-ink-900">₦650,000</p>
            <p className="text-[10.5px] text-ink-500">HSE Officer · Port Harcourt</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-brand-700">
              <Sparkles className="size-3" aria-hidden="true" />
              2.1x salary jump after CV rewrite
            </div>
          </div>

          <div className="absolute -right-2 top-4 hidden items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[10.5px] font-semibold text-white shadow-lg sm:flex">
            <MapPin className="size-3 text-brand-300" aria-hidden="true" />
            Lagos · Abuja · PH · Ibadan
          </div>
        </div>
      </div>

      <div className="wrap relative pb-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 backdrop-blur">
          <span className="hidden sm:inline">Hiring on GetAJob:</span>
          {["Paystack", "Access Bank", "MTN", "Shell", "Dangote", "Interswitch", "GTBank"].map(
            (company) => (
              <span key={company} className="text-ink-500/80">
                {company}
              </span>
            ),
          )}
        </div>
      </div>
      <Link href="/jobs" className="sr-only">
        Browse all Nigerian jobs
      </Link>
    </section>
  );
}
