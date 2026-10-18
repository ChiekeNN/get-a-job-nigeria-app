import { CATEGORIES, JOB_TYPES, type NewJobInput } from "@/types";
import { NIGERIAN_STATES } from "@/data/site";
import { createJob, listJobs } from "@/lib/jobs-service";
import { cleanText, isEmail, splitLines, toNumber } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = cleanText(searchParams.get("keyword"), 120).toLowerCase();
  const state = cleanText(searchParams.get("state"), 60);
  const category = cleanText(searchParams.get("category"), 60);
  const jobType = cleanText(searchParams.get("type"), 60);
  const minSalary = toNumber(searchParams.get("minSalary"));
  const limit = toNumber(searchParams.get("limit"), 100);

  let jobs = await listJobs();

  if (keyword) {
    jobs = jobs.filter((job) =>
      `${job.title} ${job.company} ${job.category} ${job.city} ${job.state} ${job.description}`
        .toLowerCase()
        .includes(keyword),
    );
  }
  if (state) jobs = jobs.filter((job) => job.state === state);
  if (category) jobs = jobs.filter((job) => job.category === category);
  if (jobType) jobs = jobs.filter((job) => job.jobType === jobType);
  if (minSalary > 0) jobs = jobs.filter((job) => job.salaryMax >= minSalary);

  return Response.json({ ok: true, total: jobs.length, jobs: jobs.slice(0, limit) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = cleanText(body.title, 140);
    const company = cleanText(body.company, 140);
    const employerEmail = cleanText(body.employerEmail, 160).toLowerCase();
    const contactName = cleanText(body.contactName, 120);
    const state = cleanText(body.state, 60);
    const city = cleanText(body.city, 80);
    const category = cleanText(body.category, 60);
    const jobType = cleanText(body.jobType, 40);
    const description = cleanText(body.description, 4000);
    const experienceLevel = cleanText(body.experienceLevel, 40) || "Mid level";
    const salaryMin = toNumber(body.salaryMin);
    const salaryMax = toNumber(body.salaryMax);
    const isRemote = body.isRemote === true;
    const deadline = cleanText(body.deadline, 40);

    if (title.length < 3)
      return Response.json({ ok: false, message: "Add a job title" }, { status: 400 });
    if (company.length < 2)
      return Response.json({ ok: false, message: "Add your company name" }, { status: 400 });
    if (!isEmail(employerEmail))
      return Response.json(
        { ok: false, message: "Add a valid work email for applications" },
        { status: 400 },
      );
    if (!NIGERIAN_STATES.includes(state as (typeof NIGERIAN_STATES)[number]))
      return Response.json({ ok: false, message: "Select a valid Nigerian state" }, { status: 400 });
    if (!city) return Response.json({ ok: false, message: "Add the city or town" }, { status: 400 });
    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number]))
      return Response.json({ ok: false, message: "Select a valid industry" }, { status: 400 });
    if (!JOB_TYPES.includes(jobType as (typeof JOB_TYPES)[number]))
      return Response.json({ ok: false, message: "Select a valid job type" }, { status: 400 });
    if (salaryMin <= 0 || salaryMax <= 0)
      return Response.json({ ok: false, message: "Add a salary range in Naira" }, { status: 400 });
    if (salaryMin > salaryMax)
      return Response.json(
        { ok: false, message: "Minimum salary cannot be above maximum salary" },
        { status: 400 },
      );
    if (description.length < 40)
      return Response.json(
        { ok: false, message: "Write at least 40 characters describing the role" },
        { status: 400 },
      );

    const input: NewJobInput = {
      title,
      company,
      employerEmail,
      contactName,
      state,
      city,
      category,
      jobType,
      salaryMin,
      salaryMax,
      description,
      requirements: splitLines(body.requirements),
      responsibilities: splitLines(body.responsibilities),
      benefits: splitLines(body.benefits),
      experienceLevel,
      isRemote,
      deadline: deadline || null,
    };

    const job = await createJob(input);

    return Response.json(
      { ok: true, message: `${job.title} is now live for candidates across Nigeria.`, job },
      { status: 201 },
    );
  } catch (error) {
    console.error("post job failed", error);
    return Response.json(
      { ok: false, message: "Could not publish this job. Please try again." },
      { status: 500 },
    );
  }
}
