export const JOB_TYPES = [
  "Full-Time",
  "Contract",
  "Remote",
  "Internship",
  "Graduate Trainee",
  "Part-Time",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const CATEGORIES = [
  "Technology",
  "Banking & Finance",
  "Oil & Gas",
  "Healthcare",
  "Customer Service",
  "Engineering",
  "Agriculture",
  "Education",
  "Sales & Marketing",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Job {
  id: number;
  slug: string;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  state: string;
  city: string;
  category: string;
  jobType: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  experienceLevel: string;
  isFeatured: boolean;
  isRemote: boolean;
  postedAt: string;
  deadline: string | null;
  applicants: number;
  employerEmail: string | null;
  status: string;
}

export type SortOption = "newest" | "salary-high" | "salary-low" | "applicants";

export interface FilterState {
  keyword: string;
  state: string;
  category: string;
  jobType: string;
  minSalary: number;
  sort: SortOption;
}

export const EMPTY_FILTERS: FilterState = {
  keyword: "",
  state: "",
  category: "",
  jobType: "",
  minSalary: 0,
  sort: "newest",
};

export interface Employer {
  companyName: string;
  companyEmail: string;
  contactName: string;
  website?: string;
  companySize?: string;
}

export interface NewJobInput {
  title: string;
  company: string;
  employerEmail: string;
  contactName?: string;
  state: string;
  city: string;
  category: string;
  jobType: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  experienceLevel: string;
  isRemote: boolean;
  deadline?: string | null;
}

export interface ApplicationInput {
  jobId: number;
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  coverLetter?: string;
  cvFileName?: string;
}

export interface SubscriptionInput {
  fullName: string;
  email: string;
  phone?: string;
  state?: string;
  category?: string;
  plan: string;
  kind: "alerts" | "pro" | "cv";
  cvFileName?: string;
}

export interface JobStats {
  liveJobs: number;
  hiringCompanies: number;
  activeSeekers: number;
  statesCovered: number;
}

export interface CategoryInfo {
  name: string;
  slug: string;
  blurb: string;
  openings: number;
}

export interface Testimonial {
  name: string;
  role: string;
  location: string;
  quote: string;
  initials: string;
  tint: string;
}

export type ActionState = {
  ok: boolean;
  message: string;
};
