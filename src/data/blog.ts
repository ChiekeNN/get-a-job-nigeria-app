/**
 * The advice section.
 *
 * Twelve posts across six hubs — four for job seekers, two for employers.
 * Each post exists to answer one question a real person types into Google,
 * and then to hand them a page that can help: the job board, the CV service,
 * the Pro service or the employer form.
 *
 * Inline markup in `text` and `items`:
 *   **bold**          -> bold
 *   [label](/path)    -> link
 */

export type HubId = "cv" | "interviews" | "search" | "sectors" | "hiring" | "adverts";

export interface Hub {
  id: HubId;
  name: string;
  tagline: string;
  description: string;
  audience: "Job seekers" | "Employers";
}

export const BLOG_HUBS: Hub[] = [
  {
    id: "cv",
    name: "CV & ATS",
    tagline: "Get past the filter",
    description:
      "How Nigerian recruiters and applicant tracking systems actually read a CV — and the changes that get yours to a human.",
    audience: "Job seekers",
  },
  {
    id: "interviews",
    name: "Interviews & salary",
    tagline: "Get hired, get paid",
    description:
      "The questions Nigerian interviewers really ask, how to answer them, and how to talk about money without losing the offer.",
    audience: "Job seekers",
  },
  {
    id: "search",
    name: "Job search",
    tagline: "Apply better",
    description:
      "Where the openings are, how to apply so a person reads it, and how to tell a real advert from a scam before it costs you.",
    audience: "Job seekers",
  },
  {
    id: "sectors",
    name: "Pay & places",
    tagline: "Know the market",
    description:
      "What roles actually pay across Nigeria, and how living in Lagos, Abuja or Port Harcourt changes the money you keep.",
    audience: "Job seekers",
  },
  {
    id: "hiring",
    name: "Hiring in Nigeria",
    tagline: "Hire lawfully",
    description:
      "The hiring rules that matter — what you may ask, what you owe a new hire, and how to handle candidate data under the NDPA.",
    audience: "Employers",
  },
  {
    id: "adverts",
    name: "Writing job adverts",
    tagline: "Attract the right people",
    description:
      "How to write an advert that brings twenty good applicants instead of four hundred wrong ones.",
    audience: "Employers",
  },
];

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "callout"; tone: "tip" | "warn" | "note"; title: string; text: string }
  | { kind: "template"; title: string; lines: string[] }
  | { kind: "cta"; title: string; text: string; label: string; href: string };

export interface Post {
  slug: string;
  hub: HubId;
  /** The h1. Plain language, the thing people search for. */
  title: string;
  /** The <title> tag — slightly narrower than the h1. */
  metaTitle: string;
  /** The meta description and the card summary. */
  description: string;
  /** One sentence on the card. */
  excerpt: string;
  /** ISO date, no time. */
  published: string;
  updated?: string;
  author: string;
  minutes: number;
  blocks: Block[];
}

export const POSTS: Post[] = [
  /* ───────────────────────────── CV & ATS ───────────────────────────── */
  {
    slug: "cv-format-nigeria-ats",
    hub: "cv",
    title: "The CV format that actually gets past ATS in Nigeria",
    metaTitle: "CV format for ATS in Nigeria (2026) — layout that gets read",
    description:
      "Most Nigerian CVs are rejected before a recruiter opens them. Here is the layout, section order and keyword approach that gets yours through the software and onto a desk.",
    excerpt:
      "Two columns, a photo and a table of skills — three of the reasons your CV is being filtered out before anyone reads it.",
    published: "2026-09-26",
    updated: "2026-10-18",
    author: "GetAJob Career Desk",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "When you apply through a Nigerian company's careers page, your CV usually goes into an applicant tracking system (ATS) before a human sees it. The software reads the file, pulls out your details, and scores the match. If it cannot read your layout, you are not rejected — you are simply invisible, and nobody ever tells you.",
      },
      {
        kind: "p",
        text: "The good news is that the fix is boring. It is not a trick or a secret keyword. It is a plain, well-structured document that both a parser and a tired recruiter can read in ten seconds.",
      },
      { kind: "h2", text: "What the software is actually doing" },
      {
        kind: "p",
        text: "An ATS converts your file to plain text, then looks for sections it recognises — contact details, work history, education, skills — and dates it can line up. It then compares the words in your CV to the words in the advert.",
      },
      {
        kind: "p",
        text: "Everything in this article follows from that. If a human can read your CV but the parser cannot, you fail. If the parser can read it but a human gives up after six seconds, you also fail. The format below is the one that satisfies both.",
      },
      { kind: "h2", text: "The layout that survives" },
      {
        kind: "ul",
        items: [
          "**One column.** No sidebars, no two-column templates, no text boxes. Parsers read left to right across the whole page, so a sidebar gets scrambled into the middle of your job history.",
          "**No tables and no graphics.** A table of skills or a chart of your proficiency reads as noise. Write the skill, then prove it in a bullet.",
          "**Nothing in the header or footer** of the document. Some systems drop that area completely — and that is where people put their phone number.",
          "**Standard section headings:** Profile, Experience, Education, Skills, Certifications. Not “My Journey” or “Where I've Been”.",
          "**A real font at 10.5–11.5pt.** Calibri, Arial, Georgia. No display fonts.",
          "**PDF, unless the advert asks for Word.** Export the PDF from Word or Google Docs — never a scan, never a phone photo of a printed page.",
          "**One page if you have under eight years of experience.** Two is fine after that. Three is a warning sign.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "The ten-second test",
        text: "Open your CV on your phone. If you have to pinch and zoom to read a line, a recruiter on a laptop at 11pm will not read it either.",
      },
      { kind: "h2", text: "The section order Nigerian recruiters expect" },
      {
        kind: "ol",
        items: [
          "**Name and contact line** — phone with the country code, a professional email, city and state. LinkedIn if it is current.",
          "**Profile** — three lines: what you do, how long you have done it, and one result.",
          "**Experience** — most recent first, with months and years, not just years.",
          "**Education** — degree, institution, year. Include NYSC status.",
          "**Skills** — six to ten tools or capabilities you could be tested on tomorrow.",
          "**Certifications** — only current, verifiable ones.",
          "**Referees** — two, with roles and phone numbers, or leave the line off entirely.",
        ],
      },
      { kind: "h2", text: "Keywords, without the stuffing" },
      {
        kind: "p",
        text: "Use the advert's own words. If the advert says “customer care representative” and your CV says “client experience executive”, the match is weaker than it should be — even though you did the same job.",
      },
      {
        kind: "p",
        text: "Read the advert, underline the eight phrases it repeats, and make sure the honest version of each appears in your CV. Do not paste a paragraph of keywords in white text. Modern systems ignore hidden text, and a human who opens the file sees a mess.",
      },
      { kind: "h2", text: "Five things to delete today" },
      {
        kind: "ul",
        items: [
          "**“References available on request.”** Everyone knows. It wastes a line.",
          "**Skill bars and star ratings.** “Excel — 4/5 stars” means nothing to anybody. Say what you built with it.",
          "**“To work in a dynamic organisation where I can utilise my skills…”** Replace it with a sentence about the job you are applying for.",
          "**A photo**, unless the advert asks for one. It adds no information and invites bias.",
          "**Date of birth, marital status, religion, state of origin** — unless the employer specifically asks. Many Nigerian employers still request these on their own forms, and if the form asks, answer it. On the CV itself they cost you space and open the door to discrimination.",
        ],
      },
      { kind: "h2", text: "The twenty-minute fix" },
      {
        kind: "ol",
        items: [
          "Copy your CV into a blank document with no template.",
          "Set one column, 11pt, and normal margins.",
          "Rewrite every bullet as action + tool + result: “Reconciled ₦40m monthly stock ledger in Excel, cutting discrepancies from 9% to under 1%.”",
          "Delete anything older than ten years that is not directly relevant.",
          "Export to PDF, then open it and copy-paste the text into a notes app. If the pasted text is in the right order and readable, a parser will manage.",
        ],
      },
      {
        kind: "cta",
        title: "Want it done properly, by a person?",
        text: "Our Nigerian HR writers rebuild CVs for ATS, in PDF and Word, delivered in 2–3 working days from ₦5,000.",
        label: "See CV writing packages",
        href: "/cv-writing",
      },
    ],
  },
  {
    slug: "cv-no-experience-nysc",
    hub: "cv",
    title: "How to write a CV with no work experience (NYSC and fresh graduates)",
    metaTitle: "CV with no experience in Nigeria — NYSC and fresh graduate guide",
    description:
      "You have more experience than you think. How to turn NYSC, projects, volunteering and side work into a one-page CV that gets a fresh graduate shortlisted in Nigeria.",
    excerpt:
      "NYSC, a final-year project and a church committee are experience. Here is how to write them so a recruiter counts them.",
    published: "2026-10-01",
    author: "GetAJob Career Desk",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "Every fresh graduate in Nigeria is told they need experience to get a job and a job to get experience. Recruiters know this. What they are actually checking for is whether you can describe your work like someone who understands outcomes — and most graduates never learn how.",
      },
      { kind: "h2", text: "You have more than you think" },
      {
        kind: "ul",
        items: [
          "**NYSC service**, including your Place of Primary Assignment. That is eleven months of supervised work with a title, a supervisor and duties.",
          "**Final-year project** — research, data collection, analysis, a written report and a defence.",
          "**Industrial training (SIWES)** — usually three to six months inside a real organisation.",
          "**Volunteering and association roles** — treasurer of a student body, organising a conference, running a tutorial group.",
          "**Freelance and side work** — design, writing, sales, tutoring, thrift collection, social media for a family business.",
          "**Certifications** — Google, Meta, HubSpot, ALX, Cisco, Microsoft Learn. Free or nearly free, and they show direction.",
        ],
      },
      { kind: "h2", text: "Lead with education, then show the rest" },
      {
        kind: "p",
        text: "For a first job, education goes first. Then a section called **Experience** — even if the entries are NYSC, an internship and a volunteer role. Label it Experience rather than “Other Activities”; it is work, and it belongs there.",
      },
      {
        kind: "p",
        text: "After that, **Projects** (your final-year work and anything you built or ran), then **Skills**, then **Certifications**.",
      },
      { kind: "h2", text: "Turn schoolwork into experience" },
      {
        kind: "p",
        text: "The pattern is the same as a professional CV: what you did, the tool you used, the result. Compare these two lines describing the same final-year project.",
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Weak",
        text: "“Carried out a research project on consumer behaviour in Lagos.”",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Strong",
        text: "“Surveyed 180 shoppers across three Lagos markets, cleaned the data in Excel and presented findings that a local retailer used to change its product mix — scored 68%, second in a class of 41.”",
      },
      {
        kind: "p",
        text: "The second version answers the questions a recruiter has: how many, where, what tool, what happened, and how well did you do.",
      },
      { kind: "h2", text: "How to present NYSC" },
      {
        kind: "p",
        text: "Put it under Experience with the dates and your PPA's name:",
      },
      {
        kind: "template",
        title: "NYSC entry",
        lines: [
          "Teaching Assistant — [School name], [City]",
          "National Youth Service Corps · Mar 2025 – Feb 2026",
          "• Taught Basic Science to three classes of 40+ students and set weekly assessments.",
          "• Ran the after-school reading club; average score in my classes rose from 48% to 61%.",
          "• Kept attendance and results records in Excel for the head of department.",
        ],
      },
      {
        kind: "p",
        text: "If you are still serving, say so plainly: **NYSC — currently serving, available from [month]**.",
      },
      { kind: "h2", text: "Certifications worth the effort" },
      {
        kind: "ul",
        items: [
          "**Google Digital Skills for Africa** — free, broad, recognised by Nigerian employers.",
          "**HubSpot Academy** — inbound marketing, sales, customer service. Free, certificate in an afternoon.",
          "**Microsoft Learn** — Excel, Power BI and Azure fundamentals.",
          "**Cisco Networking Academy** — networking and cybersecurity basics.",
          "**ALX / Coursera** — project work you can describe, not just a badge.",
        ],
      },
      {
        kind: "p",
        text: "Two relevant certificates beat eight random ones. Put the year next to each.",
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Do not invent experience",
        text: "Nigerian employers now check references and LinkedIn, and a fabricated internship is the fastest way to lose an offer you already have. Describe what you really did, better.",
      },
      { kind: "h2", text: "Keep it to one page" },
      {
        kind: "p",
        text: "A graduate with no full-time experience should not need two pages. If your CV spills over, you are describing duties instead of results, or listing every secondary-school certificate you own.",
      },
      { kind: "h2", text: "What to leave off" },
      {
        kind: "ul",
        items: [
          "**Primary school and JSS results.** Your WAEC and degree are enough.",
          "**Every certificate you have ever received.** A workshop attendance slip is not a qualification.",
          "**Hobbies that tell a recruiter nothing.** “Reading and travelling” is space you could use for a skill.",
          "**Referees who have not agreed.** Two people who know you will answer the phone; the MD of a company you have never met will not.",
          "**A photo**, unless the advert asks.",
        ],
      },
      { kind: "h2", text: "The two-line note that goes with it" },
      {
        kind: "p",
        text: "When you have no experience, the email matters more than usual. Two lines, no essay:",
      },
      {
        kind: "template",
        title: "Application email",
        lines: [
          "Subject: Application: Graduate Trainee (Operations) — Chioma Eze",
          "",
          "Dear Hiring Manager,",
          "",
          "I am applying for the Graduate Trainee role advertised on GetAJob. I",
          "completed my NYSC in February 2026 at [School], where I taught three",
          "classes and ran the reading club, and I built the attendance tracker the",
          "department still uses.",
          "",
          "My CV is attached. I am available for interview at any time.",
          "",
          "Chioma Eze · 0802 656 8715",
        ],
      },
      {
        kind: "p",
        text: "Four sentences, one number, one attachment. That is the whole email — and it is more than most graduate applications contain.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Write the CV before you need it",
        text: "The week you finish NYSC is the easiest time to write it: the details are fresh and you have the certificate in your hand. Six months later, people cannot remember the dates.",
      },
      {
        kind: "cta",
        title: "Get a graduate CV written for you",
        text: "Basic is ₦5,000 — one rewrite, ATS layout, PDF and Word, delivered in 2–3 working days.",
        label: "See CV writing packages",
        href: "/cv-writing",
      },
    ],
  },
  {
    slug: "cv-mistakes-nigerian-recruiters",
    hub: "cv",
    title: "Nine CV mistakes Nigerian recruiters reject instantly",
    metaTitle: "9 CV mistakes Nigerian recruiters reject — and how to fix them",
    description:
      "From “responsible for” to a four-page CV, these are the errors that end an application in the first ten seconds — and the exact fix for each one.",
    excerpt:
      "The average first pass is six to ten seconds. These nine things end yours before the second one.",
    published: "2026-10-06",
    author: "GetAJob Career Desk",
    minutes: 5,
    blocks: [
      {
        kind: "p",
        text: "Recruiters are not reading your CV first. They are scanning it — for a job title, a company, a number and a reason to keep going. Six to ten seconds is the usual first pass. These are the things that stop it.",
      },
      { kind: "h2", text: "The nine" },
      {
        kind: "ol",
        items: [
          "**A wall of duties.** “Responsible for managing the front desk” says what you were assigned. “Handled 60+ walk-in enquiries a day and cut average wait time from 12 to 5 minutes” says what happened. Results beat responsibilities every time.",
          "**No numbers anywhere.** Not every job can be measured in Naira, but almost all can be measured in volume, speed, accuracy or size of team. If a page of your CV has no digit on it, it is too vague.",
          "**One CV for every job.** Recruiters can tell within two lines that the CV was written for something else. Keep a master CV, then cut and re-order it for each advert.",
          "**A contact line that fails.** A typo in the phone number, an email like `sexy_girl_2004@`, no city. This is the most common reason a shortlisted candidate is never reached.",
          "**The company's name spelled wrong.** Copy it from the advert. It reads as carelessness, and carelessness is fatal in a job where accuracy matters.",
          "**Unexplained gaps.** A gap is not disqualifying; an unexplained one is. One line fixes it: “Family responsibilities, 2024”, “Completed MSc, 2023”, “Freelance design, 2024–2025”.",
          "**Clutter around identity.** Photo, date of birth, marital status, religion, state of origin. If the employer's own form asks, answer there. On the CV it takes space and invites bias.",
          "**Typos and mixed tenses.** “Manage”, “managed” and “managing” in the same job history. Read it aloud once, then read it backwards — you catch more that way.",
          "**Four pages for three years of work.** Length is not seriousness. One page under eight years, two after that, and nothing from secondary school unless it is your highest qualification.",
        ],
      },
      { kind: "h2", text: "The three that end it fastest" },
      {
        kind: "p",
        text: "If you only fix three, fix the numbers, the contact line and the length. Those are the ones a recruiter discovers in the first pass, and each one alone can be enough to move your file to the no pile.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "The two-minute self-check",
        text: "Cover the page, then read only your job titles and the first three words of each bullet. If that skim tells a story of someone who improved things, the CV works. If it reads as a list of duties, it does not.",
      },
      { kind: "h2", text: "Fix them in one sitting" },
      {
        kind: "ol",
        items: [
          "Print the advert and underline every requirement.",
          "Reorder your bullets so the most relevant one is first in each job.",
          "Add one number to every bullet that could possibly have one.",
          "Cut the oldest job that no longer helps.",
          "Read the whole thing out loud, then send it to one honest friend.",
        ],
      },
      { kind: "h2", text: "The before and after" },
      {
        kind: "p",
        text: "The difference between a duty and an achievement is usually one number and one verb. These are real shapes of bullets Nigerian recruiters see, and the version that gets read twice.",
      },
      {
        kind: "template",
        title: "Rewrite like this",
        lines: [
          "Before:  Responsible for managing the company social media accounts.",
          "After:   Grew Instagram from 1,200 to 9,400 followers in five months, and",
          "         the enquiries it produced paid for one full-time hire.",
          "",
          "Before:  Handled customer complaints.",
          "After:   Resolved 40+ complaints a week across phone and WhatsApp with a",
          "         94% first-contact resolution rate.",
          "",
          "Before:  Assisted the accountant.",
          "After:   Reconciled a ₦40m monthly stock ledger in Excel and cut",
          "         discrepancies from 9% to under 1%.",
        ],
      },
      {
        kind: "p",
        text: "None of those needed a promotion or a bigger job. They needed the person to write down what actually changed because they were there.",
      },
      { kind: "h2", text: "How to catch the typos" },
      {
        kind: "ol",
        items: [
          "**Read it aloud.** Your mouth trips over the sentence your eye skipped.",
          "**Read it backwards**, from the last line to the first. You stop predicting and start seeing.",
          "**Change the font and size**, then read again. Your brain stops auto-correcting.",
          "**Check the names**: the company, the role, your referees, your own phone number.",
          "**Send it to one person** who will tell you the truth, and give them a deadline of an hour so they actually read it.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "Spellcheck is not enough",
        text: "It will not catch “manger” for “manager”, “form” for “from”, or a mixed-up company name. Those are the three that cost people interviews.",
      },
      {
        kind: "cta",
        title: "Let a Nigerian HR writer check it",
        text: "Standard includes a rewrite, a cover letter and two rounds of revisions — ₦10,000, paid once.",
        label: "Compare the packages",
        href: "/cv-writing#packages",
      },
    ],
  },

  /* ────────────────────────── Interviews & salary ───────────────────────── */
  {
    slug: "tell-me-about-yourself-nigeria",
    hub: "interviews",
    title: "“Tell me about yourself”: the answer that works in Nigerian interviews",
    metaTitle: "How to answer “tell me about yourself” in a Nigerian interview",
    description:
      "It is not an invitation to tell your life story. A four-part, 90-second answer — with a full worked script you can adapt tonight.",
    excerpt:
      "Ninety seconds, four parts, one proof point. The script most candidates never prepare.",
    published: "2026-10-08",
    author: "GetAJob Career Desk",
    minutes: 5,
    blocks: [
      {
        kind: "p",
        text: "It is almost always the first question, and it is the one most candidates answer worst. People start from primary school, or they recite their CV, or they say “I am a hardworking and dedicated person” and stop.",
      },
      { kind: "h2", text: "What they are actually asking" },
      {
        kind: "ul",
        items: [
          "Can you summarise yourself in a minute without rambling?",
          "Do you understand what this job is?",
          "Have you done anything that resembles it?",
          "Are you going to be easy to work with?",
        ],
      },
      {
        kind: "p",
        text: "Nothing about that requires your life story. It requires ninety seconds, structured.",
      },
      { kind: "h2", text: "The four-part answer" },
      {
        kind: "ol",
        items: [
          "**Present** — who you are and what you do now, in one sentence.",
          "**Proof** — one specific thing you did that is relevant to this role, with a number in it.",
          "**Future** — why this job, at this company, is the logical next step.",
          "**Close** — one line handing the conversation back: “That's why this role interested me.”",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Time it",
        text: "Ninety seconds is roughly 220 words spoken at a normal pace. If your answer runs past two minutes, you have started reciting your CV.",
      },
      { kind: "h2", text: "A worked example" },
      {
        kind: "p",
        text: "For a customer service role at a Lagos fintech:",
      },
      {
        kind: "template",
        title: "Adapt this",
        lines: [
          "“I'm a customer support officer with three years' experience, most recently at a retail bank in Ikeja.",
          "",
          "In my current role I handle about 70 customer conversations a day across phone and WhatsApp. When complaint backlog hit four days last year, I built a simple tagging system in Excel so the team could see recurring issues, and we brought it down to under 24 hours in six weeks.",
          "",
          "I want to move into fintech because the pace and the product complexity are where I do my best work — and this role is squarely about exactly what I've been doing, at a company whose app I actually use.",
          "",
          "That's why the role interested me.”",
        ],
      },
      {
        kind: "p",
        text: "Notice what it does not contain: no childhood, no list of every job, no “I'm a hardworking person”. It contains one number, one action and one reason.",
      },
      { kind: "h2", text: "The four ways it goes wrong" },
      {
        kind: "ul",
        items: [
          "**Starting at secondary school.** Everything before your first real job is context, not content.",
          "**Reciting the CV line by line.** They have it in front of them. Add something the page cannot show.",
          "**Badmouthing the last employer.** It is the single fastest way to lose a Nigerian panel. Frame every exit as a pull towards something, not a push away.",
          "**Naming salary in the first minute.** That conversation has its own slot, and it is not this one.",
        ],
      },
      { kind: "h2", text: "Prepare three versions" },
      {
        kind: "p",
        text: "Write one for the role you want most, one for a role in an adjacent industry, and a sixty-second version for phone screens. Then say each one out loud three times. Not in your head — out loud, on your feet. The first time you hear it should not be in the room.",
      },
      { kind: "h2", text: "Two shorter versions you also need" },
      {
        kind: "p",
        text: "The ninety-second answer is for the interview room. You will also need a thirty-second version for a phone screen and a two-line version for a WhatsApp or LinkedIn introduction.",
      },
      {
        kind: "template",
        title: "The 30-second phone version",
        lines: [
          "“I'm a customer support officer with three years in retail banking,",
          "currently handling about 70 conversations a day. I'm looking to move",
          "into fintech, which is why I applied for this role.”",
        ],
      },
      {
        kind: "template",
        title: "The two-line message version",
        lines: [
          "“Good morning — I'm Chioma, a customer support officer with three years",
          "in retail banking, currently at [Bank] in Ikeja. I'd like to ask about the",
          "Customer Service Officer role you posted on Monday.”",
        ],
      },
      {
        kind: "p",
        text: "The message version is what you send to a referral, and it works far better than “please help me with a job”. It tells the person who you are, what you do and exactly what you want, in the time it takes to read a text.",
      },
      { kind: "h2", text: "If they interrupt" },
      {
        kind: "p",
        text: "They will. An interviewer who hears something interesting stops you to ask about it — that is a good sign, not a failure. Answer the question they asked, then bring yourself back with one line: “Shall I carry on with the rest?”",
      },
      {
        kind: "p",
        text: "What you must not do is lose the thread and start again from the beginning. Your structure is a spine, not a script.",
      },
      {
        kind: "callout",
        tone: "warn",
        title: "The one thing to avoid",
        text: "Never answer this question with what you want from them. “I need a job because I've been unemployed for eight months” is honest and it is also the fastest way to end the conversation. Lead with what you offer.",
      },
      {
        kind: "cta",
        title: "Rehearse with someone who does this weekly",
        text: "Job Seeker Pro includes interview preparation for the specific company and role before every interview you attend.",
        label: "What Pro includes",
        href: "/pro",
      },
    ],
  },
  {
    slug: "salary-negotiation-naira",
    hub: "interviews",
    title: "How to negotiate salary in Naira without losing the offer",
    metaTitle: "Salary negotiation in Nigeria — scripts, ranges and the tax you forget",
    description:
      "When to name a number, what to say when they insist, how to work out your walk-away figure, and the allowances that matter more than basic pay.",
    excerpt:
      "What to say when they ask for a number, what your real floor is, and the four things worth more than basic pay.",
    published: "2026-10-11",
    author: "GetAJob Career Desk",
    minutes: 7,
    blocks: [
      {
        kind: "p",
        text: "Most Nigerian candidates lose money twice: once by accepting the first figure, and once by not knowing what the figure actually leaves them at the end of the month. This is how to fix both.",
      },
      { kind: "h2", text: "Find the range before the interview" },
      {
        kind: "p",
        text: "Walk in with a band, not a wish. Three sources, in order of reliability:",
      },
      {
        kind: "ol",
        items: [
          "**Adverts for the same title.** Look at ten recent adverts in the same city and note the disclosed ranges. [Our board](/jobs) shows the salary an employer disclosed, where they disclosed one.",
          "**People in the role.** One polite message to someone two years ahead of you is worth more than any salary website.",
          "**Recruiters.** Ask the agency what band the client has budgeted. They usually know and often say.",
        ],
      },
      { kind: "h2", text: "Do not name a number first" },
      {
        kind: "p",
        text: "If asked early, deflect once, politely:",
      },
      {
        kind: "template",
        title: "Say this",
        lines: [
          "“I'd rather understand the range you've budgeted for the role first — I'm confident we can make it work if the fit is right.”",
        ],
      },
      {
        kind: "p",
        text: "If they push again, give the band. Not a single figure: a band, with your target at the bottom of it and your hope at the top.",
      },
      { kind: "h2", text: "Work out your real floor" },
      {
        kind: "p",
        text: "Your floor is not what you want. It is what you can survive on without borrowing. Add it up honestly, monthly:",
      },
      {
        kind: "ul",
        items: [
          "Rent, divided by twelve if you pay annually (most Lagos landlords do).",
          "Transport to and from that specific office, at that specific time of day.",
          "Food, data, electricity, water.",
          "Anything you send home. Be honest — it is not optional.",
          "Debt repayments and a small buffer for the month something breaks.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "A worked example",
        text: "₦150,000 rent in Lagos (₦12,500/month), ₦60,000 transport, ₦80,000 food, ₦25,000 data and utilities, ₦40,000 to family, ₦20,000 savings. Floor: about ₦237,500 net. If the offer is ₦250,000 gross, it is below your floor once PAYE and pension come out.",
      },
      { kind: "h2", text: "Gross, net and the deductions nobody explains" },
      {
        kind: "p",
        text: "Always ask whether the figure is gross or net, and get it in writing. On a Nigerian payslip you will typically see:",
      },
      {
        kind: "ul",
        items: [
          "**PAYE** — income tax, deducted at source. Under the tax reforms that took effect in January 2026, the first ₦800,000 of annual income is taxed at 0%, and the next band at 15%.",
          "**Pension** — 8% of your basic, with the employer adding 10%, for organisations with 15 or more staff.",
          "**NHF** — 2.5% of basic, if your employer deducts it.",
          "**HMO and other benefits** — usually free to you, occasionally shared.",
        ],
      },
      {
        kind: "p",
        text: "A ₦300,000 gross offer can be closer to ₦270,000 in your account. Ask for a sample payslip before you accept.",
      },
      { kind: "h2", text: "The counter-offer script" },
      {
        kind: "template",
        title: "When the number is below your band",
        lines: [
          "“Thank you — I'm excited about the role and I want to make this work.",
          "",
          "Based on the scope and what similar roles are paying in Lagos, I was expecting something closer to ₦X. Is there room to move on the basic, or on the allowances?”",
        ],
      },
      {
        kind: "p",
        text: "Then stop talking. The silence is doing the work.",
      },
      { kind: "h2", text: "Four things worth more than basic pay" },
      {
        kind: "ol",
        items: [
          "**A six-month review with a written number attached.** “We review annually” is worth less than “₦X at six months, subject to performance”.",
          "**HMO that covers your dependants**, not just you. This is real money.",
          "**Transport allowance**, especially in Lagos and Abuja. It is often tax-free where basic is not.",
          "**13th month, leave days and training budget.** Three extra days and a certification can be worth more than ₦20,000 on basic.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Get it in writing before you resign",
        text: "A verbal offer is not an offer. Wait for the letter, check the figure against what was discussed, and only then hand in your notice.",
      },
      { kind: "h2", text: "When they say the budget is fixed" },
      {
        kind: "p",
        text: "Sometimes it genuinely is — a public sector grade level, a donor-funded band, a role with a published scale. You can usually tell the difference: a real fixed band comes with a document behind it.",
      },
      {
        kind: "p",
        text: "If it is fixed, stop pushing on basic. Move the conversation to the things that are not in the band:",
      },
      {
        kind: "ol",
        items: [
          "An earlier review — six months rather than twelve, with a number attached.",
          "A transport or data allowance that sits outside the grade.",
          "One funded certification in the first year.",
          "Additional leave, or a compressed week.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Never negotiate with a bluff",
        text: "Do not say you have another offer unless you do. Nigerian markets are small, recruiters in the same sector talk, and being caught costs you far more than the ₦20,000 you were chasing.",
      },
      { kind: "h2", text: "The email after the call" },
      {
        kind: "p",
        text: "Whatever you agree on the phone, put it in writing the same day. It protects you and it makes you look organised:",
      },
      {
        kind: "template",
        title: "Confirmation email",
        lines: [
          "Subject: Customer Service Officer offer — confirming our conversation",
          "",
          "Dear Ada,",
          "",
          "Thank you for the call today. To confirm what we agreed:",
          "",
          "• Basic salary: ₦260,000 gross per month",
          "• Transport allowance: ₦30,000 per month",
          "• HMO covering me and one dependant, from month one",
          "• Review at six months",
          "• Start date: 3 November 2026",
          "",
          "Please let me know if I have misunderstood any part of this. I am",
          "delighted to accept and look forward to the formal letter.",
          "",
          "Chioma Eze",
        ],
      },
      {
        kind: "p",
        text: "Sent politely, this is not confrontational — it is the behaviour of someone who reads contracts. It also gives the employer a chance to correct a misunderstanding before it becomes a resignation letter three months later.",
      },
      {
        kind: "cta",
        title: "See what roles are actually disclosing",
        text: "Filter the board by salary to see what employers in your field and state have published.",
        label: "Browse jobs by salary",
        href: "/jobs",
      },
    ],
  },
  {
    slug: "interview-questions-nigeria",
    hub: "interviews",
    title: "Twenty questions Nigerian interviewers actually ask",
    metaTitle: "20 Nigerian interview questions (and how to answer them)",
    description:
      "The standard questions, the ones that are specific to hiring in Nigeria — relocation, guarantors, NYSC — and short guidance on the three that trip people up.",
    excerpt:
      "Including the two that only appear in Nigeria: relocation and a guarantor form.",
    published: "2026-10-14",
    author: "GetAJob Career Desk",
    minutes: 8,
    blocks: [
      {
        kind: "p",
        text: "Interview panels repeat themselves. These are the questions that come up again and again in Nigerian interviews, split into the standard ones and the ones that are specific to hiring here.",
      },
      { kind: "h2", text: "The ten standard questions" },
      {
        kind: "ol",
        items: [
          "Tell me about yourself.",
          "Why do you want this job?",
          "Why are you leaving your current role?",
          "What are your strengths?",
          "What is your biggest weakness?",
          "Where do you see yourself in five years?",
          "Tell me about a time you handled a difficult customer or colleague.",
          "Tell me about a time you failed. What did you do next?",
          "Why should we hire you over the other candidates?",
          "What do you know about our company?",
        ],
      },
      { kind: "h2", text: "The ten Nigerian ones" },
      {
        kind: "ol",
        items: [
          "Are you willing to relocate?",
          "Do you have a guarantor?",
          "Have you completed NYSC? Do you have your discharge certificate?",
          "What is your current salary, and what are your expectations?",
          "When can you start?",
          "Are you comfortable with the salary range for this role?",
          "Do you have your NYSC certificate, WAEC result and degree certificate ready?",
          "How would you get to this office every day?",
          "Are you interviewing anywhere else?",
          "Do you have any questions for us?",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "Bring the documents",
        text: "A folder with your CV, NYSC discharge certificate, degree certificate, WAEC result, a passport photograph and two referees' details. Panels ask for them on the day more often than you would expect.",
      },
      { kind: "h2", text: "The three that trip people up" },
      { kind: "h3", text: "“Are you willing to relocate?”" },
      {
        kind: "p",
        text: "Answer the real question — will you actually show up in that city? If yes, say yes and name a date. If it depends, say what it depends on: “Yes, for a role at this level. I would need about three weeks to arrange accommodation.” Never say “I can consider it” — that reads as no.",
      },
      { kind: "h3", text: "“Do you have a guarantor?”" },
      {
        kind: "p",
        text: "Normal in Nigerian banking, insurance, fintech and anything handling cash. A guarantor is usually a civil servant or a person of standing who signs for your honesty, sometimes with their own employer's confirmation. Line someone up **before** you need them, and ask their permission first. If you genuinely do not have one, say what you do have — a previous employer reference, a landlord, a church or mosque leader.",
      },
      { kind: "h3", text: "“What are your salary expectations?”" },
      {
        kind: "p",
        text: "Give a band, anchored on what the role pays in that city, and say it calmly. Full scripts are in [how to negotiate salary in Naira](/blog/salary-negotiation-naira).",
      },
      { kind: "h2", text: "Five questions worth asking them" },
      {
        kind: "ul",
        items: [
          "What does success look like in this role in the first six months?",
          "How is the team structured, and who would I report to day to day?",
          "What has made previous people in this role struggle?",
          "How does the company handle performance reviews?",
          "What are the next steps after today, and when should I expect to hear?",
        ],
      },
      {
        kind: "p",
        text: "That last one matters more than it looks: it tells you when to follow up, and it gives you a reason to write.",
      },
      { kind: "h2", text: "What a good answer looks like" },
      {
        kind: "ul",
        items: [
          "**Why this job?** Connect one thing the company actually does to one thing you are good at. Not “I need a job.”",
          "**Why are you leaving?** Look forward, not back. “I've gone as far as I can in that team and I want [specific scope]” beats a list of complaints.",
          "**Strengths?** Pick two that the advert asked for, and prove each with a number.",
          "**Weakness?** One real, non-fatal weakness and the system you built around it. “I used to over-commit. Now I put every request in a tracker and confirm the deadline before I agree.”",
          "**Five years?** Show ambition that fits the company. “Running a team like this one, having learned the business properly first.”",
          "**Why should we hire you?** Three sentences: what you have done, what this role needs, and the overlap between them.",
        ],
      },
      {
        kind: "p",
        text: "For “tell me about a time you failed”, pick a real failure that did not harm anyone, then spend most of the answer on what you changed afterwards. Interviewers remember the change, not the failure.",
      },
      { kind: "h2", text: "Panel interviews" },
      {
        kind: "p",
        text: "Nigerian panels are often three to five people: HR, the line manager, sometimes a director. Three practical rules.",
      },
      {
        kind: "ol",
        items: [
          "**Answer the person who asked**, then include the room in one sentence at the end. Staring only at the most senior person reads as politics.",
          "**Take the glass of water.** It buys you three seconds to think, and nobody has ever been marked down for it.",
          "**Write down their names** as they introduce themselves, and use them once. It is a small thing that makes you memorable.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "The question behind the question",
        text: "“Are you interviewing anywhere else?” is really “are we wasting our time?”. Answer honestly and give a timeline — “yes, one other process, and I expect to decide within two weeks” — then tell them where they stand.",
      },
      {
        kind: "cta",
        title: "Practise before the real one",
        text: "Pro members get interview preparation for the specific company and role before every interview.",
        label: "See what Pro includes",
        href: "/pro",
      },
    ],
  },

  /* ───────────────────────────── Job search ───────────────────────────── */
  {
    slug: "how-to-apply-nigeria",
    hub: "search",
    title: "How to apply for a job so a human actually reads it",
    metaTitle: "How to apply for jobs in Nigeria (and actually get read)",
    description:
      "Apply early, name your files properly, write a 150-word email, follow up once — the unglamorous mechanics that decide whether your application is seen.",
    excerpt:
      "The first 48 hours, the subject line, the 150-word email and the single follow-up that works.",
    published: "2026-09-24",
    author: "GetAJob Career Desk",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "Two candidates with identical CVs get different outcomes because of how they applied. This is the unglamorous mechanics of it.",
      },
      { kind: "h2", text: "Apply in the first 48 hours" },
      {
        kind: "p",
        text: "Most Nigerian employers shortlist in waves, and the first wave usually starts within the first week. By day ten, the hiring manager has a shortlist and is reading new applications for exceptions only. Applying on day one is not a guarantee, but applying on day fourteen is close to a no.",
      },
      {
        kind: "p",
        text: "This is why alerts matter. [Daily WhatsApp alerts](/pro) exist precisely because the value of an opening decays every day it is public.",
      },
      { kind: "h2", text: "Name your files properly" },
      {
        kind: "p",
        text: "A recruiter downloading forty CVs sees `CV.pdf`, `CV.pdf (2)` and `my cv final final.pdf`. Be the one they can find again:",
      },
      {
        kind: "template",
        title: "File names",
        lines: [
          "Chioma-Eze-Customer-Service-Officer.pdf",
          "Chioma-Eze-Cover-Letter.pdf",
          "Chioma-Eze-NYSC-Certificate.pdf",
        ],
      },
      { kind: "h2", text: "The subject line does half the work" },
      {
        kind: "p",
        text: "If the advert names a format, use it exactly — many teams filter on it. If it does not, use:",
      },
      {
        kind: "template",
        title: "Subject line",
        lines: ["Application: Customer Service Officer — Chioma Eze"],
      },
      { kind: "h2", text: "Write a 150-word email" },
      {
        kind: "p",
        text: "Nobody reads a cover letter pasted into an email. Four short paragraphs do more:",
      },
      {
        kind: "ol",
        items: [
          "**What you are applying for**, by exact title, and where you saw it.",
          "**One proof point** relevant to the advert, with a number.",
          "**Why this company** — one specific sentence that could not be sent to anyone else.",
          "**Close**: documents attached, available for interview, your phone number.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Check three things before you send",
        text: "The company name, the role title, and the file that is actually attached. Sending the wrong attachment — or a cover letter addressed to a competitor — is more common than anyone admits.",
      },
      { kind: "h2", text: "Follow up once" },
      {
        kind: "p",
        text: "Five to seven working days later, one short message: who you are, the role, the date you applied, one line of continued interest. Then stop. A second follow-up moves you from keen to difficult.",
      },
      { kind: "h2", text: "Track everything" },
      {
        kind: "p",
        text: "A simple sheet: date applied, company, role, where you found it, contact name, follow-up date, outcome. Two reasons. First, you cannot learn from a search you cannot see. Second, Nigerian adverts disappear — the page is taken down, the WhatsApp group is deleted — and six weeks later you will not remember what you applied for when the call comes.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Screenshot the advert",
        text: "Save the full advert as a PDF or screenshot at the moment you apply. It is your record of what was promised, including the salary.",
      },
      { kind: "h2", text: "Referrals beat applications" },
      {
        kind: "p",
        text: "One message to someone who works there beats fifty applications. Not “please help me get a job” — be specific: the role, the reference number, one line on why you fit, and a request to forward your CV to whoever owns the role. People are far more willing to forward a CV than to vouch for a stranger.",
      },
      { kind: "h2", text: "Where the jobs actually are" },
      {
        kind: "p",
        text: "Nigerian candidates tend to look in two places — a job board and a WhatsApp group — and then conclude the market is empty. The market is spread across five, and they reward different approaches.",
      },
      {
        kind: "ol",
        items: [
          "**Company career pages.** The roles that never reach a board. Pick twenty companies you would actually work for, and check their pages weekly.",
          "**Job boards** like [this one](/jobs), where the salary is disclosed more often than on social media adverts.",
          "**LinkedIn.** Not the job listings — the people. A message to the recruiter who posted the role works far more often than another application in the pile.",
          "**Referrals** inside companies you already know someone at. The highest conversion route there is.",
          "**Sector-specific channels** — NGO job newsletters, engineering and HSE groups, hospital notice boards, professional association mailing lists.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Two-thirds of adverts never say the salary",
        text: "When an advert hides the number, look up the same title in the same city in [the salary guide](/blog/salary-guide-nigeria) before you apply, so you are not the cheapest person in the final round.",
      },
      { kind: "h2", text: "A tracker you can copy" },
      {
        kind: "template",
        title: "One row per application",
        lines: [
          "Date | Company | Role | Source | Contact | Follow-up | Outcome",
          "-----|---------|------|--------|---------|-----------|--------",
          "02/10| Access   | CSO  | Board  | Ada (HR)| 10/10     | Interview",
          "03/10| Kobo     | Support | LinkedIn | —   | 12/10     | No reply",
        ],
      },
      {
        kind: "p",
        text: "After six weeks, read the sheet. You will see which source actually produces interviews for you, and most people discover it is not the one they spend their evenings on.",
      },
      {
        kind: "cta",
        title: "Find something worth applying to",
        text: "Every listing on the board shows the employer, the location and the salary where it was disclosed.",
        label: "Browse open roles",
        href: "/jobs",
      },
    ],
  },
  {
    slug: "fake-job-adverts-nigeria",
    hub: "search",
    title: "How to spot a fake job advert — and the one rule that never fails",
    metaTitle: "How to spot fake job adverts in Nigeria — 8 warning signs",
    description:
      "The one rule that never fails, eight warning signs, the BVN and OTP trap, and exactly what to do if you have already paid.",
    excerpt:
      "The one rule, eight warning signs, and what to do if you have already paid.",
    published: "2026-09-29",
    updated: "2026-10-17",
    author: "GetAJob Career Desk",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "Job scams in Nigeria do not look like scams. They look like a recruiter who is impressed by your CV and wants to move quickly. The cost is usually ₦5,000 to ₦30,000, and the shame of it keeps people from reporting.",
      },
      { kind: "h2", text: "The one rule" },
      {
        kind: "callout",
        tone: "warn",
        title: "No real employer charges you to get a job",
        text: "Not for a form. Not for training. Not for a uniform, a medical, a laptop, a “processing fee” or a “verification”. If money has to leave your hand before you start work, it is not a job. There is no exception to this.",
      },
      { kind: "h2", text: "Eight warning signs" },
      {
        kind: "ol",
        items: [
          "**Any fee at all** — application, form, training, kit, medical, documentation.",
          "**An interview in a hotel room, a bus, or only on a WhatsApp call** with no office address that checks out on a map.",
          "**No company name, or a free email** — a Gmail or Yahoo address for a company that claims to be a bank or an oil firm.",
          "**A salary far above the market** for the title, especially with no experience required.",
          "**Bank details or BVN requested before an offer.** An employer needs your account number to pay you, not to hire you.",
          "**Pressure to decide today**, or a fee that “expires” in two hours.",
          "**A recruiter messaging from a brand-new account**, or one that cannot name who they report to.",
          "**“Send your CV to this number”** with no job title, no company and no address.",
        ],
      },
      { kind: "h2", text: "The BVN and OTP trap" },
      {
        kind: "p",
        text: "Never share your BVN, your bank PIN or any one-time password. Not with a recruiter, not with someone who says they are confirming your salary account, not with anyone who calls and says they are from your bank. A genuine employer may ask for your account number **after** you have accepted an offer — never before, and never with an OTP.",
      },
      {
        kind: "p",
        text: "If someone already has your BVN and is asking for an OTP to “complete your registration”, your account is being emptied while you read the message. Hang up and call your bank.",
      },
      { kind: "h2", text: "Verify a company in five minutes" },
      {
        kind: "ol",
        items: [
          "Search the company name on the **CAC public search**. A real Nigerian company is registered.",
          "Check the **website domain** — does the email come from that domain, or a free inbox?",
          "Find the **phone number on the company's own website** and call it. Do not call the number in the advert.",
          "Search **“company name + scam”** and check the date of what comes back.",
          "Look at the **office address on Google Maps** — street view, reviews, whether it is a real building.",
        ],
      },
      { kind: "h2", text: "If you have already paid" },
      {
        kind: "ol",
        items: [
          "**Stop sending money.** Do not pay a second fee to “release” your offer.",
          "**Call your bank immediately** and ask them to flag the transaction; ask about a recall if it is recent.",
          "**Report to the police cybercrime unit** — the NPF National Cybercrime Centre takes reports online, and a report number helps with the bank.",
          "**Tell the platform** where you saw the advert so it can be removed.",
          "**Keep everything**: the advert, the chat, the account number, the receipt.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Reporting one protects the next person",
        text: "Send the advert link and screenshots to support@getajob.com.ng or report the listing from the job page. We remove listings that ask candidates for money.",
      },
      { kind: "h2", text: "Red flags in the interview itself" },
      {
        kind: "ul",
        items: [
          "**You are interviewed in a hotel room, a beer parlour or a car**, with no office to visit and no one else present.",
          "**They cannot name the role's manager**, or what the company actually sells.",
          "**The offer arrives in the first conversation**, before anyone has checked your references or your skills.",
          "**They want your BVN, your ATM card or an OTP** “to set up salary payment”.",
          "**The salary is far above the market** and nobody asks you a single technical question.",
          "**They ask you to recruit others** before you start, or to pay for a “starter pack”.",
        ],
      },
      {
        kind: "p",
        text: "One of these can be innocent. Three together is a scam, no matter how professional the WhatsApp profile looks.",
      },
      { kind: "h2", text: "A real job at a bad employer" },
      {
        kind: "p",
        text: "Some adverts are genuine and still worth walking away from. Watch for a role that has been reposted every month for a year — it usually means the person keeps leaving. Watch for a salary described only as “attractive”, a demand for a guarantor before any interview, and a notice period longer than your probation.",
      },
      {
        kind: "p",
        text: "Ask one question in the interview: **“Why is this role open?”** A good answer names a promotion, a growth plan or a resignation. A bad answer is vague, or a story in which everyone before you was the problem.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "You can say no",
        text: "An offer is not a summons. If the interview felt wrong, declining costs you nothing and protects you from a much more expensive mistake.",
      },
      {
        kind: "cta",
        title: "Every role here is checked before it goes up",
        text: "If a listing on the board ever asks you for a fee, report it and we will take it down.",
        label: "Browse verified roles",
        href: "/jobs",
      },
    ],
  },

  /* ───────────────────────────── Pay & places ───────────────────────────── */
  {
    slug: "salary-guide-nigeria",
    hub: "sectors",
    title: "What Nigerian professionals actually earn in 2026",
    metaTitle: "Salary guide Nigeria 2026 — what roles actually pay",
    description:
      "Advertised monthly salary bands by role family and level, why the same title pays so differently, and how to check a specific offer before you accept it.",
    excerpt:
      "Advertised monthly bands by role family — and the four reasons the same title pays so differently.",
    published: "2026-10-04",
    updated: "2026-10-16",
    author: "GetAJob Career Desk",
    minutes: 7,
    blocks: [
      {
        kind: "p",
        text: "Nobody in Nigeria agrees on what a job should pay, and most adverts still hide the number. What follows are the gross monthly bands employers have been advertising for common roles — a starting point for a conversation, not a rule.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "How to read these numbers",
        text: "Gross, per month, before PAYE and pension. They come from roles advertised in 2026 across Lagos, Abuja and Port Harcourt. Company size, sector and state move them a lot — use the band to anchor, then check three live adverts for the exact title.",
      },
      { kind: "h2", text: "Entry level (0–2 years)" },
      {
        kind: "ul",
        items: [
          "**Administration and office support** — ₦80,000 to ₦180,000. The wide range is company size: a small firm in Surulere and a multinational in Victoria Island are not the same market.",
          "**Customer service and call centre** — ₦100,000 to ₦200,000, higher in fintech and telecoms, often with shift allowances.",
          "**Sales** — ₦90,000 to ₦180,000 basic plus commission. Ask what a realistic commission is; some pay more in commission than basic.",
          "**Teaching (private schools)** — ₦80,000 to ₦180,000, with the top of the band in international schools.",
          "**Nursing (private hospitals)** — ₦120,000 to ₦250,000. Public sector is lower on paper and higher in pension and security.",
          "**IT support** — ₦150,000 to ₦280,000.",
        ],
      },
      { kind: "h2", text: "Mid level (3–6 years)" },
      {
        kind: "ul",
        items: [
          "**Accounting and finance** — ₦250,000 to ₦550,000; higher with ICAN or ACCA.",
          "**Human resources** — ₦250,000 to ₦500,000.",
          "**Banking operations** — ₦300,000 to ₦600,000, with sales targets that affect your actual take-home.",
          "**Software development** — ₦400,000 to ₦1,000,000; a remote role for a foreign client can be several times this.",
          "**Engineering (mechanical, electrical, civil)** — ₦300,000 to ₦700,000, with oil and gas at the top.",
          "**Digital marketing** — ₦250,000 to ₦600,000.",
        ],
      },
      { kind: "h2", text: "Senior (7+ years)" },
      {
        kind: "ul",
        items: [
          "**Managers and heads of department** — ₦700,000 to ₦1,800,000.",
          "**Specialist engineers, senior developers, senior accountants** — ₦900,000 to ₦2,500,000.",
          "**Oil and gas technical roles** — often above ₦1,500,000, and often on contract terms with different benefits.",
          "**Donor-funded and NGO programme roles** — ₦800,000 to ₦2,000,000; the bands are published, which makes them unusually easy to check.",
        ],
      },
      { kind: "h2", text: "Why the same title pays differently" },
      {
        kind: "ol",
        items: [
          "**Company size and ownership.** A 12-person agency and a listed bank hire the same job title at completely different prices.",
          "**Sector.** Oil and gas, telecoms, banking and donor-funded programmes pay above the rest for the same skill.",
          "**State.** Lagos pays more, and costs more. See [the comparison with Abuja and Port Harcourt](/blog/jobs-lagos-abuja-port-harcourt).",
          "**Who the client is.** A developer billing a US client in dollars is in a different market from one building for a local retailer.",
        ],
      },
      { kind: "h2", text: "How to check a specific offer" },
      {
        kind: "ol",
        items: [
          "Find three live adverts for the same title in the same city and note the disclosed ranges.",
          "Add up the things that are not basic: transport, HMO cover for dependants, 13th month, pension, data allowance.",
          "Convert to net using a sample payslip, or ask what the net figure is.",
          "Compare against your floor — [the walk-away number](/blog/salary-negotiation-naira).",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Watch commission-only structures",
        text: "A “₦400,000 salary” that is ₦80,000 basic plus commission is an ₦80,000 job until you see the numbers behind the commission. Ask what a typical month looked like for the last person in the role.",
      },
      { kind: "h2", text: "The allowances that change the real number" },
      {
        kind: "p",
        text: "Two offers at ₦350,000 are rarely worth the same. Compare the package, not the basic:",
      },
      {
        kind: "ul",
        items: [
          "**Transport allowance** — often ₦30,000 to ₦80,000 a month in Lagos and Abuja, and frequently paid without tax.",
          "**HMO** — worth very little when it covers only you; worth a great deal when it covers a spouse and children.",
          "**13th month** — effectively an 8% uplift on annual pay, and common in banking and FMCG.",
          "**Pension** — 10% from the employer on top of your basic is real money you will see at retirement.",
          "**Data and electricity allowances** — increasingly common for hybrid and remote roles, and easy to forget when comparing.",
        ],
      },
      {
        kind: "p",
        text: "Add the annual value of each to the basic, then compare. A ₦330,000 offer with a strong package routinely beats ₦380,000 with none.",
      },
      { kind: "h2", text: "Where the bands are published" },
      {
        kind: "p",
        text: "Some sectors publish their salaries as a matter of routine, which makes them the easiest to benchmark: donor-funded programmes and NGOs, the public service, and a growing number of fintechs. In the private sector, the disclosed ranges on job adverts are the most reliable public signal there is — which is why [filtering the board by salary](/jobs) is faster than asking around.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Ask a person, not a website",
        text: "One message to someone two years ahead of you in the same role, in the same city, will tell you more than any salary survey. Ask what the range was when they were hired, not what they earn now.",
      },
      {
        kind: "cta",
        title: "Filter the board by what it pays",
        text: "Set a minimum salary and see only the roles that have disclosed one.",
        label: "Browse jobs by salary",
        href: "/jobs",
      },
    ],
  },
  {
    slug: "jobs-lagos-abuja-port-harcourt",
    hub: "sectors",
    title: "Lagos, Abuja or Port Harcourt: where the job and the money actually are",
    metaTitle: "Lagos vs Abuja vs Port Harcourt — jobs, pay and cost of living",
    description:
      "The highest salary is not the most money left at the end of the month. A city-by-city comparison of openings, rent, transport and what you keep.",
    excerpt:
      "The highest salary is not the most money left over. Here is the arithmetic nobody does before relocating.",
    published: "2026-10-09",
    author: "GetAJob Career Desk",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "People compare offers by the number on the letter. The number that matters is what is left after rent, transport and the cost of living in that specific city — and those three vary more than most salaries do.",
      },
      { kind: "h2", text: "Lagos: the most openings and the most competition" },
      {
        kind: "p",
        text: "Lagos carries the largest share of advertised roles in almost every sector — banking, fintech, media, logistics, FMCG, hospitality. It also carries the highest competition per role and the highest cost of existing here.",
      },
      {
        kind: "ul",
        items: [
          "**Rent** — a decent one-bedroom in a serviced area runs far above the national average; the same money gets a two-bedroom in most other states.",
          "**Transport** — the single biggest variable. Two hours of commute each way is normal; the cost of it is not.",
          "**Upside** — job density. If you lose a role, another is usually within reach without moving.",
        ],
      },
      { kind: "h2", text: "Abuja: government, NGOs and donor money" },
      {
        kind: "p",
        text: "Abuja's market is shaped by the public sector, embassies, development agencies and the consultancies that serve them. Salaries in donor-funded programmes are often published, which makes them unusually easy to benchmark.",
      },
      {
        kind: "ul",
        items: [
          "**Roles** — programme and M&E officers, policy, procurement, admin and finance in NGOs and contractors.",
          "**Rent** — high in the central districts; the satellite towns are cheaper but add transport.",
          "**Upside** — published salary bands and strong benefits in the donor sector.",
        ],
      },
      { kind: "h2", text: "Port Harcourt: fewer roles, higher pay when they come" },
      {
        kind: "p",
        text: "Port Harcourt is oil, gas, marine and the contractors that serve them. There are far fewer openings than in Lagos, and the ones that exist often pay above the national band for the same title.",
      },
      {
        kind: "ul",
        items: [
          "**Roles** — engineering, HSE, logistics, marine, procurement, camp and facility management.",
          "**Cycle** — the market moves with projects, so hiring comes in waves rather than steadily.",
          "**Cost** — housing is cheaper than Lagos; security and private transport can offset that.",
        ],
      },
      { kind: "h2", text: "The arithmetic nobody does" },
      {
        kind: "p",
        text: "Compare a ₦400,000 offer in Lagos with a ₦300,000 offer in a smaller city, before tax for simplicity:",
      },
      {
        kind: "ul",
        items: [
          "**Lagos:** ₦400,000 minus ₦150,000 rent (a room or shared flat), ₦70,000 transport, ₦90,000 food and utilities — about **₦90,000 left**.",
          "**The ₦300,000 city:** minus ₦60,000 rent, ₦30,000 transport, ₦70,000 food and utilities — about **₦140,000 left**.",
        ],
      },
      {
        kind: "p",
        text: "The smaller salary leaves more money. The Lagos offer buys something else: proximity to the next job. That is a real benefit, but it is a choice you should make deliberately rather than by default.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Do the sum before you accept",
        text: "Ask the employer where the office is, then price transport for that exact route at the exact hours you would travel. Not the average — that route, at 6am.",
      },
      { kind: "h2", text: "Remote work changes the map" },
      {
        kind: "p",
        text: "If the role is fully remote, the city on your CV stops mattering and the arithmetic inverts: a Lagos salary with Akure rent is the best combination in the country. Roles for foreign clients pay in dollars and are usually advertised as remote — worth filtering for.",
      },
      { kind: "h2", text: "Three questions before you relocate" },
      {
        kind: "ol",
        items: [
          "What is left after rent and transport in the new city, not the old one?",
          "If this job ends in a year, how many other roles exist there for me?",
          "What does moving cost, and does the first month's salary cover it?",
        ],
      },
      { kind: "h2", text: "The quieter cities" },
      {
        kind: "p",
        text: "The three big markets get the attention, but the arithmetic often works better elsewhere — especially for roles that are not tied to a head office.",
      },
      {
        kind: "ul",
        items: [
          "**Ibadan** — an hour and a half from Lagos by road, a fraction of the rent, and a growing number of firms that moved back-office functions there.",
          "**Enugu and Onitsha** — manufacturing, distribution and a strong SME base; lower pay, much lower cost.",
          "**Kano** — trade, agriculture and logistics, with a large market that is rarely served by the big job boards.",
          "**Abeokuta and Sagamu** — factory and FMCG roles in the Ogun industrial corridor, commutable from Lagos if you choose carefully.",
        ],
      },
      {
        kind: "p",
        text: "The pattern is consistent: about 20–30% lower pay against a 50–70% lower cost of housing. For a first job, the city with more openings still usually wins, because the next job is the thing you are really buying. By your second or third role, the cheaper city often wins on quality of life.",
      },
      { kind: "h2", text: "What remote changes" },
      {
        kind: "p",
        text: "A fully remote role breaks the trade-off entirely. If the employer does not care where you live, you want the lowest cost of living with reliable power and internet — and the salary is set by the employer's market, not yours. Those roles are usually advertised as remote, so filter for them and read the location line carefully: “remote” sometimes means “remote until we say otherwise”.",
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Check the commute before the offer",
        text: "Ask for the office address and price the trip for that exact route at the exact hour you would travel. A ₦40,000 difference in salary disappears quickly when the commute costs ₦25,000 more a month.",
      },
      {
        kind: "cta",
        title: "See what is open where you want to be",
        text: "Every state, with the number of verified roles currently open in it.",
        label: "Browse by state",
        href: "/states",
      },
    ],
  },

  /* ───────────────────────────── Employers ───────────────────────────── */
  {
    slug: "hiring-law-nigeria",
    hub: "hiring",
    title: "Hiring in Nigeria: what the law lets you ask a candidate",
    metaTitle: "Hiring law in Nigeria — what you can ask, and what you owe staff",
    description:
      "The questions that create legal risk, how to ask the same thing lawfully, the statutory benefits a new hire is owed, and handling candidate data under the NDPA.",
    excerpt:
      "The questions that create risk, how to ask the same thing lawfully, and what a new hire is owed by law.",
    published: "2026-10-12",
    author: "GetAJob Hiring Desk",
    minutes: 8,
    blocks: [
      {
        kind: "p",
        text: "Most Nigerian hiring problems are not caused by bad intentions. They are caused by interview questions copied from a template written thirty years ago, and by contracts assembled from the internet.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "This is guidance, not legal advice",
        text: "Employment law depends on your sector, your size and your contracts. For anything that matters, have a Nigerian employment lawyer read your offer letter and staff handbook.",
      },
      { kind: "h2", text: "The rules that actually come up" },
      {
        kind: "ul",
        items: [
          "**The Constitution (section 42)** prohibits discrimination on grounds of ethnic group, sex, religion, political opinion or circumstances of birth.",
          "**The HIV/AIDS (Anti-Discrimination) Act 2014** — you cannot require an HIV test as a condition of employment, and cannot dismiss on status.",
          "**The Discrimination Against Persons with Disabilities (Prohibition) Act 2018** — no discrimination in employment, and reasonable accommodation is expected. Public organisations are directed to reserve at least 5% of employment for persons with disabilities.",
          "**The Labour Act** sets the floor: written terms within three months of starting, minimum notice, at least six working days of annual leave after twelve months, up to twelve working days of sick leave, and twelve weeks of maternity leave.",
          "**The Nigeria Data Protection Act 2023** governs candidate CVs and interview notes: lawful basis, minimum necessary data, defined retention, and the candidate's right to access or delete.",
        ],
      },
      { kind: "h2", text: "Questions to stop asking" },
      {
        kind: "ul",
        items: [
          "“Are you married?” or “When are you planning to have children?”",
          "“What is your religion?” or “Which church do you attend?”",
          "“What state are you from?” or “Which tribe?”",
          "“How old are you?” unless a legal restriction applies to the role.",
          "“Do you have any disabilities?” — ask about ability to do the job, with adjustments, instead.",
          "“Are you HIV positive?” — never, and never as a test.",
          "“Are you a member of a union?” or “Which party did you vote for?”",
        ],
      },
      { kind: "h2", text: "How to ask the same thing lawfully" },
      { kind: "h3", text: "Instead of “Are you married?”" },
      {
        kind: "p",
        text: "“This role covers weekend shifts on a rota. Are you able to work that pattern?” You are asking about the requirement, not the person's family.",
      },
      { kind: "h3", text: "Instead of “Do you have children?”" },
      {
        kind: "p",
        text: "“The role involves occasional travel, roughly twice a month. Is that workable for you?”",
      },
      { kind: "h3", text: "Instead of “Do you have a disability?”" },
      {
        kind: "p",
        text: "“The role involves [describe the physical or environmental demands]. Is there anything you would need from us to do it well?” That invites a request for accommodation instead of asking for a diagnosis.",
      },
      { kind: "h3", text: "Instead of “What state are you from?”" },
      {
        kind: "p",
        text: "“Do you speak any of the languages our customers use?” — if language is genuinely a job requirement, ask about the language.",
      },
      { kind: "h2", text: "What a new hire is owed" },
      {
        kind: "ul",
        items: [
          "**A written contract within three months** of starting — terms, notice period, pay and leave.",
          "**Minimum wage compliance** — the national minimum wage is ₦70,000 a month, set in 2024.",
          "**Notice on termination** — one day for under three months' service, one week for three months to two years, two weeks for two to five years, one month after five years.",
          "**Annual leave** — at least six working days after twelve months; most competitive employers give fifteen to twenty.",
          "**Sick leave** — up to twelve working days a year.",
          "**Maternity leave** — twelve weeks, with at least six weeks after the birth.",
          "**Pension** — 8% employee, 10% employer, for organisations with fifteen or more staff.",
          "**NHF** — 2.5% of basic salary, deducted and remitted.",
          "**ITF** — 1% of payroll for employers with five or more staff or ₦50m turnover.",
          "**NSITF / Employee Compensation** — 1% of payroll.",
          "**PAYE** — deducted and remitted to the state internal revenue service.",
        ],
      },
      { kind: "h2", text: "Candidate data under the NDPA" },
      {
        kind: "ol",
        items: [
          "**Collect what you need.** A CV, contact details and right-to-work evidence. Not a bank statement, not a BVN, not a next-of-kin form before an offer.",
          "**Say what you will do with it**, in the advert or the application acknowledgement.",
          "**Restrict access.** Candidate CVs should not sit in a shared inbox half the company can open.",
          "**Set a retention period** and delete unsuccessful applications on schedule — twelve months is a common, defensible choice.",
          "**Honour requests** to see or delete a candidate's data, and log that you did.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "The expensive mistake",
        text: "A rejected candidate who can prove a question about pregnancy or HIV status cost the hiring decision is an employment claim, and under the NDPA a data breach on top of it. Both are avoidable with a standard interview scorecard.",
      },
      {
        kind: "cta",
        title: "Post a role that is compliant from the start",
        text: "Our employer dashboard walks you through a listing with a disclosed salary, a clear location and no questions you should not be asking.",
        label: "Post a job",
        href: "/employers#post-job",
      },
    ],
  },
  {
    slug: "job-advert-that-works",
    hub: "adverts",
    title: "How to write a job advert that gets the right 20 applicants, not 400 wrong ones",
    metaTitle: "How to write a job advert in Nigeria that attracts the right people",
    description:
      "The six things every advert needs, why publishing the salary gets you fewer and better applications, and a template you can copy.",
    excerpt:
      "Why publishing the salary gets you fewer applications — and better ones. Includes a template.",
    published: "2026-10-16",
    author: "GetAJob Hiring Desk",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "A bad advert does not fail by getting no applications. It fails by getting four hundred, of which six are relevant, and costing somebody three days to find them.",
      },
      { kind: "h2", text: "Why most Nigerian adverts fail" },
      {
        kind: "ul",
        items: [
          "**No salary.** Serious candidates skip it; everyone else applies to find out.",
          "**No location**, or “Lagos” for an office in Ibeju-Lekki that is two hours from Ikeja.",
          "**A pile of fourteen requirements**, none distinguished as essential.",
          "**Words that mean nothing** — “must be hardworking, dedicated, dynamic and proactive”.",
          "**No clear way to apply**, or three different ones.",
        ],
      },
      { kind: "h2", text: "The six things every advert needs" },
      {
        kind: "ol",
        items: [
          "**The exact job title** — the one you would search for if you were hiring.",
          "**Location and work mode** — city, area, and whether it is on-site, hybrid or remote.",
          "**The salary range**, gross, per month.",
          "**Five to seven requirements**, split into must-have and nice-to-have.",
          "**What the job actually looks like** in a normal week.",
          "**One way to apply, and a closing date.**",
        ],
      },
      { kind: "h2", text: "Write the title like a search query" },
      {
        kind: "p",
        text: "Candidates search “customer service officer Lagos”, not “Urgent Vacancy!!!”. A title written the way people search is found by the people you want — on the job board and on Google.",
      },
      {
        kind: "template",
        title: "Titles",
        lines: [
          "Good:  Customer Service Officer (Ikeja, Lagos) — ₦180,000–₦250,000",
          "Good:  NYSC Corps Member — Marketing Assistant, Abuja",
          "Bad:   URGENT VACANCY!!! GRADUATE NEEDED ASAP",
        ],
      },
      { kind: "h2", text: "Publish the salary" },
      {
        kind: "p",
        text: "It feels risky and it is the single highest-leverage change you can make. Three things happen:",
      },
      {
        kind: "ol",
        items: [
          "**Volume falls.** People who were never going to accept the number stop applying.",
          "**Quality rises.** The ones who apply already know the number and want the job.",
          "**Negotiation starts from a known point**, instead of a hopeful guess on both sides.",
        ],
      },
      {
        kind: "p",
        text: "It is also the rule here: employers on GetAJob must disclose a genuine salary range, because a candidate cannot make a decision without one.",
      },
      { kind: "h2", text: "Separate must-haves from nice-to-haves" },
      {
        kind: "p",
        text: "A requirement list is a filter. If everything is essential, nothing is, and the filter passes everyone. Two or three genuine must-haves will do more than ten aspirational ones.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Test each requirement",
        text: "If you would happily hire someone without it, it is a nice-to-have. Move it.",
      },
      { kind: "h2", text: "A template you can copy" },
      {
        kind: "template",
        title: "Advert skeleton",
        lines: [
          "Customer Service Officer — Ikeja, Lagos (on-site)",
          "₦180,000 – ₦250,000 gross per month, full-time",
          "",
          "About the role",
          "You will be the first voice our customers hear: about 60 calls and",
          "WhatsApp conversations a day, resolving delivery and payment issues.",
          "",
          "Must have",
          "• 2+ years in customer support, ideally in retail or fintech",
          "• Clear written and spoken English",
          "• Comfortable with a Mon–Sat rota",
          "",
          "Nice to have",
          "• Experience with a helpdesk tool (Zendesk, Freshdesk, Intercom)",
          "• A second Nigerian language",
          "",
          "What you get",
          "• ₦180,000 – ₦250,000 depending on experience",
          "• HMO covering you and one dependant",
          "• Transport allowance",
          "",
          "How to apply",
          "Send your CV as a PDF to careers@company.com with the subject",
          "“Customer Service Officer — your name”. Closing date: 30 October 2026.",
        ],
      },
      { kind: "h2", text: "The application step" },
      {
        kind: "p",
        text: "One step. If applying means filling a form, emailing a CV and then sending a WhatsApp message, a third of your good candidates will stop halfway. Pick one, say it once, and confirm receipt to everyone who applies — even a two-line automatic reply.",
      },
      { kind: "h2", text: "The first 48 hours after you post" },
      {
        kind: "p",
        text: "Most of the good applications arrive in the first two days. What you do with them decides whether the advert worked.",
      },
      {
        kind: "ol",
        items: [
          "**Screen in one sitting, against a written scorecard**, not against each other. Three criteria, scored out of five.",
          "**Reply to everyone within 72 hours**, even a two-line rejection. It protects your reputation in a market where candidates talk to each other.",
          "**Book interviews while the role is fresh.** A two-week gap between applying and hearing anything loses the best candidates to whoever moved first.",
          "**Close the advert** once you have a shortlist. Leaving it open collects applications you will never read.",
        ],
      },
      { kind: "h2", text: "Write a rejection that does not burn the bridge" },
      {
        kind: "p",
        text: "Three sentences is enough, and it costs nothing: thank them, say the decision, and say what would make a future application stronger. Candidates remember the companies that treated them like people, and some of them will be your applicants again next year.",
      },
      {
        kind: "callout",
        tone: "warn",
        title: "The advert is a promise",
        text: "If you write “₦180,000–₦250,000”, do not open negotiations at ₦150,000. Candidates compare notes, and a bait-and-switch advert follows a company around for years.",
      },
      {
        kind: "cta",
        title: "Post it where the candidates already are",
        text: "Reach job seekers across all 36 states, with the salary shown on the card and applications in your dashboard.",
        label: "Post a job",
        href: "/employers#post-job",
      },
    ],
  },
];

/* ─────────────────────────────── helpers ─────────────────────────────── */

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

export function getHub(id: HubId): Hub {
  const hub = BLOG_HUBS.find((item) => item.id === id);
  if (!hub) throw new Error(`Unknown blog hub: ${id}`);
  return hub;
}

export function postsInHub(id: HubId): Post[] {
  return byNewest(POSTS.filter((post) => post.hub === id));
}

export function byNewest(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => (a.published < b.published ? 1 : -1));
}

export const ALL_POSTS = byNewest(POSTS);

/** The one post that gets the large card on the index. */
export const FEATURED = getPost("salary-guide-nigeria") ?? ALL_POSTS[0];

/** Posts that should appear on the homepage strip. */
export const HOMEPAGE_POSTS = ["salary-guide-nigeria", "cv-format-nigeria-ats", "fake-job-adverts-nigeria"]
  .map((slug) => getPost(slug))
  .filter((post): post is Post => Boolean(post));

/** Related reading: same hub, newest first, three at most. */
export function relatedPosts(post: Post): Post[] {
  return postsInHub(post.hub)
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);
}

export function nextPost(post: Post): Post | undefined {
  const ordered = ALL_POSTS;
  const index = ordered.findIndex((item) => item.slug === post.slug);
  return index >= 0 ? ordered[index + 1] : undefined;
}

export function previousPost(post: Post): Post | undefined {
  const ordered = ALL_POSTS;
  const index = ordered.findIndex((item) => item.slug === post.slug);
  return index > 0 ? ordered[index - 1] : undefined;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * "2026-10-04" -> "4 October 2026".
 *
 * Parsed by hand rather than with Date: no timezone can shift a publish date
 * by a day, and nothing here depends on when the page is rendered.
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const name = MONTHS[Number(month) - 1] ?? "";
  return `${Number(day)} ${name} ${year}`;
}
