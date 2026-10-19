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
  /** The one plan. */
  price: "₦8,000",
  cadence: "per month",
  trialDays: 7,
  /** Stored on the subscriber row, so the admin console can group signups. */
  plan: "Job Seeker Pro · ₦8,000/month",
  /** The call to action, everywhere it appears. */
  cta: "Start Now",
  headline: "Stop applying without results.",
  headlineAccent: "Let employers start calling you.",
  promise:
    "Everything you need to get hired faster — a professional CV rewrite, verified WhatsApp job alerts, direct referrals and interview coaching, for one monthly fee.",
  priceLine: "Only ₦8,000/month — start with a 7-day free trial.",
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
    title: "Sign up and start your free trial",
    description:
      "Fill in the form on this page. No payment for the first 7 days — you get access to everything immediately.",
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

export const PRO_STORIES = [
  {
    quote:
      "I never realised how much a professionally written CV could make a difference. Within weeks of joining Job Seeker Pro I was called for interviews at top companies, and I finally landed a role in a multinational firm.",
    name: "Chioma Eze",
    location: "Lagos",
    initials: "CE",
  },
  {
    quote:
      "The daily WhatsApp alerts are a game changer. I applied to a job the same day it was posted and got the interview before anyone else. The interview coaching made sure I was fully prepared.",
    name: "Tunde Akinyemi",
    location: "Abuja",
    initials: "TA",
  },
  {
    quote:
      "After struggling to get callbacks for months, I joined Job Seeker Pro. The CV rewrite alone was worth it — within 30 days I had three interviews and accepted an offer I'm very proud of.",
    name: "David Nwachukwu",
    location: "Port Harcourt",
    initials: "DN",
  },
];

/** The six lines on the pricing card. */
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
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no long-term contracts. Reply on WhatsApp and the subscription stops at the end of the current month — no penalties.",
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
    question: "How do I pay after the free trial?",
    answer:
      "By bank transfer. Our team sends the account details and instructions on WhatsApp before your trial ends, so you are never caught off guard — and nothing is collected automatically.",
  },
];
