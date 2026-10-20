/**
 * Where the money goes, and what it buys.
 *
 * One place for the bank details so the checkout page, the /pro page, the
 * /cv-writing page and the confirmation screen can never show a different
 * account number. If the account changes, it changes here.
 *
 * The prices mirror PRO.price and CV_PACKAGES — the catalogue below is the
 * single thing the payment record is built from, so an amount can never drift
 * away from the plan it was sold as.
 */

export const BANK = {
  accountName: "JOJUNI TECHNOLOGIES LIMITED",
  bank: "Fidelity Bank",
  accountNumber: "5601827280",
  /** What to write in the transfer narration. */
  narrationHint: "your full name",
} as const;

export interface PayPlan {
  /** Stable key stored on the payment row. */
  id: string;
  /** Three letters printed in the reference, e.g. GAJ-PRO-4K7Q. */
  code: string;
  name: string;
  /** Whole naira. Never a float, never a formatted string. */
  amount: number;
  price: string;
  blurb: string;
  /** "pro" payments create a Pro subscriber once the money is verified. */
  kind: "pro" | "cv";
}

export const PAY_PLANS: PayPlan[] = [
  {
    id: "pro",
    code: "PRO",
    name: "Job Seeker Pro",
    amount: 15_300,
    price: "₦15,300",
    blurb: "CV rewrite, WhatsApp job alerts, referrals and interview coaching — one payment.",
    kind: "pro",
  },
  {
    id: "cv-basic",
    code: "CVB",
    name: "CV Writing — Basic",
    amount: 5_000,
    price: "₦5,000",
    blurb: "A clean, ATS-ready rewrite of your CV, delivered in 2–3 working days.",
    kind: "cv",
  },
  {
    id: "cv-standard",
    code: "CVS",
    name: "CV Writing — Standard",
    amount: 10_000,
    price: "₦10,000",
    blurb: "The CV, a cover letter and a LinkedIn profile, with two rounds of revisions.",
    kind: "cv",
  },
  {
    id: "cv-premium",
    code: "CVP",
    name: "CV Writing — Premium",
    amount: 15_000,
    price: "₦15,000",
    blurb: "Job-specific targeting and senior positioning, with priority delivery.",
    kind: "cv",
  },
];

export function planById(id: string | null | undefined): PayPlan | null {
  if (!id) return null;
  return PAY_PLANS.find((plan) => plan.id === id) ?? null;
}

/** The amount printed on the bank-transfer instructions. */
export function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** What the buyer is told to upload — the phrase used everywhere. */
export const PROOF_LABEL = "Proof of payment";
export const PROOF_HINT =
  "A screenshot of your transfer receipt — the one showing the amount, the date and our account name. PNG, JPG or PDF, up to 4 MB.";
