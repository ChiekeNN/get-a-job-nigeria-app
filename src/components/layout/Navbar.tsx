"use client";

import {
  BriefcaseBusiness,
  ChevronDown,
  Menu,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CvUploadModal } from "@/components/forms/CvUploadModal";
import { BRAND } from "@/data/site";

const LINKS = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Browse Categories", href: "/#categories" },
  { label: "States", href: "/states" },
  { label: "For Employers", href: "/employers" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const isEmployer = pathname.startsWith("/employers");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function switchMode(mode: "seeker" | "employer") {
    setMenuOpen(false);
    router.push(mode === "employer" ? "/employers" : "/jobs");
  }

  return (
    <>
      <div className="hidden bg-ink-900 text-white lg:block">
        <div className="wrap flex h-9 items-center justify-between text-[11.5px]">
          <p className="flex items-center gap-2 text-white/80">
            <span aria-hidden="true">🇳🇬</span>
            Nigeria&apos;s placement-first job network — 1,800+ verified roles across 37 states
          </p>
          <div className="flex items-center gap-5 text-white/75">
            <span>WhatsApp: +234 803 000 4421</span>
            <Link href="/pro" className="flex items-center gap-1 font-semibold text-brand-300 hover:text-brand-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Job Seeker Pro
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-white/90 backdrop-blur-md">
        <div className="wrap flex h-16 items-center justify-between gap-3 sm:h-[68px]">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${BRAND.name} home`}>
            <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-[0_8px_18px_-10px_rgba(7,142,88,0.9)]">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[19px] font-extrabold tracking-tight text-ink-900">
                {BRAND.wordmarkLead}
                <span className="text-brand-600">{BRAND.wordmarkAccent}</span>
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                {BRAND.tagline}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {LINKS.map((link) => {
              const active =
                link.href === "/jobs"
                  ? pathname === "/jobs"
                  : pathname === link.href && link.href !== "/#categories";
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand-50 text-brand-800"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div
              className="hidden items-center rounded-xl border border-ink-100 bg-ink-50 p-1 md:flex"
              role="group"
              aria-label="Switch between job seeker and employer views"
            >
              <button
                type="button"
                onClick={() => switchMode("seeker")}
                aria-pressed={!isEmployer}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  !isEmployer
                    ? "bg-white text-brand-800 shadow-sm"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                <UserRound className="size-3.5" aria-hidden="true" />
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => switchMode("employer")}
                aria-pressed={isEmployer}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  isEmployer
                    ? "bg-white text-brand-800 shadow-sm"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
                Employer
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCvOpen(true)}
              className="btn btn-primary btn-sm hidden sm:inline-flex"
            >
              <Upload className="size-4" aria-hidden="true" />
              Upload CV
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="btn btn-outline btn-sm size-9 !p-0 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="mobile-navigation"
            className="animate-fade-up border-t border-ink-100 bg-white px-4 pb-5 pt-3 lg:hidden"
          >
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => switchMode("seeker")}
                className={`btn ${!isEmployer ? "btn-soft" : "btn-outline"}`}
              >
                <UserRound className="size-4" aria-hidden="true" />
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => switchMode("employer")}
                className={`btn ${isEmployer ? "btn-soft" : "btn-outline"}`}
              >
                <BriefcaseBusiness className="size-4" aria-hidden="true" />
                Employer
              </button>
            </div>
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between border-b border-ink-50 px-1 py-3 text-sm font-medium text-ink-700"
                >
                  {link.label}
                  <ChevronDown className="size-4 -rotate-90 text-ink-300" aria-hidden="true" />
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setCvOpen(true);
                }}
                className="btn btn-primary w-full"
              >
                <Upload className="size-4" aria-hidden="true" />
                Upload CV
              </button>
              <Link href="/pro" className="btn btn-outline w-full">
                <Sparkles className="size-4" aria-hidden="true" />
                Explore Job Seeker Pro
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <CvUploadModal open={cvOpen} onClose={() => setCvOpen(false)} />
    </>
  );
}
