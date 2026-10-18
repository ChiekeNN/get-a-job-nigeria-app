import { NIGERIAN_STATES } from "@/data/site";
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
  if (first && first.length > 1 && first.length < 40) {
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

  const numbers = [...text.matchAll(/(?:n|₦|ngn)?\s?(\d[\d,.]*\s?[km]?)/gi)]
    .map((match) => toNaira(match[1]))
    .filter((value) => value >= 10_000);

  if (numbers.length === 0) return { min: 0, max: 0 };

  const annual = /(per\s+annum|per\s+year|annually|\/\s*annum|\/\s*year|p\.a\.)/i.test(text);
  const divisor = annual ? 12 : 1;

  const scaled = numbers.map((value) => Math.round(value / divisor)).sort((a, b) => a - b);
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

export function cleanJobTitle(title: string): string {
  return title
    .replace(/\s*\|\s*HotNigerianJobs.*$/i, "")
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

export function parseDeadline(value: string): Date | null {
  if (!value) return null;
  const cleaned = value.replace(/(\d)(st|nd|rd|th)/i, "$1").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(`${cleaned} 23:59:59`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}
