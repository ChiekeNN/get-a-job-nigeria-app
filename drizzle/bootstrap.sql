-- Initial schema for getajob.com.ng
--
-- Mirrors src/db/schema.ts exactly. Use this only when `npx drizzle-kit push`
-- cannot run (for example when the database is behind a Supabase Secret whose
-- value cannot be pulled locally). Paste the whole file into the Supabase SQL
-- Editor and run it once.
--
-- Safe to run more than once: every statement is IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS "jobs" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "company" text NOT NULL,
  "company_initials" text DEFAULT 'NG' NOT NULL,
  "company_color" text DEFAULT 'emerald' NOT NULL,
  "state" text NOT NULL,
  "city" text NOT NULL,
  "category" text NOT NULL,
  "job_type" text DEFAULT 'Full-Time' NOT NULL,
  "salary_min" integer DEFAULT 50000 NOT NULL,
  "salary_max" integer DEFAULT 500000 NOT NULL,
  "description" text NOT NULL,
  "requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "responsibilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "experience_level" text DEFAULT 'Mid level' NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "is_remote" boolean DEFAULT false NOT NULL,
  "posted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deadline" timestamp with time zone,
  "applicants" integer DEFAULT 0 NOT NULL,
  "employer_email" text,
  "status" text DEFAULT 'published' NOT NULL,
  "source" text,
  "source_id" text,
  "imported_at" timestamp with time zone,
  "last_seen_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "jobs_slug_unique" ON "jobs" USING btree ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "jobs_source_id_unique" ON "jobs" USING btree ("source_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "applications" (
  "id" serial PRIMARY KEY NOT NULL,
  "job_id" integer NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "location" text,
  "cover_letter" text,
  "cv_file_name" text,
  "cv_data" "bytea",
  "cv_mime" text,
  "cv_size" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "applications"
    ADD CONSTRAINT "applications_job_id_jobs_id_fk"
    FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "page_views" (
  "id" serial PRIMARY KEY NOT NULL,
  "path" text NOT NULL,
  "referrer" text,
  "device" text,
  "country" text,
  "session_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "reference" text NOT NULL,
  "plan_id" text NOT NULL,
  "plan_name" text NOT NULL,
  "amount" integer NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "note" text,
  "proof_data" "bytea",
  "proof_mime" text,
  "proof_name" text,
  "proof_size" integer,
  "status" text DEFAULT 'submitted' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payments_reference_unique" ON "payments" USING btree ("reference");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "subscribers" (
  "id" serial PRIMARY KEY NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "state" text,
  "category" text,
  "plan" text DEFAULT 'alerts' NOT NULL,
  "kind" text DEFAULT 'alerts' NOT NULL,
  "cv_file_name" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "import_state" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
