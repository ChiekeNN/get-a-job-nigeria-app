"use client";

import {
  BriefcaseBusiness,
  ChevronDown,
  Lock,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { PHONE } from "@/data/contact";
import { PRO } from "@/data/pro";
import { BRAND } from "@/data/site";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Find Jobs", href: "/jobs" },
  { label: "CV Writing", href: "/cv-writing" },
  { label: "Advice", href: "/blog" },
  { label: "For Employers", href: "/employers" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isEmployer = pathname.startsWith("/employers");

  // The admin console is private and carries its own header.
  const isAdmin = pathname.startsWith("/admin");

  function switchMode(mode: "seeker" | "employer") {
    setMenuOpen(false);
    router.push(mode === "employer" ? "/employers" : "/jobs");
  }

  if (isAdmin) return null;

  return (
    <>
      <div className="hidden bg-ink-900 text-white lg:block">
        <div className="wrap flex h-9 items-center justify-between text-[11.5px]">
          <p className="flex items-center gap-2 text-white/80">
            <span aria-hidden="true">🇳🇬</span>
            Nigeria&apos;s placement-first job network — verified roles across the 36 states and FCT
          </p>
          <div className="flex items-center gap-5 text-white/75">
            <span>WhatsApp: {PHONE.display}</span>
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
            <Image
              src="/brand/mark.png"
              alt=""
              width={40}
              height={40}
              priority
              className="size-10 shrink-0"
              aria-hidden="true"
            />
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

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Main navigation">
            {LINKS.map((link) => {
              // "/" only matches itself; the others stay lit on their own pages.
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  // Five links plus the Pro pill have to fit in a 1200px bar:
                  // tighter padding from lg, roomier again from xl.
                  className={`whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition xl:px-3 ${
                    active
                      ? "bg-brand-50 text-brand-800"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/pro"
              aria-current={pathname.startsWith("/pro") ? "page" : undefined}
              className={`ml-1 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition ${
                pathname.startsWith("/pro")
                  ? "border-amber-300 bg-amber-100 text-amber-900"
                  : "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100"
              }`}
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              {PRO.name}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <div
              className="hidden items-center rounded-xl border border-ink-100 bg-ink-50 p-1 md:flex"
              role="group"
              aria-label="Switch between job seeker and employer views"
            >
              {/* The bar is capped at 1200px, so it is always full: the switch
                  shows icons only, with the words kept for screen readers. */}
              <button
                type="button"
                onClick={() => switchMode("seeker")}
                aria-pressed={!isEmployer}
                aria-label="Switch to the job seeker view"
                title="Job Seeker"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  !isEmployer
                    ? "bg-white text-brand-800 shadow-sm"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                <UserRound className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Job Seeker</span>
              </button>
              <button
                type="button"
                onClick={() => switchMode("employer")}
                aria-pressed={isEmployer}
                aria-label="Switch to the employer view"
                title="Employer"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  isEmployer
                    ? "bg-white text-brand-800 shadow-sm"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Employer</span>
              </button>
            </div>

            {/* The console's own door. It replaces the old "Upload CV" button,
                which only ever collected a filename — the apply form is where a
                CV is actually uploaded. */}
            <Link
              href="/admin"
              className="btn btn-outline btn-sm hidden sm:inline-flex"
              aria-label="Admin console"
            >
              <Lock className="size-4" aria-hidden="true" />
              Admin
            </Link>

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
              <Link
                href="/pro"
                onClick={() => setMenuOpen(false)}
                aria-current={pathname.startsWith("/pro") ? "page" : undefined}
                className="mb-1 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-3"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-amber-900">
                  <Sparkles className="size-4 text-amber-600" aria-hidden="true" />
                  {PRO.name}
                </span>
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-ink-950">
                  {PRO.price} once
                </span>
              </Link>
              {LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-ink-50 px-1 py-3 text-sm font-medium text-ink-700"
                >
                  {link.label}
                  <ChevronDown className="size-4 -rotate-90 text-ink-300" aria-hidden="true" />
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="btn btn-outline w-full"
              >
                <Lock className="size-4" aria-hidden="true" />
                Admin console
              </Link>
              <Link href="/pro#start" className="btn btn-amber w-full" onClick={() => setMenuOpen(false)}>
                <Sparkles className="size-4" aria-hidden="true" />
                {PRO.cta}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

    </>
  );
}
