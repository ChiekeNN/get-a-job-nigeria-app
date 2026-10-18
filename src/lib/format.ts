export function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function formatNairaShort(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `₦${Number.isInteger(millions) ? millions : millions.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `₦${Number.isInteger(thousands) ? thousands : thousands.toFixed(0)}k`;
  }
  return `₦${value}`;
}

/**
 * A salary range, collapsed to a single figure when only one number is known.
 *
 * The source often prints one figure ("Salary: N70,000 monthly"), and rendering
 * that as "₦70,000 – ₦70,000" looks like a data bug to a job seeker.
 */
export function salaryRange(min: number, max: number): string {
  if (!(min > 0) && !(max > 0)) return "Not disclosed";
  if (!(max > min)) return formatNairaShort(min);
  return `${formatNairaShort(min)} – ${formatNairaShort(max)}`;
}

/** Full-figure variant used on job cards and detail pages. */
export function salaryLabel(min: number, max: number): string {
  if (!(min > 0) && !(max > 0)) return "Salary not disclosed";
  if (!(max > min)) return formatNaira(min);
  return `${formatNaira(min)} – ${formatNaira(max)}`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Recently";
  const diff = Date.now() - then;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Open until filled";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Open until filled";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const TINTS: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-800",
  indigo: "bg-indigo-100 text-indigo-700",
  teal: "bg-teal-100 text-teal-700",
  rose: "bg-rose-100 text-rose-700",
  yellow: "bg-yellow-100 text-yellow-800",
  lime: "bg-lime-100 text-lime-800",
  orange: "bg-orange-100 text-orange-700",
  sky: "bg-sky-100 text-sky-700",
  red: "bg-red-100 text-red-700",
  slate: "bg-slate-200 text-slate-700",
  violet: "bg-violet-100 text-violet-700",
  cyan: "bg-cyan-100 text-cyan-700",
};

export function companyTint(color: string): string {
  return TINTS[color] ?? TINTS.emerald;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
