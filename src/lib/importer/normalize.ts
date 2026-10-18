import { NIGERIAN_STATES } from "@/data/site";
import { SOURCE_FEED } from "@/lib/importer/config";
import { JOB_TYPES } from "@/types";
import { initialsFor, slugify } from "@/lib/format";

/** Towns and abbreviations the source uses that are not state names. */
const CITY_TO_STATE: Record<string, string> = {
  abuja: "FCT Abuja",
  fct: "FCT Abuja",
  "fct abuja": "FCT Abuja",
  garki: "FCT Abuja",
  wuse: "FCT Abuja",
  maitama: "FCT Abuja",
  ikeja: "Lagos",
  lekki: "Lagos",
  "victoria island": "Lagos",
  "vi": "Lagos",
  ikoyi: "Lagos",
  yaba: "Lagos",
  surulere: "Lagos",
  apapa: "Lagos",
  "port harcourt": "Rivers",
  ph: "Rivers",
  bonny: "Rivers",
  "warri": "Delta",
  asaba: "Delta",
  uyo: "Akwa Ibom",
  calabar: "Cross River",
  benin: "Edo",
  "benin city": "Edo",
  ibadan: "Oyo",
  osogbo: "Osun",
  ilorin: "Kwara",
  kano: "Kano",
  kaduna: "Kaduna",
  jos: "Plateau",
  maiduguri: "Borno",
  enugu: "Enugu",
  aba: "Abia",
  umuahia: "Abia",
  owerri: "Imo",
  akure: "Ondo",
  abeokuta: "Ogun",
  sagamu: "Ogun",
  ota: "Ogun",
  makurdi: "Benue",
  lafia: "Nasarawa",
  minna: "Niger",
  lokoja: "Kogi",
  gombe: "Gombe",
  damaturu: "Yobe",
  yola: "Adamawa",
  jalingo: "Taraba",
  bauchi: "Bauchi",
  sokoto: "Sokoto",
  katsina: "Katsina",
  birnin: "Kebbi",
  "birnin kebbi": "Kebbi",
  awka: "Anambra",
  onitsha: "Anambra",
  "nnewi": "Anambra",
  yenagoa: "Bayelsa",
  "ado ekiti": "Ekiti",
  ado: "Ekiti",
  dutse: "Jigawa",
  gusau: "Zamfara",
};

const STATES_LOWER = new Map(NIGERIAN_STATES.map((state) => [state.toLowerCase(), state]));

/** Find the first Nigerian state mentioned in a blob of location text. */
export function detectState(...candidates: string[]): string {
  const blob = candidates.filter(Boolean).join(", ");
  const lower = blob.toLowerCase();
  if (!lower.trim()) return "Lagos";

  // Direct state names first, longest match wins ("Akwa Ibom" before "Akwa").
  const stateHits = [...STATES_LOWER.entries()]
    .filter(([name]) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower))
    .sort((a, b) => b[0].length - a[0].length);

  if (stateHits.length > 0) return stateHits[0][1];

  const cityHits = Object.keys(CITY_TO_STATE)
    .filter((city) => lower.includes(city))
    .sort((a, b) => b.length - a.length);

  if (cityHits.length > 0) return CITY_TO_STATE[cityHits[0]];

  return "Lagos";
}

/** Normalise "Lekki, Lagos State" into a town label, without the state suffix. */
export function deriveCity(location: string, state: string): string {
  const cleaned = location
    .replace(/\bstate\b/gi, "")
    .replace(/\s*\(fct\)/gi, "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return state === "FCT Abuja" ? "Abuja" : state;

  const first = cleaned.split(",")[0]?.trim();

  // "Nigeria", "West Africa" and friends are not cities. Showing a country in
  // the city slot ("Abia / Nigeria") looks broken, so fall back to the state.
  const NOT_A_CITY = /^(nigeria|west africa|africa|sub-?saharan africa|anywhere|abroad|remote)$/i;
  if (first && !NOT_A_CITY.test(first) && first.length > 1 && first.length < 40) {
    return first.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return state;
}

export interface SalaryRange {
  min: number;
  max: number;
}

function toNaira(token: string): number {
  const cleaned = token.replace(/[₦,\s]/g, "").replace(/^ngn/i, "").replace(/^n/i, "");
  const kMatch = /^([\d.]+)k$/i.exec(cleaned);
  if (kMatch) return Math.round(Number.parseFloat(kMatch[1]) * 1000);

  const mMatch = /^([\d.]+)m$/i.exec(cleaned);
  if (mMatch) return Math.round(Number.parseFloat(mMatch[1]) * 1_000_000);

  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

/**
 * Parse "Salary: N400,000 - N600,000 / month", "N200k monthly", "₦1.2m per annum".
 * Annual figures are divided down to monthly so your board compares like with like.
 */
export function parseSalary(text: string): SalaryRange {
  if (!text) return { min: 0, max: 0 };

  // Anything above this is a timestamp, an ID or a page counter, not a salary.
  // A 13-digit epoch (1_759_000_000_000) previously sailed through and rendered
  // as "₦1,000,000,000,000" on the job card.
  const MAX_RAW = 120_000_000;
  const MIN_MONTHLY = 20_000;
  const MAX_MONTHLY = 50_000_000;

  const numbers = [...text.matchAll(/(?:n|₦|ngn)?\s?(\d[\d,.]*\s?[km]?)/gi)]
    .map((match) => toNaira(match[1]))
    .filter((value) => value >= 10_000 && value <= MAX_RAW);

  if (numbers.length === 0) return { min: 0, max: 0 };

  const annual = /(per\s+annum|per\s+year|annually|\/\s*annum|\/\s*year|p\.a\.)/i.test(text);
  const divisor = annual ? 12 : 1;

  const scaled = numbers
    .map((value) => Math.round(value / divisor))
    .filter((value) => value >= MIN_MONTHLY && value <= MAX_MONTHLY)
    .sort((a, b) => a - b);

  if (scaled.length === 0) return { min: 0, max: 0 };

  const min = scaled[0];
  const max = scaled[scaled.length - 1];

  return { min, max: Math.max(max, min) };
}

export function detectJobType(text: string): (typeof JOB_TYPES)[number] {
  const lower = text.toLowerCase();
  if (/\b(remote|work from home|work-at-home|fully remote)\b/.test(lower)) return "Remote";
  if (/\b(intern|internship|siwes)\b/.test(lower)) return "Internship";
  if (/\b(graduate trainee|trainee program|nysc)\b/.test(lower)) return "Graduate Trainee";
  if (/\b(part[- ]time)\b/.test(lower)) return "Part-Time";
  if (/\b(contract|consultancy|fixed term|fixed-term)\b/.test(lower)) return "Contract";
  return "Full-Time";
}

export function detectExperienceLevel(title: string, text: string): string {
  const lower = `${title} ${text}`.toLowerCase();
  if (/\b(senior|lead|principal|head of|manager|director|chief)\b/.test(lower)) return "Senior level";
  if (/\b(graduate trainee|entry level|nysc|intern|junior|assistant)\b/.test(lower)) return "Entry level";

  const years = /(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\s*\+?\s*years?/i.exec(text);
  if (years) {
    const min = Number.parseInt(years[1], 10);
    if (min >= 8) return "Senior level";
    if (min >= 3) return "Mid level";
  }

  return "Mid level";
}

export function isRemoteText(text: string): boolean {
  return /\b(remote|work from home|work-at-home|fully remote)\b/i.test(text);
}

/** "Internal Auditor at Domeo Resources International" -> "Domeo Resources International". */
export function companyFromTitle(title: string): string {
  const at = /\bat\s+(.+)$/i.exec(title);
  if (at) {
    return at[1]
      .replace(/\s*\(.*?\)\s*$/, "")
      .replace(/\s*[-|]\s*$/, "")
      .trim();
  }
  return "";
}

/** "Hitech Construction Company Limited Job Recruitment (6 Positions)" -> "Hitech Construction Company Limited". */
export function companyFromRecruitmentTitle(title: string): string {
  const match = /^(.+?)\s+(?:job\s+)?recruitment\b/i.exec(title);
  return match ? match[1].trim() : "";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Remove the source's brand from a title so it can never surface on this site. */
export function stripBrand(value: string): string {
  let output = value;

  for (const brand of SOURCE_FEED.stripFromTitles) {
    const escaped = escapeRegExp(brand);
    // "Title | Brand", "Title - Brand", "Title: Brand"
    output = output.replace(new RegExp(`\\s*[|\\-\\u2013\\u2014:]\\s*${escaped}[^|]*$`, "gi"), "");
    output = output.replace(new RegExp(escaped, "gi"), "");
  }

  return output
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s|\-\u2013\u2014:]+/, "")
    .replace(/\s*[|\-\u2013\u2014:]\s*$/, "")
    .trim();
}

export function cleanJobTitle(title: string): string {
  return stripBrand(title)
    .replace(/\s+Job Recruitment\s*\(\d+\s*Positions?\)/i, " Recruitment")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const TINTS = ["emerald", "blue", "indigo", "teal", "amber", "rose", "sky", "violet", "cyan", "orange"];

export function tintFor(company: string): string {
  let hash = 0;
  for (let index = 0; index < company.length; index += 1) {
    hash = (hash * 31 + company.charCodeAt(index)) % 100_000;
  }
  return TINTS[hash % TINTS.length];
}

export function companyInitials(company: string): string {
  const initials = initialsFor(company.replace(/[^\w\s]/g, " "));
  return initials || "NG";
}

export function makeSlug(title: string, company: string): string {
  return slugify(`${title}-${company}`) || slugify(title) || `job-${Date.now()}`;
}


/**
 * Strip every trace of the upstream board from imported text.
 *
 * Titles are handled separately, but descriptions and requirement lists are free
 * text copied from the source and can mention the board by name or carry its URL.
 * Anything matching the configured brand or host is removed here, so no listing
 * can surface a reference even inside its body copy.
 */
export function scrubText(value: string): string {
  if (!value) return "";

  let output = value;

  const host = (() => {
    try {
      return new URL(SOURCE_FEED.baseUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  // URLs first: the host itself contains the brand, so removing names before
  // links would leave broken fragments like "www..com" behind.
  if (host) {
    const hostPattern = escapeRegExp(host);
    output = output.replace(new RegExp(`(?:https?:)?//(?:[\\w-]+\\.)*${hostPattern}[^\\s)"'<>]*`, "gi"), "");
    output = output.replace(new RegExp(`\\b(?:[\\w-]+\\.)*${hostPattern}\\b`, "gi"), "");
  }

  for (const brand of SOURCE_FEED.stripFromTitles) {
    output = output.replace(new RegExp(escapeRegExp(brand), "gi"), "");
  }

  return output
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/^[\s,;:.\-\u2013\u2014]+/, "")
    // Removing a trailing brand leaves the joining dash behind:
    // "… in Nigeria - HNJ Exclusive" becomes "… in Nigeria -". Only separators
    // are trimmed here — a trailing colon or full stop is real prose.
    .replace(/[\s|\-\u2013\u2014]+$/, "")
    .trim();
}


/**
 * Classify a listing into one of the site's categories when the source does not
 * provide one (e.g. when reading the board's "last week" firehose).
 * First matching bucket wins; order matters.
 */
/**
 * How a listing is filed, by industry.
 *
 * These are deliberately coarse: a job seeker looks for "Technology & IT", not
 * "Oracle Jobs" or "PHP & MySQL Jobs". Those are skills, and they already appear
 * in the listing title — putting them in the navigation just splits the board.
 *
 * Rules run in order, most specific first. Ordering is the design: an
 * "IT Security Officer" must reach Technology before the security rule sees
 * "security", and a "Farming Equipment Engineer" belongs to Agriculture.
 */
const CATEGORY_RULES: Array<{ category: string; words: string[] }> = [
  {
    category: "Technology & IT",
    words: ["software", "developer", "programmer", "programming", "frontend", "front-end", "front end", "backend", "back-end", "full stack", "fullstack", "web developer", "web development", "wordpress", "android", "ios developer", "flutter", "react native", "mobile app", "mobile developer", "data scientist", "data analyst", "database", "dba", "sql", "oracle", "php", "laravel", "python", "javascript", "typescript", "linux", "unix", "devops", "kubernetes", "docker", "cloud", "aws", "azure", "network engineer", "network administrator", "networking", "ccna", "cisco", "system admin", "systems admin", "system administrator", "sysadmin", "it support", "ict", "information technology", "computer", "cybersecurity", "cyber security", "information security", "network security", "it security", "it officer", "it manager", "information system", "qa engineer", "technical support", "helpdesk", "help desk", "hardware"],
  },
  {
    category: "Security & Defence",
    words: ["military", "army", "navy", "air force", "airforce", "soldier", "cadet", "police", "policeman", "immigration", "customs", "civil defence", "civil defense", "correctional", "law enforcement", "nscdc", "efcc", "fire service", "security guard", "security officer", "security supervisor", "security personnel", "security man", "manned security", "paramilitary"],
  },
  {
    category: "Healthcare",
    words: ["nurse", "nurses", "nursing", "midwife", "midwives", "pharmac*", "clinical", "hospital", "laboratory", "lab scientist", "radiograph*", "physiotherap*", "dental", "dentist", "medical", "doctor", "physician", "surgeon", "optician", "psychiatr*", "sonographer", "health worker", "healthcare", "health care", "mbbs", "medical officer", "general practitioner", "house officer", "caregiver"],
  },
  {
    category: "Oil, Gas & Energy",
    words: ["oil and gas", "oil & gas", "oil/gas", "petroleum", "upstream", "downstream", "offshore", "refinery", "drilling", "lng", "gas engineer", "energy", "power plant", "solar", "renewable", "electricity", "utility"],
  },
  {
    category: "Banking & Finance",
    words: ["accountant", "accounting", "audit", "auditor", "bank", "banking", "teller", "finance", "financial", "insurance", "underwrit*", "actuar*", "treasury", "investment", "credit analyst", "loan officer", "microfinance", "bookkeep*", "taxation", "tax officer", "economist", "bursar", "chartered accountant", "icanz", "acca", "claims officer", "payroll"],
  },
  {
    category: "Legal & Compliance",
    words: ["lawyer", "legal", "attorney", "advocate", "paralegal", "solicitor", "counsel", "llb", "litigation", "compliance", "contract officer", "legal officer"],
  },
  {
    category: "Human Resources",
    words: ["human resource", "human resources", "hr", "recruitment officer", "recruitment consultant", "recruiter", "talent acquisition", "personnel", "industrial relations", "learning and development", "hris"],
  },
  {
    category: "Education & Teaching",
    words: ["teacher", "teaching", "tutor", "lecturer", "professor", "education", "school", "curriculum", "instructor", "academic", "librarian", "exams officer", "head of school", "principal", "vice principal", "class teacher", "primary school", "secondary school", "polytechnic", "university"],
  },
  {
    category: "Government & NGO",
    words: ["ngo", "non-governmental", "non governmental", "nonprofit", "non-profit", "humanitarian", "foundation", "charity", "volunteer", "federal government", "state government", "civil service", "ministry", "public service", "government agency", "development partner"],
  },
  {
    category: "Agriculture",
    words: ["agricultur*", "agro", "farm", "farmer", "farming", "livestock", "poultry", "crop", "agronom*", "veterinar*", "fishery", "fisheries", "forestry", "horticultur*", "irrigation"],
  },
  {
    category: "Engineering",
    words: ["engineer", "engineering", "mechanical", "electrical", "electronics", "electrician", "civil engineer", "structural", "quantity surveyor", "site engineer", "architect", "technician", "welder", "fabricator", "plumber", "hvac", "instrumentation", "maintenance", "machinist", "surveyor", "draftsman", "cad"],
  },
  {
    category: "Construction & Real Estate",
    words: ["construction", "building", "real estate", "realtor", "property", "estate manager", "letting", "facility", "facilities", "janitor", "cleaner", "land officer", "site supervisor", "foreman", "mason", "carpenter", "bricklayer", "painter"],
  },
  {
    category: "Manufacturing & Production",
    words: ["factory", "production worker", "machine operator", "packer", "assembly line", "artisan", "manpower", "plant operator", "quality control", "qc officer", "production"],
  },
  {
    category: "Logistics & Transport",
    words: ["driver", "driving", "dispatch", "rider", "chauffeur", "truck", "logistics", "supply chain", "warehouse", "store keeper", "storekeeper", "fleet", "transport", "shipping", "maritime", "marine", "vessel", "aviation", "airline", "pilot", "aircraft", "cabin crew", "flight attendant", "airport", "clearing and forwarding", "freight", "courier"],
  },
  {
    category: "Hospitality & Food Services",
    words: ["hotel", "hospitality", "restaurant", "chef", "cook", "kitchen", "waiter", "waitress", "bar tender", "bartender", "catering", "housekeeping", "concierge", "baker", "confectioner", "event", "banquet", "lounge", "resort"],
  },
  {
    category: "Media, Arts & Design",
    words: ["journalist", "journalism", "content writer", "content writing", "copywriter", "copywriting", "editor", "reporter", "writer", "blog", "graphic", "designer", "design", "ui/ux", "ui designer", "ux designer", "illustrator", "animator", "motion", "artist", "creative", "music", "theatre", "drama", "photograph", "video editor", "social media"],
  },
  {
    category: "Sales & Marketing",
    words: ["sales", "marketing", "business development", "brand", "advertising", "public relations", "merchandis*", "retail", "customer acquisition", "growth", "media buying"],
  },
  {
    category: "Customer Service",
    words: ["customer service", "customer care", "call centre", "call center", "client service", "customer support", "customer experience", "client relations"],
  },
  {
    category: "Administration & Office",
    words: ["administrative", "admin", "administration", "office assistant", "office clerk", "clerk", "records officer", "secretary", "secretarial", "personal assistant", "executive assistant", "front desk", "receptionist", "reception", "data entry", "office manager", "administrator"],
  },
];

/**
 * Used only when nothing matched. It is deliberately *not* an industry: these are
 * mostly aggregate "Company Recruitment" posts that describe no particular role,
 * and filing them under a real industry would make that industry's filter a lie.
 * The bucket shrinks as extraction improves.
 */
export const FALLBACK_CATEGORY = "General Vacancies";

/**
 * A trailing `*` marks a stem: `pharmac*` matches pharmacy and pharmacist.
 * Everything else matches whole words only, so "nurse" cannot match "nursery"
 * and "hr" cannot match inside another word.
 */
function compileWords(words: string[]): RegExp[] {
  return words.map((word) =>
    word.endsWith("*")
      ? new RegExp(`\\b${escapeRegExp(word.slice(0, -1))}`, "i")
      : new RegExp(`\\b${escapeRegExp(word)}\\b`, "i"),
  );
}

const COMPILED_RULES = CATEGORY_RULES.map((rule) => ({
  category: rule.category,
  patterns: compileWords(rule.words),
}));

export function detectCategory(text: string): string {
  for (const rule of COMPILED_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) return rule.category;
  }
  return FALLBACK_CATEGORY;
}

/**
 * Pick the industry with the most keyword hits rather than the first one seen.
 * Aggregate posts bundle several roles ("1.) Nurse 2.) Driver 3.) Accountant"),
 * so counting hits files the listing with the industry it talks about most.
 */
export function detectCategoryByDensity(text: string): string {
  let best = "";
  let bestScore = 0;

  for (const rule of COMPILED_RULES) {
    let score = 0;
    for (const pattern of rule.patterns) {
      const global = new RegExp(pattern.source, "gi");
      score += text.match(global)?.length ?? 0;
    }
    if (score > bestScore) {
      bestScore = score;
      best = rule.category;
    }
  }

  return best || FALLBACK_CATEGORY;
}

/**
 * Classify from the title first. Bodies bleed across industries — one aggregate
 * advert can mention a nurse, a driver and an accountant — so the description is
 * only consulted when the title alone says nothing.
 */
export function classifyListing(title: string, description: string): string {
  const fromTitle = detectCategory(title);
  if (fromTitle !== FALLBACK_CATEGORY) return fromTitle;
  return detectCategoryByDensity(`${title} ${description}`);
}

export function parsePostedDate(value: string, fallbackDaysAgo = 0): Date {
  if (value) {
    const parsed = parseDeadline(value);
    if (parsed && !Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(Date.now() - fallbackDaysAgo * 86_400_000);
}

export function parseDeadline(value: string): Date | null {
  if (!value) return null;
  const cleaned = value.replace(/(\d)(st|nd|rd|th)/i, "$1").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(`${cleaned} 23:59:59`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}
