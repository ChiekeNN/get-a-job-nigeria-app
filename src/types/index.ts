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
  "Trainee / Graduate Jobs",
  "Administrative Jobs in Nigeria",
  "Advertising Jobs Nigeria",
  "Accounting Jobs in Nigeria",
  "Auditing Jobs in Nigeria",
  "Arts Jobs in Nigeria",
  "Android / IOS Developer Jobs",
  "Agriculture Jobs in Nigeria",
  "Architecture Jobs in Nigeria",
  "Aviation Jobs in Nigeria",
  "Automobile Jobs in Nigeria",
  "Banking Jobs in Nigeria",
  "Computer & InfoTech Jobs",
  "Computer / IT Support Jobs",
  "Customer Service Jobs",
  "Civil Engineering Jobs",
  "Cook / Chef Jobs",
  "Database Jobs in Nigeria",
  "Driving / Dispatch Rider Jobs",
  "Education Jobs for Nigerians",
  "Real Estate Jobs",
  "Electrical/Electronics Jobs",
  "Engineering Jobs in Nigeria",
  "Facility Mgt Jobs in Nigeria",
  "Finance Jobs in Nigeria",
  "Front Desk Jobs in Nigeria",
  "Geology Jobs",
  "Government Jobs in Nigeria",
  "Graphics Design Jobs",
  "Hospitality Jobs in Nigeria",
  "Hotel Jobs in Nigeria",
  "HR Jobs in Nigeria",
  "Industrial Attachment (Internship)",
  "Insurance Jobs in Nigeria",
  "Journalism / Content Writing Jobs",
  "Law Enforcement / Security Jobs",
  "Lecturing Jobs in Nigeria",
  "Law / Legal Jobs in Nigeria",
  "Linux & Unix Jobs Nigeria",
  "Marketing & Sales Jobs",
  "Maritime & Shipping Jobs",
  "Medical & Healthcare Jobs",
  "Military Jobs in Nigeria",
  "Computer Networking Jobs",
  "NGO Jobs in Nigeria",
  "Oil & Gas Jobs in Nigeria",
  "Oracle Jobs in Nigeria",
  "Personal Assistant Jobs",
  "PHP & MySQL Jobs in Nigeria",
  "Physician / Medical Officer Jobs",
  "Public Relation Jobs",
  "Programming / Software Jobs",
  "Pri/Sec Sch Teaching Jobs",
  "Remote / Work-at-home Jobs",
  "Research Jobs in Nigeria",
  "Safety & Health Jobs",
  "Secretarial Jobs in Nigeria",
  "Security Jobs in Nigeria",
  "Sales Jobs",
  "Shipping & Maritime Jobs",
  "Student Jobs in Nigeria",
  "Software Developer Jobs",
  "System Admin Jobs in Nigeria",
  "Teaching Jobs in Nigeria",
  "Telecommunication Jobs",
  "Semi-skilled / Factory Work",
  "Volunteer Jobs Nigeria",
  "Web Developer Jobs Nigeria",
  "Web Designer / Frontend / UI Jobs",
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
