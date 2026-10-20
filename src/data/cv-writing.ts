/**
 * Professional CV writing — the paid, one-off service.
 *
 * Copy lives here so the page, the order form and the navigation can never
 * disagree about a price or what a package includes.
 */

export const CV_WRITING = {
  name: "CV Writing",
  /** The headline the page is built around. */
  headline: "Get a professional CV that gets you interviews.",
  headlineAccent: "Written by Nigerian HR experts.",
  promise:
    "Pay ₦5,000 once and let Nigerian HR experts rewrite your CV so recruiters actually notice you and call you — even if you have been ignored before.",
  /** Printed on the cards and in the form. */
  fromPrice: "₦5,000",
  turnaround: "2–3 working days",
  /** Stored on the subscriber row, so the admin console can group orders. */
  planPrefix: "CV Writing",
  cta: "Order my CV rewrite",
} as const;

export interface CvPackage {
  id: "basic" | "standard" | "premium";
  name: string;
  price: string;
  blurb: string;
  features: string[];
  popular?: boolean;
}

/** The three packages, exactly as sold on the order form. */
export const CV_PACKAGES: CvPackage[] = [
  {
    id: "basic",
    name: "Basic",
    price: "₦5,000",
    blurb: "A clean, ATS-ready rewrite for a straightforward job search.",
    features: [
      "Professional CV rewrite",
      "PDF & Word DOC format",
      "ATS-optimised layout",
      "Written for Nigerian recruiters",
      "Delivered in 2–3 working days",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "₦10,000",
    blurb: "The CV, a cover letter and LinkedIn — the full first impression.",
    popular: true,
    features: [
      "Everything in Basic",
      "Powerful cover letter",
      "LinkedIn profile optimisation",
      "2 rounds of revisions",
      "Delivered in 2–3 working days",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₦15,000",
    blurb: "Targeted at the roles you actually want, positioned for seniority.",
    features: [
      "Everything in Standard",
      "Job-specific CV targeting",
      "Strategic positioning for senior roles",
      "3 rounds of revisions",
      "Priority delivery",
    ],
  },
];

/** The four promises under the hero. */
export const CV_PROMISES = [
  {
    title: "Built to get replies",
    body: "Stop sending applications into silence. Your CV is rewritten to stand out from the hundreds of others in the pile.",
  },
  {
    title: "ATS-friendly",
    body: "Clean structure and real keywords, so online filters pass your CV to a human instead of binning it.",
  },
  {
    title: "PDF and Word",
    body: "Delivered in 2–3 working days in both formats, ready to send to employers the same day you get it.",
  },
  {
    title: "Private",
    body: "Your CV and your details stay between you and the writing team. Never sold, never shared with third parties.",
  },
] as const;

export const CV_STEPS = [
  {
    title: "Choose a package and pay once",
    body: "Pick Basic, Standard or Premium and pay the one-time amount by bank transfer. The account details are on the order form, and you upload your receipt in the same place.",
  },
  {
    title: "Send us your current CV",
    body: "Attach your current CV in the same WhatsApp chat — Word or PDF. Add your payment receipt and we can start straight away.",
  },
  {
    title: "A Nigerian CV writer reviews it",
    body: "An HR expert goes through your experience and messages you on WhatsApp if anything needs clarifying before the rewrite.",
  },
  {
    title: "Receive your new CV",
    body: "Within 2–3 working days your recruiter-ready CV arrives in PDF and Word, ready to start sending the same day.",
  },
] as const;

export const CV_ORDER_NOTES = [
  "One payment. No subscription, nothing renewing.",
  "Pay by bank transfer to Jojuni Technologies Ltd — the account is on the form.",
  "Upload your proof of payment in the same form; we confirm it the same working day.",
  "Send your current CV on WhatsApp once the payment is in, and the rewrite starts.",
  "Delivered in 2–3 working days as PDF and Word.",
] as const;

export const CV_FAQS = [
  {
    question: "Who is this for?",
    answer:
      "Fresh graduates, mid-level professionals and senior executives in any industry. The writer adjusts the tone and the level of detail to the roles you are actually going for.",
  },
  {
    question: "How do I pay?",
    answer:
      "By bank transfer to Jojuni Technologies Ltd at Fidelity Bank. The account details and the exact amount are on the order form; upload your proof of payment there and we confirm it the same working day. Basic is ₦5,000, Standard ₦10,000 and Premium ₦15,000 — charged once, nothing recurring.",
  },
  {
    question: "What do I get back?",
    answer:
      "A recruiter-ready CV in both PDF and Word, formatted to pass applicant tracking systems. Standard adds a cover letter and LinkedIn optimisation; Premium adds job-specific targeting.",
  },
  {
    question: "How fast is delivery?",
    answer:
      "2–3 working days from the moment we have your current CV and your payment. Premium orders are prioritised in the queue.",
  },
  {
    question: "Can I ask for changes?",
    answer:
      "Standard includes 2 rounds of revisions and Premium includes 3. Basic is a single rewrite, so use your one round to tell us anything we should adjust.",
  },
  {
    question: "Who sees my CV?",
    answer:
      "Only the GetAJob writing team. We never sell your details or pass your CV to employers or third parties without your permission.",
  },
  {
    question: "Is this the same as Job Seeker Pro?",
    answer:
      "No. Job Seeker Pro is the career service — alerts, coaching and referrals, with one CV rewrite included. This page is the standalone CV writing service. If you are already a Pro member, you do not need to order again.",
  },
];
