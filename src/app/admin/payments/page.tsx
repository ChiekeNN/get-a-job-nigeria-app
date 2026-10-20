import type { Metadata } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { PaymentsConsole } from "@/components/admin/PaymentsConsole";
import { adminConfigured, isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPaymentsPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }

  return <PaymentsConsole />;
}
