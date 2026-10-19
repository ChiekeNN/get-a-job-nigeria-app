"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";

/**
 * The admin console is a private workspace: it keeps the brand footer out of
 * the way so the dashboard fills the screen.
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Footer />;
}
