import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    companyInitials: text("company_initials").notNull().default("NG"),
    companyColor: text("company_color").notNull().default("emerald"),
    state: text("state").notNull(),
    city: text("city").notNull(),
    category: text("category").notNull(),
    jobType: text("job_type").notNull().default("Full-Time"),
    salaryMin: integer("salary_min").notNull().default(50000),
    salaryMax: integer("salary_max").notNull().default(500000),
    description: text("description").notNull(),
    requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
    responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
    benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
    experienceLevel: text("experience_level").notNull().default("Mid level"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isRemote: boolean("is_remote").notNull().default(false),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
    deadline: timestamp("deadline", { withTimezone: true }),
    applicants: integer("applicants").notNull().default(0),
    employerEmail: text("employer_email"),
    status: text("status").notNull().default("published"),
    // Import provenance. `sourceId` is the stable upstream key (e.g. "hotnigerianjobs:975604")
    // and is what makes re-runs idempotent instead of creating duplicates.
    source: text("source"),
    sourceId: text("source_id"),
    sourceUrl: text("source_url"),
    importedAt: timestamp("imported_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("jobs_slug_unique").on(table.slug),
    // Postgres allows many NULLs in a unique index, so manually-posted jobs are unaffected.
    uniqueIndex("jobs_source_id_unique").on(table.sourceId),
  ],
);

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location"),
  coverLetter: text("cover_letter"),
  cvFileName: text("cv_file_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  state: text("state"),
  category: text("category"),
  plan: text("plan").notNull().default("alerts"),
  kind: text("kind").notNull().default("alerts"),
  cvFileName: text("cv_file_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type JobRow = typeof jobs.$inferSelect;
export type NewJobRow = typeof jobs.$inferInsert;
export type ApplicationRow = typeof applications.$inferSelect;
export type SubscriberRow = typeof subscribers.$inferSelect;
