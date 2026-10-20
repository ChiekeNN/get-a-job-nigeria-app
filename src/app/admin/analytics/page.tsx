import type { Metadata } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { adminConfigured, isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Traffic",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminAnalyticsPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }

  return <AnalyticsDashboard />;
}
