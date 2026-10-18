import type { CategoryInfo, JobStats, Testimonial } from "@/types";

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

export const CATEGORY_INFO: CategoryInfo[] = [
  {
    name: "Technology",
    slug: "technology",
    blurb: "Software, data, product & IT support roles",
    openings: 4,
  },
  {
    name: "Banking & Finance",
    slug: "banking-finance",
    blurb: "Fintech, commercial banks & microfinance",
    openings: 3,
  },
  {
    name: "Oil & Gas",
    slug: "oil-gas",
    blurb: "Upstream, downstream & HSE opportunities",
    openings: 2,
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    blurb: "Nursing, pharmacy, lab & hospital admin",
    openings: 2,
  },
  {
    name: "Customer Service",
    slug: "customer-service",
    blurb: "Support, call centre & client experience",
    openings: 2,
  },
  {
    name: "Engineering",
    slug: "engineering",
    blurb: "Civil, mechanical, electrical & projects",
    openings: 2,
  },
  {
    name: "Agriculture",
    slug: "agriculture",
    blurb: "Agribusiness, extension & agro-processing",
    openings: 2,
  },
  {
    name: "Education",
    slug: "education",
    blurb: "Teaching, school leadership & EdTech",
    openings: 2,
  },
  {
    name: "Sales & Marketing",
    slug: "sales-marketing",
    blurb: "Field sales, digital marketing & growth",
    openings: 2,
  },
];

export const STATS: JobStats = {
  liveJobs: 1842,
  hiringCompanies: 326,
  activeSeekers: 47820,
  statesCovered: 37,
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Adaeze Okonkwo",
    role: "Data Analyst",
    location: "Lagos",
    quote:
      "I had been applying for eight months with no reply. After the CV rewrite, I got three interview invites in eleven days and accepted an offer in Lekki.",
    initials: "AO",
    tint: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Ibrahim Lawal",
    role: "HSE Officer",
    location: "Port Harcourt",
    quote:
      "The daily WhatsApp alerts are the real deal. I saw a role before it hit other boards, applied that night and resumed in Trans-Amadi the next month.",
    initials: "IL",
    tint: "bg-amber-100 text-amber-700",
  },
  {
    name: "Chiamaka Eze",
    role: "Graduate Trainee",
    location: "Enugu",
    quote:
      "As a fresh graduate with no network, the referral track opened doors. Somebody actually called me on a Tuesday afternoon — I will never forget that call.",
    initials: "CE",
    tint: "bg-sky-100 text-sky-700",
  },
];

export const TOP_COMPANIES = [
  "Flutterwave",
  "Access Bank",
  "MTN Nigeria",
  "Shell Nigeria",
  "Dangote Group",
  "Interswitch",
  "GTBank",
  "Andela",
];

export const PRO_FEATURES = [
  {
    title: "Professional CV & LinkedIn rewrite",
    description:
      "ATS-ready rewrite by a recruiter who has screened for Nigerian banks, telcos and oil majors.",
  },
  {
    title: "Daily WhatsApp job alerts",
    description:
      "Fresh shortlist-ready roles in your state and field, delivered before they trend publicly.",
  },
  {
    title: "Direct referrals to hiring managers",
    description:
      "Warm introductions to vetted employers so a human actually sees your application.",
  },
  {
    title: "Interview coaching in Nigerian context",
    description:
      "Salary negotiation scripts, aptitude prep and mock panels with real feedback.",
  },
];
