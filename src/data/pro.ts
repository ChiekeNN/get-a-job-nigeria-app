import {
  BellRing,
  CalendarCheck,
  FileText,
  Headset,
  Mic,
  type LucideIcon,
} from "lucide-react";

/**
 * Job Seeker Pro — the paid career service.
 *
 * Everything the homepage teaser and the /pro page say lives here, so the
 * price, the promise and the inclusions can never drift apart between the two.
 */

export const PRO = {
  name: "Job Seeker Pro",
  /** The one plan: a single payment, no subscription. */
  price: "₦15,300",
  cadence: "one-time",
  /** Stored on the subscriber row, so the admin console can group signups. */
  plan: "Job Seeker Pro · ₦15,300 one-time",
  /** The call to action, everywhere it appears. */
  cta: "Start Now",
  headline: "Stop applying without results.",
  headlineAccent: "Let employers start calling you.",
  promise:
    "Everything you need to get hired faster — a professional CV rewrite, verified WhatsApp job alerts, direct referrals and interview coaching — for one payment of ₦15,300.",
  priceLine: "₦15,300 once. No monthly fees, no renewals.",
} as const;

export interface ProFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PRO_FEATURES: ProFeature[] = [
  {
    title: "Professional CV rewrite",
    description:
      "Included once when you join. Our Nigerian HR experts rewrite your CV so recruiters actually notice you and call you for interviews.",
    icon: FileText,
  },
  {
    title: "WhatsApp job alerts",
    description:
      "Verified openings sent straight to your WhatsApp before they fill up. Every morning, matched to your skills and your state.",
    icon: BellRing,
  },
  {
    title: "Interview prep before each interview",
    description:
      "Before every interview we coach you for that company and that role, so you walk in prepared instead of hoping for the best.",
    icon: Mic,
  },
  {
    title: "Application tracking",
    description:
      "We log every application you send with us, tell you the right day to follow up, and keep the whole search in one place.",
    icon: CalendarCheck,
  },
  {
    title: "Priority WhatsApp support",
    description:
      "A direct line to the career support team. Answers, guidance and encouragement when you need it most — no ticket queue.",
    icon: Headset,
  },
];

/** The five things members tell us they were living with before joining. */
export const PRO_PAIN_POINTS = [
  "Sending dozens of applications with zero response",
  "Your CV gets filtered out before a human even sees it",
  "You can't tell which jobs are real and which are fake",
  "No one to guide you through the interview process",
  "Missing out on jobs because you heard about them too late",
];

export const PRO_STEPS = [
  {
    title: "Sign up and pay once",
    description:
      "Fill in the form on this page and we send the payment details on WhatsApp. ₦15,300 once covers everything below.",
  },
  {
    title: "Submit your CV for a rewrite",
    description:
      "Our Nigerian HR experts review and rewrite your CV so it passes ATS filters and gets noticed by recruiters.",
  },
  {
    title: "Receive job alerts on WhatsApp",
    description:
      "Every morning, verified openings that match your skills and location are sent directly to your WhatsApp.",
  },
  {
    title: "Get referred and coached for interviews",
    description:
      "When an interview comes, we prepare you specifically for that company and introduce you to the hiring manager.",
  },
  {
    title: "Get hired faster",
    description:
      "The right CV, the right alerts and the right preparation — you land the role faster than applying alone.",
  },
];

export const PRO_INCLUDED = [
  "Professional CV rewrite (included once)",
  "Verified job alerts on WhatsApp",
  "Interview prep before each interview",
  "Referrals to hiring managers",
  "Application tracking and follow-up reminders",
  "Priority WhatsApp support",
];

export const PRO_FAQS = [
  {
    question: "How quickly will my CV be rewritten?",
    answer:
      "Your rewrite is delivered within 2–3 working days after you send your CV to our team on WhatsApp.",
  },
  {
    question: "How are job alerts sent?",
    answer:
      "Straight to your WhatsApp number, every day. You choose your state and field when you sign up, and you can change them any time by replying to the message.",
  },
  {
    question: "Is this a one-time payment?",
    answer:
      "Yes. You pay ₦15,300 once and that covers the full programme. There is no monthly charge, no renewal and no card kept on file.",
  },
  {
    question: "What types of jobs are included?",
    answer:
      "Every industry and all 36 states plus the FCT, from entry level to senior management. If we cannot verify a listing, it never reaches your phone.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Pro members have a priority WhatsApp line to the career team. The same number answers general questions before you join.",
  },
  {
    question: "How do I pay?",
    answer:
      "By bank transfer. Our team sends the account details and the ₦15,300 instruction on WhatsApp as soon as you sign up — nothing is collected automatically.",
  },
];
