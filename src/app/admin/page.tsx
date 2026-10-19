import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { adminConfigured, isAdmin } from "@/lib/admin";

// The console reads live counts on every visit and must never be cached,
// prerendered, or indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin console",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }

  return <AdminDashboard />;
}
