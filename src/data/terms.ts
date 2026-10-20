import { BRAND } from "@/data/site";
import { CONTACT, PHONE } from "@/data/contact";
import { CV_PACKAGES, CV_WRITING } from "@/data/cv-writing";
import { BANK } from "@/data/payment";
import { PRO } from "@/data/pro";

/**
 * Terms & Conditions.
 *
 * The text mirrors the terms published on the WordPress site, with two
 * corrections so it cannot contradict the product it governs:
 *   1. the operating company is Jojuni Technologies Ltd, not a third party;
 *   2. Job Seeker Pro is a one-time payment, not a monthly subscription.
 *
 * Prices are imported rather than typed, so a change on the Pro or CV pages
 * can never leave the terms quoting an old number.
 */

export const TERMS_LAST_UPDATED = "October 2026";

type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "warn"; text: string }
  | { kind: "sub"; title: string; blocks: Block[] };

export interface TermsSection {
  id: string;
  number: string;
  title: string;
  blocks: Block[];
}

const company = `${BRAND.legalName} (${BRAND.legalRegistration})`;

export const TERMS_INTRO =
  "Please read these terms carefully before using GetAJob.com.ng. By accessing our platform, you agree to be bound by them.";

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    number: "1",
    title: "Acceptance of terms",
    blocks: [
      {
        kind: "p",
        text: `By accessing, browsing or using the website ${BRAND.domain} ("the Platform"), you confirm that you have read, understood and agree to be bound by these Terms and Conditions ("Terms") and our privacy policy.`,
      },
      {
        kind: "p",
        text: "If you do not agree with any part of these Terms, you must stop using the Platform. Your continued use of the Platform constitutes your acceptance of any changes to these Terms.",
      },
      {
        kind: "warn",
        text: `These Terms are a legally binding agreement between you and ${company}, the owner and operator of GetAJob.com.ng.`,
      },
    ],
  },
  {
    id: "about",
    number: "2",
    title: "About GetAJob.com.ng",
    blocks: [
      {
        kind: "p",
        text: `GetAJob.com.ng is a Nigerian online job board and career services platform owned and operated by ${company}. We provide:`,
      },
      {
        kind: "list",
        items: [
          "An online platform connecting job seekers with employers across Nigeria",
          "Professional CV writing and cover letter services",
          "LinkedIn profile optimisation",
          "Interview coaching and career counselling",
          "The Job Seeker Pro career service",
          "Job posting and recruitment services for employers",
        ],
      },
      {
        kind: "p",
        text: "We serve job seekers and employers across all 36 states of Nigeria and the Federal Capital Territory (FCT), Abuja.",
      },
    ],
  },
  {
    id: "eligibility",
    number: "3",
    title: "Eligibility",
    blocks: [
      { kind: "p", text: "To use GetAJob.com.ng, you must:" },
      {
        kind: "list",
        items: [
          "Be at least 18 years of age",
          "Be legally permitted to work in Nigeria or be a registered Nigerian business entity",
          "Provide accurate, current and complete information when registering",
          "Not have been previously suspended or banned from the Platform",
        ],
      },
      {
        kind: "p",
        text: `By registering, you confirm that all information you provide is truthful and accurate. ${BRAND.legalName} reserves the right to verify your identity and eligibility at any time.`,
      },
    ],
  },
  {
    id: "accounts",
    number: "4",
    title: "User accounts",
    blocks: [
      {
        kind: "sub",
        title: "4.1 Registration",
        blocks: [
          {
            kind: "p",
            text: "To access certain features you must register for an account. You agree to provide accurate and complete registration information and to keep your account details up to date at all times.",
          },
        ],
      },
      {
        kind: "sub",
        title: "4.2 Account security",
        blocks: [
          {
            kind: "p",
            text: `You are responsible for keeping your password confidential and for all activity that happens under your account. Tell us immediately at ${CONTACT.info} if you suspect unauthorised use.`,
          },
        ],
      },
      {
        kind: "sub",
        title: "4.3 One account per user",
        blocks: [
          {
            kind: "p",
            text: "Each individual may maintain only one job seeker account. Employers may maintain one account per registered business entity. Creating multiple accounts to get around restrictions is prohibited.",
          },
        ],
      },
      {
        kind: "sub",
        title: "4.4 Account termination",
        blocks: [
          {
            kind: "p",
            text: "We may suspend or terminate any account that violates these Terms, engages in fraudulent activity, or is harmful to other users or to the Platform.",
          },
        ],
      },
    ],
  },
  {
    id: "jobseekers",
    number: "5",
    title: "Terms for job seekers",
    blocks: [
      {
        kind: "sub",
        title: "5.1 Free access",
        blocks: [
          {
            kind: "p",
            text: "Browsing and applying for jobs on GetAJob.com.ng is free for all registered job seekers. We will never charge a job seeker to apply for a job listed on the Platform.",
          },
        ],
      },
      {
        kind: "sub",
        title: "5.2 Accuracy of information",
        blocks: [
          {
            kind: "p",
            text: "You agree to provide truthful and accurate information in your profile, CV and applications. Submitting false qualifications, misrepresenting your experience or providing fraudulent documents is prohibited and may result in permanent suspension.",
          },
        ],
      },
      {
        kind: "sub",
        title: "5.3 Job applications",
        blocks: [
          {
            kind: "p",
            text: "When you apply for a job through the Platform you authorise us to share your application and CV with the relevant employer. We do not guarantee that your application will be reviewed or that you will receive a response.",
          },
        ],
      },
      {
        kind: "sub",
        title: "5.4 Warning — fraudulent employers",
        blocks: [
          {
            kind: "warn",
            text: `Never pay money to any employer as a condition of getting a job. Legitimate employers do not charge job seekers. If an employer asks you for payment, report it to us at ${CONTACT.info} or on WhatsApp at ${PHONE.local}.`,
          },
        ],
      },
      {
        kind: "sub",
        title: "5.5 CV upload",
        blocks: [
          {
            kind: "p",
            text: `By uploading your CV you grant ${BRAND.legalName} a non-exclusive licence to store it and share it with employers relevant to your job search preferences. You keep ownership of the CV itself.`,
          },
        ],
      },
    ],
  },
  {
    id: "employers",
    number: "6",
    title: "Terms for employers",
    blocks: [
      {
        kind: "sub",
        title: "6.1 Job listings",
        blocks: [
          {
            kind: "p",
            text: "Employers may post vacancies on GetAJob.com.ng subject to the applicable package fees. Every listing must be a genuine, legal employment opportunity based in Nigeria.",
          },
        ],
      },
      {
        kind: "sub",
        title: "6.2 Prohibited listings",
        blocks: [
          { kind: "p", text: "You may not post jobs that:" },
          {
            kind: "list",
            items: [
              "Require job seekers to pay any fee or make a purchase",
              "Promote pyramid schemes, multi-level marketing or get-rich-quick schemes",
              "Involve illegal activity of any kind",
              "Discriminate on grounds of gender, religion, ethnicity, disability or any other protected characteristic",
              "Contain false, misleading or inaccurate information",
            ],
          },
        ],
      },
      {
        kind: "sub",
        title: "6.3 Accuracy",
        blocks: [
          {
            kind: "p",
            text: "Employers are responsible for keeping listings accurate and current, and for removing or updating a listing once the position is filled.",
          },
        ],
      },
      {
        kind: "sub",
        title: "6.4 Candidate data",
        blocks: [
          {
            kind: "p",
            text: "Candidate information received through the Platform must be used solely for recruitment and handled in line with applicable Nigerian data protection law, including the Nigeria Data Protection Regulation (NDPR).",
          },
        ],
      },
    ],
  },
  {
    id: "services",
    number: "7",
    title: "Paid career services",
    blocks: [
      {
        kind: "p",
        text: "GetAJob.com.ng offers paid career services: CV writing, cover letter writing, LinkedIn optimisation, interview coaching and the Job Seeker Pro career service. All of them are one-time payments — there is no recurring charge on any of them.",
      },
      {
        kind: "sub",
        title: "7.1 Service delivery",
        blocks: [
          {
            kind: "p",
            text: `Career services are delivered within the timeframes stated on the relevant service page. CV rewrites are delivered within ${CV_WRITING.turnaround} of receiving payment and the materials we need from you.`,
          },
        ],
      },
      {
        kind: "sub",
        title: "7.2 Revisions",
        blocks: [
          {
            kind: "p",
            text: "The number of revisions included is stated in the package you buy. On the CV writing service: Basic is a single rewrite, Standard includes 2 rounds and Premium includes 3. Further revisions beyond that may be charged separately.",
          },
        ],
      },
      {
        kind: "sub",
        title: "7.3 Job Seeker Pro",
        blocks: [
          {
            kind: "p",
            text: `Job Seeker Pro is a one-time payment of ${PRO.price}. It includes a professional CV rewrite once, WhatsApp job alerts, interview preparation, referral support, application tracking and priority WhatsApp support. There is no monthly charge, nothing renews, and no card is kept on file.`,
          },
        ],
      },
      {
        kind: "sub",
        title: "7.4 CV writing packages",
        blocks: [
          {
            kind: "p",
            text: `The CV writing service is sold in three one-time packages: ${CV_PACKAGES.map(
              (item) => `${item.name} at ${item.price}`,
            ).join(", ")}. What each package includes is set out on the CV writing page at the time you order.`,
          },
        ],
      },
    ],
  },
  {
    id: "payments",
    number: "8",
    title: "Payments and refunds",
    blocks: [
      {
        kind: "sub",
        title: "8.1 Payment method",
        blocks: [
          {
            kind: "p",
            text: `Paid services are paid by bank transfer to ${company}. The account details and the exact amount are shown on the order form; upload a screenshot of your transfer receipt there and we confirm the payment before any work starts.`,
          },
          {
            kind: "p",
            text: `Our only account is ${BANK.accountName}, ${BANK.bank}, account number ${BANK.accountNumber}. Any other account number, however official it looks, is not ours.`,
          },
          {
            kind: "p",
            text: `Never send money to any other account claiming to represent GetAJob. If the details you receive differ from what is confirmed on ${PHONE.display}, stop and contact us.`,
          },
        ],
      },
      {
        kind: "sub",
        title: "8.2 Refunds",
        blocks: [
          {
            kind: "p",
            text: `We are committed to delivering quality work. If you are not satisfied with a delivered service, contact us within 48 hours of delivery on WhatsApp at ${PHONE.local} or by email at ${CONTACT.info}, and we will work to resolve it.`,
          },
          {
            kind: "p",
            text: `Refunds are issued at the discretion of ${BRAND.legalName}. No refund is issued for:`,
          },
          {
            kind: "list",
            items: [
              "Services that have already been fully delivered",
              "Job Seeker Pro or CV writing fees once the work has been delivered",
              "Job listing fees once a listing has gone live",
            ],
          },
        ],
      },
      {
        kind: "sub",
        title: "8.3 Pricing",
        blocks: [
          {
            kind: "p",
            text: "All prices are in Nigerian Naira (₦) and may change without prior notice. The price that applies to your purchase is the one shown at the time you pay.",
          },
        ],
      },
    ],
  },
  {
    id: "conduct",
    number: "9",
    title: "Prohibited conduct",
    blocks: [
      { kind: "p", text: "You agree not to use GetAJob.com.ng to:" },
      {
        kind: "list",
        items: [
          "Post false, misleading or fraudulent content",
          "Impersonate any person, company or organisation",
          "Harvest or collect the personal data of other users without consent",
          "Send unsolicited commercial messages to other users",
          "Interfere with the proper functioning of the Platform",
          "Attempt to gain unauthorised access to any part of the Platform",
          "Upload viruses, malware or any other malicious code",
          "Post content that is defamatory, obscene, abusive or otherwise objectionable",
          "Break any applicable Nigerian or international law",
          "Use the Platform for anything other than legitimate job searching or recruitment",
        ],
      },
      {
        kind: "p",
        text: "Breaking any of these may result in immediate suspension, a permanent ban and, where applicable, legal action.",
      },
    ],
  },
  {
    id: "intellectual",
    number: "10",
    title: "Intellectual property",
    blocks: [
      {
        kind: "p",
        text: `All content on GetAJob.com.ng — text, graphics, logos, icons, images and software — belongs to ${BRAND.legalName} and is protected by Nigerian and international copyright law.`,
      },
      {
        kind: "p",
        text: "You may not reproduce, distribute, modify or create derivative works from any content on the Platform without our written permission.",
      },
      {
        kind: "p",
        text: `Job seekers keep ownership of their CVs and personal information. By uploading content you grant ${BRAND.legalName} a limited licence to use it for the purpose of operating the Platform.`,
      },
    ],
  },
  {
    id: "privacy",
    number: "11",
    title: "Privacy and data protection",
    blocks: [
      {
        kind: "p",
        text: "Our collection and use of your personal data is governed by our privacy policy, which forms part of these Terms. See the legal centre for the privacy policy and the CV and data policy.",
      },
      {
        kind: "p",
        text: "By using GetAJob.com.ng you consent to the collection, processing and use of your personal information as described there, in line with the Nigeria Data Protection Regulation (NDPR) 2019.",
      },
      {
        kind: "p",
        text: "We never sell your personal data. Your information is used only to operate the Platform and deliver our services to you.",
      },
    ],
  },
  {
    id: "disclaimer",
    number: "12",
    title: "Disclaimers and limitation of liability",
    blocks: [
      {
        kind: "sub",
        title: "12.1 No employment guarantee",
        blocks: [
          {
            kind: "p",
            text: "We connect job seekers with employers. We do not guarantee that using the Platform or our services will result in a job. Placements depend on factors beyond our control.",
          },
        ],
      },
      {
        kind: "sub",
        title: "12.2 Third-party content",
        blocks: [
          {
            kind: "p",
            text: "Job listings are submitted by employers. We screen listings, but we cannot guarantee the accuracy or legitimacy of every one, and we are not responsible for the actions of employers or the outcome of an application.",
          },
        ],
      },
      {
        kind: "sub",
        title: "12.3 Limitation of liability",
        blocks: [
          {
            kind: "p",
            text: `To the fullest extent permitted by Nigerian law, ${BRAND.legalName} is not liable for any indirect, incidental, special or consequential damage arising from your use of the Platform or our services.`,
          },
        ],
      },
      {
        kind: "sub",
        title: "12.4 Platform availability",
        blocks: [
          {
            kind: "p",
            text: "We work to keep the Platform available at all times but do not guarantee uninterrupted access. We may take it offline for maintenance, updates or other reasons without notice.",
          },
        ],
      },
    ],
  },
  {
    id: "termination",
    number: "13",
    title: "Termination",
    blocks: [
      {
        kind: "p",
        text: "We may suspend or terminate your access at any time, with or without notice, including for a breach of these Terms.",
      },
      {
        kind: "p",
        text: `You may close your account at any time by contacting ${CONTACT.info}. Once an account is closed your right to use the Platform ends immediately.`,
      },
    ],
  },
  {
    id: "changes",
    number: "14",
    title: "Changes to these terms",
    blocks: [
      {
        kind: "p",
        text: `We may update these Terms at any time. Changes take effect when they are posted on the Platform, and your continued use after that means you accept them.`,
      },
      {
        kind: "p",
        text: "The date of the most recent revision is shown at the top of this page and on the legal centre.",
      },
    ],
  },
  {
    id: "contact",
    number: "15",
    title: "Contact us",
    blocks: [
      {
        kind: "p",
        text: "If you have any questions about these Terms and Conditions, contact us:",
      },
      {
        kind: "list",
        items: [
          `Email: ${CONTACT.info}`,
          `WhatsApp: ${PHONE.local}`,
          `Website: ${BRAND.domain}/contact`,
          `Company: ${BRAND.legalName} · ${BRAND.legalRegistration}`,
          "Postal address: 14 Adeola Odeku Street, Victoria Island, Lagos",
        ],
      },
      { kind: "p", text: "We aim to respond within 24–48 hours on business days." },
    ],
  },
];
