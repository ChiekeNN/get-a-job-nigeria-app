import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/providers/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NaijaHire — Jobs in Nigeria, verified and recruiter-backed",
    template: "%s | NaijaHire",
  },
  description:
    "Find verified jobs across all 36 Nigerian states and the FCT. Transparent Naira salaries, one-click applications, CV reviews and daily WhatsApp alerts.",
  keywords: [
    "jobs in Nigeria",
    "Lagos jobs",
    "Abuja jobs",
    "Port Harcourt jobs",
    "graduate trainee Nigeria",
    "NaijaHire",
  ],
  openGraph: {
    title: "NaijaHire — Stop applying without results",
    description:
      "1,800+ verified Nigerian job openings, real Naira salaries and referrals that get employers calling you.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#078e58",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen bg-cream text-ink-900 antialiased">
        <ToastProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
