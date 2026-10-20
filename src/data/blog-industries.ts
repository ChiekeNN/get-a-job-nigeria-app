import type { Block, Post } from "@/data/blog";

/**
 * Sector guides — one post per way Nigerians actually get hired.
 *
 * Type-only import from blog.ts, so there is no runtime cycle: blog.ts spreads
 * these into POSTS at module load.
 */

const guides: Array<{
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  excerpt: string;
  published: string;
  updated?: string;
  minutes: number;
  blocks: Block[];
}> = [
  {
    slug: "nursing-jobs-nigeria",
    title: "Nursing jobs in Nigeria: licensing, pay and how hospitals actually hire",
    metaTitle: "Nursing jobs in Nigeria — NMCN licence, pay bands and hiring",
    description:
      "What Nigerian hospitals check before an interview, what RN and RM actually pay in the private and public sectors, and the paperwork that decides your application.",
    excerpt:
      "The licence, the two certificates and the one question every matron asks. Plus what the pay really looks like.",
    published: "2026-10-19",
    minutes: 8,
    blocks: [
      {
        kind: "p",
        text: "Nursing is one of the few Nigerian professions where demand reliably exceeds supply — and where the paperwork, not the interview, is usually what decides the outcome. Hospitals cannot put an unlicensed nurse on a ward, so the licence check happens before anyone reads your experience.",
      },
      { kind: "h2", text: "The three things every employer checks" },
      {
        kind: "ol",
        items: [
          "**Current NMCN licence.** The Nursing and Midwifery Council of Nigeria licence is renewed annually. A lapsed licence is an automatic no, however strong the CV.",
          "**RN, and RM if you have it.** Registered Nurse is the baseline. Registered Midwife opens maternity and most private hospital roles — and it is usually paid more.",
          "**Your certificates, physically.** Most Nigerian hospitals will ask to see the originals at interview, not just photocopies.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Do not pay anyone to “process” your licence",
        text: "NMCN renewals are done through the council, not through an agent. Anyone charging a “processing fee” to renew or upgrade your licence is a scam, and a lapsed licence costs you months.",
      },
      { kind: "h2", text: "Private versus public: what the pay actually looks like" },
      {
        kind: "p",
        text: "Private hospitals in Lagos and Abuja typically advertise ₦120,000 to ₦250,000 a month for a staff nurse, with the top of that band in the bigger specialist hospitals. Public sector pay is set by the consolidated health salary structure and is usually lower on basic — but stronger on pension, job security and progression.",
      },
      {
        kind: "ul",
        items: [
          "**Private:** faster hiring, more shift pressure, sometimes no HMO, often paid on time.",
          "**Public:** slower recruitment through the state or federal health service, better pension, stronger union protection.",
          "**International recruitment agencies:** real, but only engage ones that can show you the destination hospital and the visa route in writing.",
        ],
      },
      { kind: "h2", text: "What the interview actually tests" },
      {
        kind: "p",
        text: "Nigerian nursing interviews are clinical, not conversational. Expect a matron or senior nurse to ask you to walk through a scenario: a patient with a sudden drop in blood pressure, a post-operative wound that looks wrong, a mother bleeding after delivery.",
      },
      {
        kind: "p",
        text: "Answer in order and out loud: what you see, what you check first, who you call, what you document. The structure matters as much as the clinical content, because it shows you will not freeze on a ward at 2am.",
      },
      {
        kind: "template",
        title: "The structure to use",
        lines: [
          "“First I would assess the patient — observations, conscious level, and",
          "the specific signs you mentioned.",
          "",
          "Then I would escalate to the nurse in charge and the doctor on call,",
          "following the hospital's escalation protocol.",
          "",
          "While waiting I would start the interventions within my scope —",
          "positioning, oxygen, IV access if trained and authorised.",
          "",
          "And I would document the time of each observation and each action.”",
        ],
      },
      { kind: "h2", text: "If you are newly qualified" },
      {
        kind: "p",
        text: "Apply to hospitals that run a structured internship or a preceptorship, even at lower pay. Eighteen months of supervised ward work is worth more than two years of unpaid applications, and it is what the next employer is really asking about when they say “experience”.",
      },
      {
        kind: "p",
        text: "Put your clinical rotations on the CV under a heading called **Clinical Experience** — the ward, the hospital, the months, and the procedures you performed unsupervised by the end. That reads as experience, because it is.",
      },
      { kind: "h2", text: "Your first ninety days on a ward" },
      {
        kind: "p",
        text: "Most Nigerian hospitals run twelve-hour shifts — 7am to 7pm, or the reverse — with a handover at the change. The first month is mostly about surviving that rhythm: learning where the drug cupboard keys are, who signs for controlled drugs, which consultant wants vitals before 8am. New nurses who struggle are rarely struggling with clinical knowledge. They are struggling with documentation, because a ward round that is not written down did not happen.",
      },
      {
        kind: "p",
        text: "Do the drug round with a second nurse even when the policy only requires it for controlled drugs. Count the stock at the start and end of every shift. Write your notes as you go, not at 6.45pm. These three habits will keep you out of the only kind of trouble that ends a nursing career early: a record that does not match what actually happened to the patient.",
      },
      {
        kind: "ul",
        items: [
          "**Ask about HMO cover in the interview**, not after you resume. It is the benefit nurses use most and the one hospitals quietly leave out.",
          "**Ask who pays for indemnity insurance**, uniform replacement and laundry. In some hospitals it is deducted from your salary.",
          "**Ask about the overtime rate and how it is approved.** Many private hospitals pay a flat shift rate with no overtime at all.",
          "**Ask whether accommodation is bonded.** Free staff quarters often come with a twelve-month commitment and a deduction if you leave early.",
        ],
      },
      {
        kind: "cta",
        title: "Nursing jobs hiring now",
        text: "Hospital, clinic and health-service vacancies are posted daily, including private hospitals that hire on a rolling basis.",
        label: "Browse healthcare jobs",
        href: "/jobs?category=Healthcare",
      },
    ],
  },
  {
    slug: "teaching-jobs-nigeria",
    title: "Teaching jobs in Nigeria: private school pay, TRCN and getting hired",
    metaTitle: "Teaching jobs in Nigeria — TRCN, private school pay, how to apply",
    description:
      "What private and public schools actually pay, why TRCN registration matters more every year, and the demo lesson that decides most teaching interviews.",
    excerpt:
      "Private school pay, the TRCN question, and the ten-minute demo lesson that decides most interviews.",
    published: "2026-10-18",
    minutes: 7,
    blocks: [
      {
        kind: "p",
        text: "Teaching in Nigeria is two different markets wearing the same title. A private school in Lekki and a state secondary school in Bauchi hire differently, pay differently and ask different questions. Applying to both with the same CV is why so many teachers hear nothing.",
      },
      { kind: "h2", text: "Private schools: the real numbers" },
      {
        kind: "p",
        text: "Private school salaries in Nigeria run roughly ₦80,000 to ₦180,000 a month, with the top of that band in established international and British-curriculum schools in Lagos, Abuja and Port Harcourt. A handful of elite schools pay well above it, and they hire on a different bar entirely.",
      },
      {
        kind: "ul",
        items: [
          "**Small private schools:** ₦70,000–₦120,000, often without pension or HMO.",
          "**Established private schools:** ₦120,000–₦200,000, usually with some benefits.",
          "**International schools:** ₦250,000 and up, requiring a teaching qualification and often a proven exam record.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Ask about class size and marking load",
        text: "A ₦150,000 role with 45 pupils per class and six periods a day is a different job from a ₦150,000 role with 20 pupils. Ask both numbers before you accept — they determine whether you last a year.",
      },
      { kind: "h2", text: "TRCN: why it keeps coming up" },
      {
        kind: "p",
        text: "The Teachers Registration Council of Nigeria is the professional regulator. Registration and a practising licence are increasingly required by serious private schools and are mandatory in the public system. If you intend to teach for more than a couple of years, get registered early — the process is straightforward but slow.",
      },
      { kind: "h2", text: "Public schools" },
      {
        kind: "p",
        text: "State teaching recruitment is episodic and usually announced by the State Universal Basic Education Board or the state teaching service commission. Places are competitive, the process is long, and there is no legitimate route that involves paying anyone.",
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Nobody sells a teaching appointment",
        text: "Any request for money to “secure” a public teaching post is fraud. Recruitment is advertised, applied for and examined. Report it rather than paying it.",
      },
      { kind: "h2", text: "The demo lesson decides most interviews" },
      {
        kind: "p",
        text: "Almost every private school will ask you to teach a short lesson — usually ten to fifteen minutes, often to a panel pretending to be pupils. What they are watching for is not subject mastery. It is whether you can hold a room.",
      },
      {
        kind: "ol",
        items: [
          "**Open with a question**, not with your name. Get the room talking in the first thirty seconds.",
          "**Write on the board** as you go. It shows you can manage the physical space.",
          "**Use one concrete example** a Nigerian child would recognise — a market, a bus fare, a football league table.",
          "**Check understanding** twice, by name: “Chidi, what did I just say?”",
          "**Close with a summary line** and one question they should be able to answer.",
        ],
      },
      {
        kind: "p",
        text: "Bring a one-page lesson plan even if nobody asks. Handing it over at the start signals that you plan your work, which is the single thing a school cares most about.",
      },
      { kind: "h2", text: "What to put on a teaching CV" },
      {
        kind: "ul",
        items: [
          "**Subjects and levels you can teach**, precisely — “Mathematics, JSS1–SS3” beats “Mathematics”.",
          "**Exam results** where you have them: “WAEC Maths pass rate 92%, up from 61%”.",
          "**Class sizes you have managed**, and any SEN experience.",
          "**TRCN number**, if registered.",
          "**Co-curricular roles** — debate, sports, choir. Schools hire for the whole timetable.",
        ],
      },
      { kind: "h2", text: "The paperwork behind the classroom" },
      {
        kind: "p",
        text: "Teaching in Nigeria is two jobs. The visible one is the lesson; the invisible one is the file. Most private schools expect a scheme of work for the term, lesson notes for every period, a record of work showing what you actually taught, and continuous assessment scores entered before the deadline. A head of department will check the notes weekly, and an inspector from the state ministry will check them without warning.",
      },
      {
        kind: "p",
        text: "The marking load is where new teachers are caught out. A class of forty with three subjects and a weekly test is 120 scripts a week, before homework and exam papers. Ask what the school's marking policy is — daily, weekly, fortnightly — and whether teachers are given free periods for it. A school that cannot answer that question has never thought about it.",
      },
      {
        kind: "ul",
        items: [
          "**Class size.** Forty is workable. Sixty with no assistant is a different job from the one advertised.",
          "**Subjects and periods.** Three subjects across six classes is a full load; six subjects is a warning sign.",
          "**Holiday pay.** Some private schools pay only during term time. Confirm the twelve-month figure, not the term figure.",
          "**TRCN support.** Good schools pay for or reimburse registration and licence renewal. Ask.",
        ],
      },
      {
        kind: "p",
        text: "None of this is a reason to avoid private schools. It is the information you need to compare two offers that both say “competitive salary”.",
      },
      {
        kind: "cta",
        title: "Find a school hiring near you",
        text: "Every education role on the board shows the school, the location and the salary where it was disclosed.",
        label: "Browse teaching jobs",
        href: "/jobs?category=Education%20%26%20Teaching",
      },
    ],
  },
  {
    slug: "banking-jobs-nigeria",
    title: "Banking jobs in Nigeria: the real entry route and what it pays",
    metaTitle: "Banking jobs in Nigeria — entry routes, pay and the sales target",
    description:
      "Graduate trainee schemes, the sales targets nobody mentions at interview, and what a bank job actually pays at entry and mid level in Nigeria.",
    excerpt:
      "The graduate trainee route, the target nobody mentions at interview, and what the salary really leaves you.",
    published: "2026-10-17",
    minutes: 7,
    blocks: [
      {
        kind: "p",
        text: "Banking remains one of the most applied-for sectors in Nigeria, and one of the least understood. Most applicants imagine a teller's counter. Most bank hiring is somewhere else entirely.",
      },
      { kind: "h2", text: "Where the entry points actually are" },
      {
        kind: "ul",
        items: [
          "**Graduate trainee programmes.** The cleanest route. Advertised in waves, usually once or twice a year, with an aptitude test, an assessment centre and a panel.",
          "**Direct sales and relationship roles.** Hired year-round, and the role most people actually enter through.",
          "**Operations and settlements.** Back-office processing, fewer openings, less pressure, lower ceiling early on.",
          "**Technology.** Banks now hire developers, data analysts and security engineers like tech companies do. This is the fastest-growing entry.",
          "**Customer service and contact centre.** Often the most accessible route into a bank for a graduate with no finance background.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "The teller is not the entry point",
        text: "Teller roles are usually filled internally from operations or customer service. Applying directly for “teller” rarely works; applying for customer service at the same bank often does.",
      },
      { kind: "h2", text: "The number nobody mentions at interview" },
      {
        kind: "p",
        text: "Most entry-level retail banking roles carry a deposit or sales target. It is not a secret — it is in the offer letter — but candidates often discover it in month two, when the basic salary turns out to be conditional in practice.",
      },
      {
        kind: "p",
        text: "Ask three questions before you accept:",
      },
      {
        kind: "ol",
        items: [
          "What is the monthly target, and what percentage of new staff meet it in their first six months?",
          "Is the basic salary paid in full regardless of target, or is part of it performance-linked?",
          "What happens in practice if I miss it for two months?",
        ],
      },
      {
        kind: "p",
        text: "A good manager answers all three plainly. Evasion is itself the answer.",
      },
      { kind: "h2", text: "What the pay looks like" },
      {
        kind: "ul",
        items: [
          "**Entry level (0–2 years):** ₦200,000–₦350,000 gross, plus allowances; higher at the tier-one banks.",
          "**Mid level (3–6 years):** ₦300,000–₦600,000, with performance pay on top in sales roles.",
          "**Senior:** ₦700,000 and upward, with the spread driven almost entirely by the bank and the desk.",
        ],
      },
      {
        kind: "p",
        text: "Bank roles usually come with strong benefits — HMO, pension, sometimes a staff loan at a preferential rate. Those are worth real money and are routinely left out of comparisons.",
      },
      { kind: "h2", text: "The aptitude test" },
      {
        kind: "p",
        text: "Most graduate schemes open with a timed test: numerical reasoning, verbal reasoning, and increasingly a situational judgement section. The numerical part is usually percentages, ratios and reading a chart under time pressure — practice it, because speed is what fails people, not difficulty.",
      },
      {
        kind: "template",
        title: "Practise this shape",
        lines: [
          "“A branch's deposit book grew from ₦420m to ₦483m in one quarter.",
          "What was the percentage growth?”   →  15%",
          "",
          "“If 40% of new accounts come from referrals and 180 accounts",
          "were opened, how many came from referrals?”   →  72",
        ],
      },
      { kind: "h2", text: "The CV that gets through screening" },
      {
        kind: "p",
        text: "Bank screeners are looking for three things: a degree (usually 2:1 or above, though not always stated), NYSC completion, and evidence you can talk to people. Lead with the degree and result, then any sales, customer-facing or cash-handling work — including your NYSC posting, which is often more relevant than candidates realise.",
      },
      { kind: "h2", text: "The first two years, honestly" },
      {
        kind: "p",
        text: "Almost every bank entry role now comes with a target attached, even the ones advertised as operations or customer service. The target might be deposit mobilisation, account openings, card activations or loan referrals. It will be reviewed monthly, and in most banks a missed target for two or three consecutive months triggers a performance conversation rather than a dismissal — but the pressure is real and it starts in month one.",
      },
      {
        kind: "p",
        text: "The other thing nobody mentions is the exam culture. Banks fund professional qualifications — the Chartered Institute of Bankers of Nigeria is the common one — and expect you to pass. Some bond you for the cost if you leave within a set period. Ask about the bond before you sign, not after.",
      },
      {
        kind: "ul",
        items: [
          "**Teller** is the most structured entry point: cash handling, reconciliation, strict controls, and the fastest route to understanding how the branch actually works.",
          "**Customer service officer** is broader — account issues, cards, complaints — and moves more easily into operations or product later.",
          "**Direct sales** pays the most variable and carries the highest target. It is the easiest to enter and the easiest to leave.",
          "**Operations and compliance** hire less often but have the clearest ladder. Compliance in particular is short of people who can read a circular and apply it.",
        ],
      },
      {
        kind: "cta",
        title: "Banking roles open this week",
        text: "Teller, customer service, operations and graduate-trainee vacancies, updated as the banks post them.",
        label: "Browse banking jobs",
        href: "/jobs?category=Banking%20%26%20Finance",
      },
    ],
  },
  {
    slug: "driver-jobs-nigeria",
    title: "Driver jobs in Nigeria: licence classes, checks and what they pay",
    metaTitle: "Driver jobs in Nigeria — licence class, guarantor, pay bands",
    description:
      "What employers check before hiring a driver, the difference between executive and commercial driving, and realistic monthly pay in Lagos and Abuja.",
    excerpt:
      "The licence class, the guarantor, and why an executive driver and a bus driver are different jobs.",
    published: "2026-10-15",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "Driving is one of the few roles in Nigeria with more vacancies than qualified applicants — because the checks are strict and most candidates arrive without the paperwork.",
      },
      { kind: "h2", text: "The paperwork that decides it" },
      {
        kind: "ol",
        items: [
          "**A valid driver's licence, of the right class.** Class B for private cars, class C or D for heavier vehicles. A licence that does not cover the vehicle is the most common reason a good driver is turned down.",
          "**A LASDRI card in Lagos.** The Lagos State Drivers' Institute card is required for professional driving in the state and is checked by employers and by the police.",
          "**A guarantor.** Almost every corporate or household driver role asks for one — usually a civil servant, a property owner or a long-standing employer who will sign for you.",
          "**A clean record.** Employers increasingly ask for a police character certificate or check your previous employers by phone.",
          "**References from previous employers**, with names and numbers. This is the single strongest thing on a driver's CV.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Carry your documents",
        text: "Keep licence, LASDRI card, and any vehicle papers in a folder you bring to every interview. A driver who produces them on request is hired on the spot more often than one who promises to send them later.",
      },
      { kind: "h2", text: "Executive, household and commercial are different jobs" },
      {
        kind: "ul",
        items: [
          "**Executive / corporate driver:** driving a company car for a manager. Long, unpredictable hours, decent pay, and a premium on discretion, punctuality and appearance.",
          "**Household driver:** one family. Often live-in, lower cash but sometimes accommodation and feeding. The guarantor requirement is strictest here.",
          "**Commercial:** bus, keke, taxi or ride-hailing. No employer, no guarantor, but the vehicle and fuel usually come out of your earnings.",
          "**Logistics / truck:** the best-paid driving in Nigeria, and the hardest to enter — heavy vehicle experience and long-distance routes.",
        ],
      },
      { kind: "h2", text: "What the pay looks like" },
      {
        kind: "ul",
        items: [
          "**Household driver:** ₦80,000–₦150,000 a month, sometimes with accommodation and feeding.",
          "**Corporate / executive driver:** ₦120,000–₦250,000, plus overtime in many firms.",
          "**Truck and logistics:** ₦200,000–₦400,000 for experienced long-distance drivers, with trip allowances.",
          "**Ride-hailing:** highly variable. After fuel, data and vehicle costs, many drivers net less than a salaried role.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Never hand over your documents",
        text: "Some fraudulent “employers” ask a driver to leave original documents as security before a “trial”. Do not. Originals stay with you; copies are what an employer needs.",
      },
      { kind: "h2", text: "The CV" },
      {
        kind: "p",
        text: "Drivers often have no CV at all, which is a mistake — the employer is hiring judgement and reliability, and a CV is where you show both. One page is plenty:",
      },
      {
        kind: "ul",
        items: [
          "**Licence class and number**, and LASDRI where applicable.",
          "**Years driving**, and the vehicle types you have driven — saloon, SUV, bus, truck.",
          "**Routes you know**, especially if the role involves inter-state travel.",
          "**Previous employers** with dates, and a line on what you did beyond driving — deliveries, errands, vehicle maintenance.",
          "**Two referees**, including at least one previous employer.",
        ],
      },
      { kind: "h2", text: "The road test and the background check" },
      {
        kind: "p",
        text: "For a driving role, the road test is the interview. In Lagos it usually means a route the interviewer knows well — a stretch of the Third Mainland Bridge or a busy junction at rush hour — plus a reverse park and a three-point turn in a space that is smaller than you would like. Examiners are watching for smooth braking, mirror use and how you behave when another driver cuts in. Losing your temper ends more driving interviews than a stalled engine.",
      },
      {
        kind: "p",
        text: "The background check is the other half. Serious employers ask for a guarantor, a police character certificate, and references from your last two jobs. Commercial and corporate drivers may also need a LASDRI card if the role is in Lagos, and a valid driver's licence in the correct class for the vehicle — a class for a saloon car does not cover a bus.",
      },
      {
        kind: "ul",
        items: [
          "**Bring originals:** licence, LASDRI card where applicable, police report, guarantor form, passport photographs.",
          "**Ask what happens after an accident.** A good employer has insurance and a written procedure. A bad one deducts the repair from your salary.",
          "**Ask who pays for fuel and maintenance**, and whether there is a daily fuel limit.",
          "**Ask about hours and sleep.** Two drivers sharing one vehicle is normal; one driver on call for twenty hours is not.",
        ],
      },
      {
        kind: "cta",
        title: "Driving roles on the board",
        text: "Filter logistics and transport roles by your state to see what is being advertised near you.",
        label: "Browse logistics jobs",
        href: "/jobs?category=Logistics%20%26%20Transport",
      },
    ],
  },
  {
    slug: "oil-gas-jobs-nigeria",
    title: "Oil and gas jobs in Nigeria: how to get in, and what HSE actually requires",
    metaTitle: "Oil and gas jobs in Nigeria — HSE, engineering and how to break in",
    description:
      "Why oil and gas hiring works through contracts, which certifications are actually required, and what a realistic first role looks like in Port Harcourt.",
    excerpt:
      "It hires in waves and through contractors. Here is the realistic route in, and the certificates that are actually required.",
    published: "2026-10-13",
    minutes: 8,
    blocks: [
      {
        kind: "p",
        text: "Oil and gas is the best-paid sector in Nigeria and the hardest to enter, for a structural reason: very little hiring happens directly. Operators hire contractors, contractors hire subcontractors, and the route in is usually through one of those layers.",
      },
      { kind: "h2", text: "Understand the chain before you apply" },
      {
        kind: "ol",
        items: [
          "**Operators** — the major producers. They hire few people directly, mostly experienced engineers.",
          "**Service companies** — the companies that actually do the work: drilling, inspection, fabrication, logistics, catering, maintenance. This is where most jobs are.",
          "**Subcontractors** — smaller firms supplying labour to the service companies. The most common entry point, and the least secure.",
          "**NCDMB compliance** — the Nigerian Content Development and Monitoring Board requires operators to use Nigerian companies and labour. Understanding this helps you target companies that must hire locally.",
        ],
      },
      { kind: "h2", text: "HSE: the realistic route" },
      {
        kind: "p",
        text: "Health, Safety and Environment is the most popular entry into oil and gas, and the most oversupplied. The certifications that genuinely appear in adverts are:",
      },
      {
        kind: "ul",
        items: [
          "**NEBOSH** (International General Certificate) — the one most consistently named.",
          "**IOSH Managing Safely** — shorter and cheaper, a reasonable substitute for junior roles.",
          "**First aid and fire safety** certificates from a recognised provider.",
          "**HSE level 1–3** from Nigerian providers — common in adverts, worth getting if a specific employer asks.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Certificates are not experience",
        text: "A shelf of certificates and no site experience is the most common oil and gas CV in Nigeria. What separates the ones that get called is one line about a real site, a real hazard, a real audit — even on a construction site, a factory, or a NYSC placement.",
      },
      { kind: "h2", text: "Engineering and technical roles" },
      {
        kind: "p",
        text: "Mechanical, electrical, instrumentation, process and civil engineers are hired on project cycles. Specific things that matter in Nigerian adverts:",
      },
      {
        kind: "ul",
        items: [
          "**Software fluency** — AutoCAD, MATLAB, Primavera, SAP. Named tools get interviews.",
          "**Registration** — COREN for engineers, and membership of NSE or SPE.",
          "**Project scale** — “managed a ₦400m pipeline inspection” beats “worked on pipeline projects”.",
          "**Permit-to-work and isolation experience**, if you have it. These are operational realities employers test for.",
        ],
      },
      { kind: "h2", text: "Where the jobs are advertised" },
      {
        kind: "p",
        text: "Port Harcourt and Bonny for upstream and marine; Warri and Escravos for the western delta; Lagos for head offices and offshore logistics; Abuja for policy, regulation and headquarters functions. Roles are often advertised for a short window and filled quickly, so being early matters more here than in any other sector.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Contract work is normal",
        text: "A large share of oil and gas jobs are fixed-term or project-based. Take the contract, deliver it well, and you become the person they call for the next one. That is the actual career path in this sector.",
      },
      { kind: "h2", text: "If you are a graduate with no route in" },
      {
        kind: "p",
        text: "Target the service companies and the contractors around them, not the operators. Take a junior or technician role that puts you on a site. Get one recognised certificate. After two years on a site, you are a different candidate entirely — and the operators start calling.",
      },
      { kind: "h2", text: "Staff, contract and the difference it makes" },
      {
        kind: "p",
        text: "There are two kinds of employment in Nigerian oil and gas, and they are not close. Staff roles sit with the operator or a major contractor: salary, pension, HMO, leave, a career path. Contract roles sit with a service company for a defined project — often rotational, often renewed, sometimes ending abruptly when the project does. Both are legitimate. Only one behaves like a job you can plan a life around.",
      },
      {
        kind: "p",
        text: "Rotation is the part people underestimate. A 28-on, 28-off schedule looks generous until you count the travel days, the offshore medical, and the fact that you are unavailable to any other employer for half the year. Ask what the rotation actually is, where you sleep, what the camp food and medical cover look like, and what happens to your pay if the weather stops helicopter flights for three days.",
      },
      {
        kind: "ul",
        items: [
          "**Ask about mobilisation and demobilisation pay.** Some contractors pay only for days on site; others pay a monthly rate regardless.",
          "**Check the medical and survival certificates.** BOSIET or HUET and a valid offshore medical are usually required before you can board.",
          "**Ask who holds the contract** — the operator, the main contractor, or a sub-contractor hired by that contractor. Payment reliability follows that chain.",
          "**Do not pay for a “placement”.** Recruitment into oil and gas is by application, not by agent fee.",
        ],
      },
      {
        kind: "cta",
        title: "Oil and gas roles, as they come up",
        text: "We list openings across Rivers, Delta, Lagos and Abuja, with the salary where the employer disclosed it.",
        label: "Browse energy jobs",
        href: "/jobs?category=Oil%2C%20Gas%20%26%20Energy",
      },
    ],
  },
  {
    slug: "tech-jobs-without-degree",
    title: "Tech jobs in Nigeria without a computer science degree",
    metaTitle: "Tech jobs in Nigeria without a CS degree — the realistic route in",
    description:
      "Which tech roles actually hire on portfolio rather than certificate, how to build one in three months, and what entry-level pay looks like in Nigeria.",
    excerpt:
      "Portfolio beats certificate — but only if the portfolio looks like work. The roles that hire on proof, and how to build it.",
    published: "2026-10-10",
    minutes: 7,
    blocks: [
      {
        kind: "p",
        text: "Nigerian tech hiring has relaxed its degree requirement far more than most other sectors — and tightened its portfolio requirement to match. Employers stopped asking where you studied and started asking what you have shipped.",
      },
      { kind: "h2", text: "The roles that hire on proof" },
      {
        kind: "ul",
        items: [
          "**Front-end development** — the most accessible. React and TypeScript, three real projects, and a deployed URL.",
          "**Quality assurance / testing** — the least crowded entry, and the easiest to demonstrate. Manual testing first, then Playwright or Cypress.",
          "**Data analysis** — Excel, SQL and one of Power BI or Tableau. Nigerian businesses are full of data and short of people who can read it.",
          "**Technical support and implementation** — customer-facing, technical enough, and a genuine route into product teams.",
          "**Product design** — a portfolio of three case studies matters more than any certificate.",
          "**Cloud and DevOps** — steeper entry, but AWS or Azure fundamentals plus one real deployment is a credible start.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Backend is not the beginner's entry",
        text: "Backend roles attract the most applicants and demand the most judgement. Front-end, QA and data analysis are far more realistic first jobs — and all three lead to backend later if you want it.",
      },
      { kind: "h2", text: "Build a portfolio that looks like work" },
      {
        kind: "p",
        text: "Three clones of Netflix prove you can follow a tutorial. Employers are looking for something else: a problem, a decision and a result.",
      },
      {
        kind: "ol",
        items: [
          "**Solve a real problem for a real person.** A church's attendance register, a small shop's stock tracker, a school's result checker. Real constraints produce real decisions.",
          "**Deploy it.** A GitHub repository is not a portfolio. A working URL is.",
          "**Write down two decisions** per project: why this approach, what you rejected, what broke.",
          "**Keep it to three projects.** Three finished things beat nine abandoned ones.",
        ],
      },
      { kind: "h2", text: "The CV when you have no job title yet" },
      {
        kind: "template",
        title: "Structure that works",
        lines: [
          "Chioma Eze — Front-end Developer",
          "Lagos · chioma@email.com · github.com/chioma · chioma.dev",
          "",
          "PROJECTS",
          "School Results Portal — React, TypeScript, Supabase",
          "• Built a result-checking portal used by 240 students at a private",
          "  school in Enugu; replaced a manual process that took two days.",
          "• Cut page load from 4.2s to 0.9s by moving filtering server-side.",
          "",
          "SKILLS",
          "React, TypeScript, Tailwind, Git, Supabase, Figma",
          "",
          "EXPERIENCE",
          "NYSC — IT Assistant, [School], 2025–2026",
        ],
      },
      {
        kind: "p",
        text: "Projects above experience, because that is your strongest evidence. Nobody is offended by it — they are reading for proof.",
      },
      { kind: "h2", text: "What entry-level pays" },
      {
        kind: "ul",
        items: [
          "**Local product companies:** ₦200,000–₦400,000 for a first role.",
          "**Banks and telcos:** ₦300,000–₦500,000, with strong benefits.",
          "**Remote for a foreign client:** the reason people target this sector. Rates are set in dollars or pounds and can be several times local pay — but you are competing globally.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Do not buy a bootcamp on credit",
        text: "There are free and cheap routes that work: the official documentation, freeCodeCamp, CS50, and building in public. A ₦400,000 bootcamp is not the price of entry, and paying for it on a loan before you have a job is the most common way people lose money trying to enter tech.",
      },
      { kind: "h2", text: "How to get the first paid work" },
      {
        kind: "p",
        text: "The first paid work is almost never a job advert. It is a small, slightly awkward project for someone who already knows you: a website for a church, a stock spreadsheet for a family business, a landing page for a friend's catering company. Charge something, even if it is small. The moment money changes hands, the work stops being a hobby and starts being a reference you can put on a CV with a number attached.",
      },
      {
        kind: "p",
        text: "From there the ladder is: two or three small paid projects, one internship or junior role, then the market opens. Referrals beat applications at every rung. Nigerian tech hiring runs heavily through WhatsApp groups, Slack communities and former colleagues, and a recommendation from someone inside is worth more than a hundred applications through a portal.",
      },
      {
        kind: "ul",
        items: [
          "**Price the first project low but not free.** Free work attracts clients who do not value it and do not pay on time.",
          "**Ask for a deposit.** Half up front is normal in Nigeria and protects you from the client who disappears.",
          "**Keep a public record.** A LinkedIn post or a short case study per project builds the reputation that referrals depend on.",
          "**Apply anyway.** Internal referrals and advertised junior roles are not mutually exclusive — use both.",
        ],
      },
      {
        kind: "cta",
        title: "Tech roles on the board",
        text: "Filter by Technology & IT and by remote to see what is open right now.",
        label: "Browse tech jobs",
        href: "/jobs?category=Technology%20%26%20IT",
      },
    ],
  },
  {
    slug: "customer-service-jobs-nigeria",
    title: "Customer service jobs in Nigeria: the easiest way into a formal job",
    metaTitle: "Customer service jobs in Nigeria — pay, tests and how to get hired",
    description:
      "Why call centre and support roles are the most accessible formal-sector entry in Nigeria, what the tests check, and what the pay looks like.",
    excerpt:
      "The most accessible formal-sector entry in the country — and what the aptitude test is really measuring.",
    published: "2026-10-07",
    minutes: 6,
    blocks: [
      {
        kind: "p",
        text: "If you are a graduate with no experience and no connections, customer service is the most reliable door into a formal job in Nigeria. It hires continuously, it trains, and it promotes from within.",
      },
      { kind: "h2", text: "Where the jobs are" },
      {
        kind: "ul",
        items: [
          "**Banks** — contact centres in Lagos and Abuja, and branch customer service.",
          "**Telecoms** — the largest call centre employers in the country.",
          "**Fintech** — support over chat and WhatsApp, faster-paced and better paid than legacy telecoms.",
          "**BPO firms** — outsourced support for foreign clients, often shift-based.",
          "**E-commerce and logistics** — order support, delivery disputes, returns.",
          "**Hospitals, schools and hotels** — front desk roles that are customer service under another name.",
        ],
      },
      { kind: "h2", text: "What the assessment actually measures" },
      {
        kind: "p",
        text: "Most employers screen with a short test before an interview. It is rarely about product knowledge — you will be trained on that. It measures three things.",
      },
      {
        kind: "ol",
        items: [
          "**Written English.** Grammar, spelling and whether you can write a clear sentence under time pressure. This is where most candidates lose the job.",
          "**Judgement.** Situational questions: an angry customer, a policy you cannot break, a colleague who is wrong. They are checking whether you escalate or improvise.",
          "**Data checking.** Comparing two records and spotting the difference, quickly and accurately.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Speak, do not recite",
        text: "The interview usually includes a role-play: the interviewer is an angry customer. Do not recite a script. Acknowledge the problem, say what you can do, and give a time. “I can see why that is frustrating — let me check this now and call you back within the hour” beats any scripted apology.",
      },
      { kind: "h2", text: "What it pays" },
      {
        kind: "ul",
        items: [
          "**Entry level:** ₦100,000–₦200,000, with fintech and telecoms at the top.",
          "**Shift allowances** are common and can add meaningfully to the basic.",
          "**Team lead** after two to three years: ₦250,000–₦400,000.",
        ],
      },
      {
        kind: "p",
        text: "The real value of the role is not the salary. It is the reference, the systems experience and the internal move — support staff move into operations, product, compliance and sales far more often than external candidates get those roles.",
      },
      { kind: "h2", text: "The CV" },
      {
        kind: "ul",
        items: [
          "**Any customer-facing work counts** — a shop, a cybercafé, tutoring, church administration, your NYSC posting.",
          "**Quantify it:** conversations per day, resolution rate, queue size.",
          "**Name the tools** you have used: Zendesk, Freshdesk, Intercom, CRM, Excel.",
          "**Languages**, including Nigerian languages you speak fluently. It is a genuine advantage on a Nigerian support desk.",
        ],
      },
      { kind: "h2", text: "The shift, the target and the script" },
      {
        kind: "p",
        text: "Customer service in Nigeria increasingly means a contact centre, and a contact centre is measured. Average handling time, first response time, resolution rate and a customer satisfaction score are reviewed weekly. Calls are recorded, chats are logged, and a quality analyst samples them. The script exists because the company has decided what compliance sounds like — use it as a structure, not a cage.",
      },
      {
        kind: "p",
        text: "Shifts rotate, including nights and weekends, and most centres run a six-day week during peak periods. Ask about the shift pattern in the interview, and ask specifically how the rota is published: a week ahead is workable, a day ahead is not.",
      },
      { kind: "h2", text: "How to move up from the desk" },
      {
        kind: "p",
        text: "The people who leave the desk fastest are the ones who document. Keep a note of recurring complaints, the root cause and what would fix it, and send it to your team lead once a month. That single habit gets support staff noticed for operations, product and compliance roles, because those teams are usually guessing at what customers actually say.",
      },
      {
        kind: "ul",
        items: [
          "**Learn the tool stack properly.** Zendesk or Freshdesk administration, reporting and macros are skills, not chores.",
          "**Volunteer for escalation calls.** They are uncomfortable and they are where the visible work is.",
          "**Apply internally first.** Most team-lead roles are filled from the floor before they are advertised.",
          "**Keep your QA scores above target** — they are the first number anyone checks before an internal move.",
        ],
      },
      {
        kind: "p",
        text: "In the first ninety days, aim to be the person whose cases are closed, not escalated. Escalation is sometimes the right answer — a fraud report, a regulatory complaint, anything touching a customer's money — but it should be a decision you can explain, not a habit. Ask your team lead which categories they expect you to resolve alone, write the list down, and check your own numbers against it at the end of every month. It is a small discipline that separates people who get promoted from people who get moved.",
      },
      {
        kind: "cta",
        title: "Support roles, open now",
        text: "See every customer service opening on the board, with the salary shown where it was disclosed.",
        label: "Browse customer service jobs",
        href: "/jobs?category=Customer%20Service",
      },
    ],
  },
  {
    slug: "government-jobs-nigeria",
    title: "Government jobs in Nigeria: how recruitment actually works",
    metaTitle: "Government jobs in Nigeria — how federal and state recruitment works",
    description:
      "The real channels for federal and state civil service recruitment, the scams that target applicants every cycle, and what the pay and pension look like.",
    excerpt:
      "Where vacancies are actually published, the scams that follow every cycle, and what the pay and pension really look like.",
    published: "2026-10-02",
    minutes: 7,
    blocks: [
      {
        kind: "p",
        text: "Government work is the most applied-for and least understood category in Nigeria. Every recruitment cycle produces a flood of fake portals, and every cycle thousands of people pay to enter a process that was free.",
      },
      { kind: "h2", text: "Where vacancies are actually published" },
      {
        kind: "ol",
        items: [
          "**Federal Civil Service Commission** — the official channel for federal ministries, departments and agencies.",
          "**State civil service commissions** — each state runs its own recruitment, announced on the state government website and in state media.",
          "**Federal Character Commission** — oversees the distribution of federal appointments across states and LGAs, which is why federal recruitment is advertised nationally.",
          "**Individual agencies** — FIRS, NIMASA, NIS, Customs, NAFDAC, CBN and others advertise on their own sites and in national newspapers.",
          "**Teaching and health service boards** — SUBEB and state hospital boards recruit separately from the general civil service.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "There is no fee",
        text: "Federal and state recruitment does not charge for forms, processing, “documentation” or “placement”. Any portal, agent or WhatsApp group asking for money to get you into the civil service is a scam. Report it rather than paying it.",
      },
      { kind: "h2", text: "The scams that follow every cycle" },
      {
        kind: "ul",
        items: [
          "**Fake portals** with a government logo and a payment page. Check that the domain belongs to the agency, not a lookalike.",
          "**“Slots” for sale.** Anyone selling a position is defrauding you; there is no inventory of posts to sell.",
          "**Fake shortlist SMS** asking you to pay to “confirm” your place, with a deadline.",
          "**Recruitment groups** that charge a joining fee, then vanish after the exam date.",
          "**Requests for your BVN** at application stage. Not needed to apply, ever.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "Check the domain, not the logo",
        text: "A scam site will copy the logo and the language perfectly. What it cannot fake is the domain name. Read the URL before you type anything into the form.",
      },
      { kind: "h2", text: "What the process looks like" },
      {
        kind: "ol",
        items: [
          "**Advertisement** in national media and on the official commission site.",
          "**Online application**, usually with a form and document uploads within a fixed window.",
          "**Screening**, then a written or computer-based test.",
          "**Interview**, often at a state or zonal office.",
          "**Verification** of certificates — originals, sometimes with the issuing institution contacted.",
          "**Placement**, then a posting to a specific ministry or agency, which you usually cannot choose.",
        ],
      },
      { kind: "h2", text: "Pay and pension" },
      {
        kind: "p",
        text: "Federal pay is set by consolidated salary structures, tied to grade level. The cash is rarely competitive with the private sector for the same skill, but three things are: job security, a defined pension that is actually funded, and a salary that is indexed to the national structure rather than to a single employer's fortunes.",
      },
      {
        kind: "p",
        text: "State pay varies enormously. A state with strong internally generated revenue pays differently from one that depends on federal allocations, and payment delays are a real risk in the latter. Ask people who work in that state's service what the last twelve months of payment looked like.",
      },
      { kind: "h2", text: "The CV and the test" },
      {
        kind: "ul",
        items: [
          "**Follow the form exactly.** Government screening is often a checklist, not a judgement. A missing document or a wrong date of birth at the top of the form fails you before anyone reads your experience.",
          "**Prepare for aptitude.** Verbal and numerical reasoning, current affairs, and sometimes a subject test for professional cadres.",
          "**Keep every certificate** scanned and ready: WAEC, degree, NYSC discharge, birth certificate or age declaration, LGA of origin certificate.",
          "**Mind the age limits.** Many federal roles set a maximum entry age. Check yours before you invest in the application.",
        ],
      },
      { kind: "h2", text: "After you submit: what the wait looks like" },
      {
        kind: "p",
        text: "Government recruitment is slow by design. A federal cycle can take six to nine months from advert to resumption, and long silences are normal rather than a sign that you have been rejected. Check the official portal for your application status rather than relying on messages, keep every acknowledgement slip and reference number, and apply for other roles while you wait. Exclusivity is not a requirement — nobody will hold it against you that you were also applying elsewhere.",
      },
      {
        kind: "p",
        text: "When shortlisting does happen, it is usually a spreadsheet exercise first: age, qualification, course of study, LGA of origin, NYSC status. That is why a missing document fails you before a human reads the form. Build one folder with every certificate scanned at a readable resolution, and keep the originals in a single envelope you can produce at short notice.",
      },
      {
        kind: "ul",
        items: [
          "**Scanned and named:** WAEC or NECO result, degree certificate, NYSC discharge, birth certificate or age declaration, LGA certificate, passport photograph.",
          "**One page of personal details** — dates, institutions, grades, referees — so every form is filled from the same source.",
          "**A work email address you check weekly**, not a social handle.",
          "**A note of every application** you submitted, with the date and reference number.",
        ],
      },
      {
        kind: "cta",
        title: "Other ways into public-sector work",
        text: "Teaching, health and local government roles are advertised on the board alongside private-sector jobs.",
        label: "Browse public sector roles",
        href: "/jobs?category=Government%20%26%20NGO",
      },
    ],
  },
];

export const INDUSTRY_POSTS: Post[] = guides.map((guide) => ({
  ...guide,
  hub: "industries",
  author: "GetAJob Career Desk",
}));
