/**
 * Reads an employer's own advert and turns it into a short list of things the
 * applicant actually has to prove — degree, years, NYSC, licence, certification.
 *
 * Nothing here guesses. Every row is backed by a sentence from the ad, and a
 * requirement the employer did not state is simply absent rather than invented,
 * because a made-up "you qualify" is worse than no answer at all.
 */
import type { Job } from "@/types";

export type FitField = "education" | "experience" | "nysc" | "licence" | "certification";

export interface FitRequirement {
  field: FitField;
  /** Short, human phrasing: "Bachelor's degree", "3+ years", "NYSC completed". */
  label: string;
  /** The employer's own words, trimmed for display. */
  quote: string;
  /** Minimum level for `education` (1 SSCE … 6 PhD). */
  level?: number;
  /** Minimum years for `experience`. */
  years?: number;
  /** Recognised certification codes for `certification`. */
  codes?: string[];
  /** The ad phrased it as preferred / an advantage rather than mandatory. */
  soft: boolean;
}

export interface JobRequirements {
  items: FitRequirement[];
}

export interface CandidateProfile {
  education: number | null;
  years: number | null;
  nysc: "yes" | "no" | "exempt" | null;
  licence: "yes" | "no" | null;
  certifications: string;
}

export const EMPTY_PROFILE: CandidateProfile = {
  education: null,
  years: null,
  nysc: null,
  licence: null,
  certifications: "",
};

export const EDUCATION_OPTIONS = [
  { value: 1, label: "SSCE / WAEC" },
  { value: 2, label: "OND / NCE" },
  { value: 3, label: "HND" },
  { value: 4, label: "BSc / BA / B.Eng" },
  { value: 5, label: "MSc / MBA" },
  { value: 6, label: "PhD" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: 0, label: "Less than 1 year" },
  { value: 1, label: "1 year" },
  { value: 2, label: "2 years" },
  { value: 3, label: "3 years" },
  { value: 5, label: "5 years" },
  { value: 7, label: "7 years" },
  { value: 10, label: "10 years" },
  { value: 15, label: "15 years or more" },
] as const;

const SOFT_WORDS =
  /\b(preferred|preferably|added advantage|an advantage|is a plus|a plus|advantageous|desirable|nice to have|not mandatory|added plus)\b/i;

const DEGREE_LABELS: Record<number, string> = {
  1: "SSCE / WAEC",
  2: "OND / NCE",
  3: "HND",
  4: "Bachelor's degree",
  5: "Master's degree",
  6: "PhD",
};

const DEGREE_RULES: { level: number; re: RegExp }[] = [
  { level: 6, re: /\b(ph\.?\s?d|doctorate|doctoral)\b/i },
  { level: 5, re: /\b(m\.?\s?sc|mba|m\.?\s?ba|master(?:'s)?|postgraduate degree|m\.?\s?a)\b/i },
  {
    level: 4,
    re: /\b(b\.?\s?sc|b\.?\s?eng|beng|b\.?\s?a|ba|bachelor(?:'s)?|university degree|first degree|llb|degree)\b/i,
  },
  { level: 3, re: /\b(hnd|higher national diploma)\b/i },
  { level: 2, re: /\b(ond|nce|national diploma)\b/i },
  { level: 1, re: /\b(ssce|waec|neco|o['’]?level)\b/i },
];

/** Certifications Nigerian adverts actually name. */
const CERT_CODES = [
  "ICAN",
  "ANAN",
  "ACCA",
  "CIPM",
  "CIPD",
  "CFA",
  "PMP",
  "PRINCE2",
  "STCW",
  "COREN",
  "CISA",
  "CISSP",
  "CCNA",
  "CIPS",
  "CIM",
  "NIM",
];

const NYSC_RE = /\bnysc\b/i;
const LICENCE_RE = /\bdriv(?:er'?s?|ing)\s+licen[cs]e\b|\bmust be able to drive\b|\bvalid driving licen[cs]e\b/i;
const PRACTICE_RE = /\blicen[cs]e to practice\b|\bcall to bar\b|\bbl\b/i;

const YEARS_RE = /(\d{1,2})\s*(?:\+)?\s*(?:-|–|—|to)?\s*(\d{0,2})\s*years?/i;

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function firstMatching(list: string[], re: RegExp): string | null {
  for (const line of list) {
    if (re.test(line)) return line;
  }
  return null;
}

function quote(line: string, limit = 170): string {
  const trimmed = line.replace(/^[\s•\-–—]+/, "").trim();
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit).replace(/[,;:\s]+\S*$/, "")}…`;
}

function isSoft(line: string): boolean {
  return SOFT_WORDS.test(line);
}

function hasAnyWord(text: string): boolean {
  return /\bexperience|working|relevant|post[- ]qualification|pqe\b/i.test(text);
}

/**
 * The lowest stated degree wins: "BSc/HND" accepts either, and "BSc, MSc
 * preferred" is still an advert a BSc holder can apply to. SSCE only counts
 * when it is the only qualification named, because adverts routinely list
 * O'levels alongside a degree without meaning O'level alone is enough.
 */
function pickDegree(found: number[]): number | null {
  const higher = found.filter((level) => level >= 2);
  if (higher.length > 0) return Math.min(...higher);
  return found.length > 0 ? 1 : null;
}

export function analyzeJob(job: Pick<Job, "description" | "requirements">): JobRequirements {
  const text = [job.description, ...job.requirements].filter(Boolean).join(" ");
  const lines = sentences(text);
  const items: FitRequirement[] = [];

  const degreeLine = firstMatching(
    lines,
    /\b(b\.?\s?sc|b\.?\s?eng|bachelor|university degree|first degree|llb|hnd|ond|nce|master|m\.?\s?sc|mba|ph\.?\s?d|doctorate|degree|diploma|waec|ssce)\b/i,
  );
  const foundLevels = DEGREE_RULES.filter((rule) => rule.re.test(text)).map((rule) => rule.level);
  const degreeLevel = pickDegree(foundLevels);

  if (degreeLevel !== null) {
    const chosenRule = DEGREE_RULES.find((rule) => rule.level === degreeLevel);
    const chosenLine = chosenRule ? firstMatching(lines, chosenRule.re) : null;
    items.push({
      field: "education",
      level: degreeLevel,
      label: DEGREE_LABELS[degreeLevel],
      quote: quote(chosenLine ?? degreeLine ?? text),
      soft: degreeLine ? isSoft(degreeLine) : false,
    });
  }

  const yearLines = lines.filter((line) => YEARS_RE.test(line));
  const yearSentence =
    yearLines.find((line) => hasAnyWord(line) && /\byou|candidate|applicant|minimum|at least/i.test(line)) ??
    yearLines.find((line) => /\bminimum|at least|not less\b/i.test(line)) ??
    yearLines.find((line) => hasAnyWord(line)) ??
    yearLines[0];

  if (yearSentence) {
    const match = yearSentence.match(YEARS_RE);
    const minimum = match ? Number.parseInt(match[1], 10) : Number.NaN;
    if (Number.isFinite(minimum) && minimum > 0 && minimum <= 25) {
      items.push({
        field: "experience",
        years: minimum,
        label: minimum === 1 ? "1+ year" : `${minimum}+ years`,
        quote: quote(yearSentence),
        soft: isSoft(yearSentence),
      });
    }
  }

  const nyscLine = firstMatching(lines, NYSC_RE);
  if (nyscLine) {
    items.push({
      field: "nysc",
      label: "NYSC completed",
      quote: quote(nyscLine),
      soft: false,
    });
  }

  const licenceLine = firstMatching(lines, LICENCE_RE);
  if (licenceLine) {
    items.push({
      field: "licence",
      label: "Driver's licence",
      quote: quote(licenceLine),
      soft: isSoft(licenceLine),
    });
  }

  const codes = CERT_CODES.filter((code) =>
    new RegExp(`\\b${code}\\b`, "i").test(text),
  );
  const practiceLine = firstMatching(lines, PRACTICE_RE);
  const codeLine =
    codes.length > 0
      ? firstMatching(lines, new RegExp(`\\b(?:${codes.join("|")})\\b`, "i"))
      : null;
  const certLine =
    codeLine ??
    firstMatching(lines, /professional (?:certification|certificate|qualification)/i) ??
    practiceLine;

  if (codes.length > 0 || certLine) {
    const label =
      codes.length > 0
        ? codes.length === 1
          ? codes[0]
          : `${codes.slice(0, 2).join(" or ")} certification`
        : "Professional certification";
    items.push({
      field: "certification",
      label,
      codes,
      quote: quote(certLine ?? text),
      soft: certLine ? isSoft(certLine) : false,
    });
  }

  return { items };
}

export type FitStatus = "met" | "gap" | "open";

export interface FitRow extends FitRequirement {
  status: FitStatus;
}

export function evaluateFit(items: FitRequirement[], candidate: CandidateProfile): FitRow[] {
  return items.map((item) => {
    let status: FitStatus = "open";

    if (item.field === "education") {
      if (candidate.education !== null) {
        status = candidate.education >= (item.level ?? 4) ? "met" : "gap";
      }
    } else if (item.field === "experience") {
      if (candidate.years !== null) {
        status = candidate.years >= (item.years ?? 0) ? "met" : "gap";
      }
    } else if (item.field === "nysc") {
      if (candidate.nysc !== null) status = candidate.nysc === "no" ? "gap" : "met";
    } else if (item.field === "licence") {
      if (candidate.licence !== null) status = candidate.licence === "yes" ? "met" : "gap";
    } else {
      const held = candidate.certifications.trim().toUpperCase();
      // An empty box is an unanswered question, not a missing certificate.
      if (held.length > 0) {
        if (item.codes && item.codes.length > 0) {
          status = item.codes.some((code) => held.includes(code)) ? "met" : "gap";
        } else {
          status = "met";
        }
      }
    }

    return { ...item, status };
  });
}

export type FitTone = "good" | "warn" | "bad" | "unknown";

export interface FitSummary {
  tone: FitTone;
  title: string;
  body: string;
}

export function summarizeFit(rows: FitRow[]): FitSummary {
  const must = rows.filter((row) => !row.soft);

  if (must.length === 0) {
    return {
      tone: "unknown",
      title: "Nothing formal to check",
      body: "This employer named only preferences, not hard requirements. Read the full advert before you spend an application.",
    };
  }

  if (must.some((row) => row.status === "open")) {
    return {
      tone: "unknown",
      title: "Answer the last question",
      body: "We only check what this advert actually states — answer the rest and the verdict appears.",
    };
  }

  const gaps = must.filter((row) => row.status === "gap");

  if (gaps.length === 0) {
    return {
      tone: "good",
      title: "You clear every stated requirement",
      body: "On paper nothing in this advert rules you out. Apply while it is still open.",
    };
  }

  if (gaps.length === 1) {
    return {
      tone: "warn",
      title: "One requirement to address",
      body: `The advert asks for ${gaps[0].label.toLowerCase()}. If you have the equivalent, say so in the first line of your cover letter.`,
    };
  }

  return {
    tone: "bad",
    title: "This advert asks for more than your profile shows",
    body: "Apply only if you can evidence the rest — otherwise put this effort into the similar roles further down the page.",
  };
}

/** Which questions the advert actually makes worth asking. */
export function fieldsToAsk(items: FitRequirement[]): FitField[] {
  const order: FitField[] = ["education", "experience", "nysc", "licence", "certification"];
  return order.filter((field) => items.some((item) => item.field === field));
}
