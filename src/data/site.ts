
/**
 * Brand identity. Change a value here and the whole site follows — the wordmark,
 * page titles, legal entity, share cards and the saved-jobs storage key.
 *
 * The wordmark is split so it can be styled in two tones: `wordmarkLead` + `wordmarkAccent`.
 */
export const BRAND = {
  name: "GetAJob",
  wordmarkLead: "GetA",
  wordmarkAccent: "Job",
  tagline: "Nigeria job network",
  domain: "getajob.com.ng",
  url: "https://getajob.com.ng",
  /** Trading name used in the copyright line. */
  tradingName: "GetAJob Nigeria",
  /** The company that owns and operates the site. */
  legalName: "Jojuni Technologies Ltd",
  legalRegistration: "RC 8430792",
  /** Single source of truth for the footer copyright. */
  copyrightHolder: "Jojuni Technologies Ltd",
  /** Used in <title> defaults and social cards. */
  metaTitle: "GetAJob — Jobs in Nigeria, verified and recruiter-backed",
  metaDescription:
    "Find verified jobs across all 36 Nigerian states and the FCT. Transparent Naira salaries, one-click applications, CV reviews and daily WhatsApp alerts.",
  storageKey: "getajob:saved-jobs",
  /** Bots and API clients identify themselves with this. */
  botName: "GetAJobBot",
} as const;

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const SALARY_BRACKETS = [
  { label: "Any salary", value: 0 },
  { label: "₦50,000+", value: 50000 },
  { label: "₦100,000+", value: 100000 },
  { label: "₦200,000+", value: 200000 },
  { label: "₦350,000+", value: 350000 },
  { label: "₦500,000+", value: 500000 },
  { label: "₦1,000,000+", value: 1000000 },
] as const;

export const PRO_FEATURES = [
  {
    title: "Professional CV & LinkedIn rewrite",
    description:
      "ATS-ready rewrite by a recruiter who has screened for Nigerian banks, telcos and oil majors.",
  },
  {
    title: "WhatsApp job alerts",
    description:
      "Fresh shortlist-ready roles in your state and field, delivered before they trend publicly.",
  },
  {
    title: "Referral support for your applications",
    description:
      "We help your application reach a person rather than an inbox.",
  },
  {
    title: "Interview coaching in Nigerian context",
    description:
      "Salary negotiation scripts, aptitude prep and mock panels with real feedback.",
  },
];
