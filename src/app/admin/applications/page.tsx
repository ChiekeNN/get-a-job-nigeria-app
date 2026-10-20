import type { Metadata } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { ApplicationsConsole } from "@/components/admin/ApplicationsConsole";
import { adminConfigured, isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applications",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }

  // Deep link from the overview: /admin/applications?focus=123 opens that record.
  const { focus } = await searchParams;
  const focusId = Number(focus);
  return (
    <ApplicationsConsole focusId={Number.isInteger(focusId) && focusId > 0 ? focusId : undefined} />
  );
}
