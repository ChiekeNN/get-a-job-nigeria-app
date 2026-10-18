/**
 * Every address the site uses, in one place.
 *
 * Nothing else in the codebase should hardcode an email address — import from
 * here instead, so changing a mailbox is a one-line edit.
 */

export const CONTACT_DOMAIN = "getajob.com.ng";

export const CONTACT = {
  alerts: "alerts@getajob.com.ng",
  billings: "billings@getajob.com.ng",
  ceo: "ceo@getajob.com.ng",
  cvWriting: "cvwritingservices@getajob.com.ng",
  expiredListings: "expiredjoblistings@getajob.com.ng",
  info: "info@getajob.com.ng",
  jobSeekerPro: "jobseekerpro@getajob.com.ng",
  orders: "orders@getajob.com.ng",
  support: "support@getajob.com.ng",
} as const;

export type ContactKey = keyof typeof CONTACT;

export type ContactAudience = "Job seekers" | "Employers" | "Everyone";

export interface ContactChannel {
  key: ContactKey;
  email: string;
  label: string;
  purpose: string;
  audience: ContactAudience;
  /** Pre-filled subject so enquiries arrive already sorted. */
  subject: string;
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    key: "support",
    email: CONTACT.support,
    label: "General support",
    purpose: "Account help, application problems, reporting a recruiter who asks for money.",
    audience: "Everyone",
    subject: "Support request",
  },
  {
    key: "info",
    email: CONTACT.info,
    label: "General enquiries",
    purpose: "Questions about the platform, partnerships, press and everything else.",
    audience: "Everyone",
    subject: "Enquiry",
  },
  {
    key: "alerts",
    email: CONTACT.alerts,
    label: "Job alerts",
    purpose: "Daily and weekly job alerts — subscribing, changing your field or unsubscribing.",
    audience: "Job seekers",
    subject: "Job alerts",
  },
  {
    key: "jobSeekerPro",
    email: CONTACT.jobSeekerPro,
    label: "Job Seeker Pro",
    purpose: "Pro membership, referrals, interview coaching and your 48-hour CV turnaround.",
    audience: "Job seekers",
    subject: "Job Seeker Pro",
  },
  {
    key: "cvWriting",
    email: CONTACT.cvWriting,
    label: "CV writing service",
    purpose: "Submit a CV for rewriting, or follow up on a rewrite already in progress.",
    audience: "Job seekers",
    subject: "CV writing service",
  },
  {
    key: "expiredListings",
    email: CONTACT.expiredListings,
    label: "Report an expired listing",
    purpose: "Tell us about a role that has closed or a link that no longer works.",
    audience: "Job seekers",
    subject: "Expired job listing",
  },
  {
    key: "orders",
    email: CONTACT.orders,
    label: "Orders",
    purpose: "Order confirmations, receipts and anything about a purchase you have made.",
    audience: "Everyone",
    subject: "Order",
  },
  {
    key: "billings",
    email: CONTACT.billings,
    label: "Billing & invoices",
    purpose: "Invoices, payment plans, refunds and Pro subscription billing.",
    audience: "Everyone",
    subject: "Billing",
  },
  {
    key: "ceo",
    email: CONTACT.ceo,
    label: "Office of the CEO",
    purpose: "Escalations, formal complaints and matters that need a senior decision.",
    audience: "Everyone",
    subject: "Escalation",
  },
];

/** Build a mailto link with a subject and, optionally, a body. */
export function mailto(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}

export function contactChannel(key: ContactKey): ContactChannel {
  const channel = CONTACT_CHANNELS.find((item) => item.key === key);
  if (!channel) throw new Error(`Unknown contact channel: ${key}`);
  return channel;
}
