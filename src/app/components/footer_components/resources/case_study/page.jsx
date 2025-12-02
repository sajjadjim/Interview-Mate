import {
  Users,
  Briefcase,
  Target,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Case Studies | InterviewMate",
  description:
    "Realistic case studies showing how candidates, HRs and companies use InterviewMate to improve their interview journey.",
};

const caseStudies = [
  {
    id: 1,
    role: "Candidate",
    name: "Ayesha – Junior Software Engineer",
    sector: "IT Sector",
    headline: "From 5 rejections to 2 offers in 6 weeks",
    summary:
      "Ayesha used InterviewMate mock interviews and feedback to fix her weak DSA explanations and project storytelling, leading to two offers from tech startups.",
    before: [
      "Struggled to explain projects clearly during technical rounds.",
      "Panicked when interviewers asked follow-up questions.",
      "No clear preparation roadmap, using random YouTube videos.",
    ],
    after: [
      "Completed 6 structured mock interviews with timed feedback.",
      "Improved STAR method (Situation, Task, Action, Result) for HR rounds.",
      "Received 2 offers for Junior Software Engineer roles.",
    ],
    metrics: [
      { label: "Mock interviews completed", value: "6" },
      { label: "Interview confidence", value: "+70%" },
      { label: "Offers received", value: "2" },
    ],
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: 2,
    role: "HR",
    name: "Rahim – HR Executive",
    sector: "Commercial Bank",
    headline: "Screening time reduced by 40% with structured slots",
    summary:
      "Rahim used InterviewMate’s applicant details and time slot system to manage candidate interviews without messy spreadsheets.",
    before: [
      "Tracked candidates manually in Excel sheets.",
      "Confusing follow-ups and double-booking of slots.",
      "No single view of candidate payment / approval status.",
    ],
    after: [
      "Used Applicants_Details page to see all candidate info in one place.",
      "Filtered by payment and approval status to prioritize committed candidates.",
      "Reduced scheduling conflicts and follow-up confusion.",
    ],
    metrics: [
      { label: "Screening time per candidate", value: "-40%" },
      { label: "Scheduling conflicts", value: "-80%" },
      { label: "Team satisfaction", value: "+50%" },
    ],
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 3,
    role: "Company",
    name: "TechNest Ltd.",
    sector: "Software & Services",
    headline: "Built a repeatable hiring pipeline for freshers",
    summary:
      "TechNest connected their HR and company profile, ran mock interviews, and built a predictable fresher hiring pipeline using InterviewMate.",
    before: [
      "No standard interview process for freshers.",
      "Different HRs asked different questions with no structure.",
      "Difficult to track which candidates performed well in mocks.",
    ],
    after: [
      "Defined standard time slots and topics for IT & non-IT roles.",
      "Used Interview_Candidate data to shortlist consistent performers.",
      "Reduced mismatch between candidate skills and job expectations.",
    ],
    metrics: [
      { label: "Hiring cycle time", value: "-30%" },
      { label: "Offer acceptance", value: "+20%" },
      { label: "Fresher retention (6 months)", value: "+15%" },
    ],
    color: "from-amber-500 to-orange-500",
  },
];

const processSteps = [
  {
    icon: Users,
    title: "1. Understand the user",
    text: "Each case starts with a clear profile: Candidate, HR or Company — plus their goals and pain points.",
  },
  {
    icon: Target,
    title: "2. Map the journey",
    text: "We follow their journey through signup, profile setup, applications, and interviews on InterviewMate.",
  },
  {
    icon: TrendingUp,
    title: "3. Measure improvement",
    text: "We look at concrete changes: time saved, offers received, confidence gained, or hiring quality.",
  },
];

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 md:pt-12">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1.1fr] items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">
              Case Studies • InterviewMate
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              How real people use{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                InterviewMate
              </span>{" "}
              to grow their careers
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl">
              These short case studies show how candidates, HR professionals and
              companies turned a messy interview process into a more confident,
              structured and trackable system using InterviewMate.
            </p>
          </div>

          {/* Process overview card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Star size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Our case study approach
                </p>
                <p className="text-[11px] text-slate-500">
                  We don&apos;t just tell stories — we focus on measurable changes.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {processSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600">
                      <Icon size={14} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{step.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Note: Names and details are slightly adjusted to keep privacy while
              keeping the real patterns and results.
            </p>
          </div>
        </div>
      </section>

      {/* Case study cards */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            Featured case studies
          </h2>
          <p className="text-[11px] text-slate-500">
            Showing {caseStudies.length} examples · IT, HR & Company views
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((cs) => (
            <article
              key={cs.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden"
            >
              {/* Role header */}
              <div
                className={`px-4 py-3 bg-gradient-to-r ${cs.color} text-white flex items-center justify-between gap-2`}
              >
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wide font-semibold opacity-90">
                    {cs.role} case
                  </span>
                  <span className="text-sm font-semibold">{cs.name}</span>
                </div>
                <div className="hidden sm:flex flex-col items-end text-[11px] text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase size={12} />
                    {cs.sector}
                  </span>
                  <span className="inline-flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    4–8 weeks journey
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {cs.headline}
                  </p>
                  <p className="text-xs text-slate-600">{cs.summary}</p>
                </div>

                {/* Before / After */}
                <div className="grid grid-cols-1 gap-3 mt-1 text-[11px]">
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                    <p className="font-semibold text-red-700 mb-1 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                      Before InterviewMate
                    </p>
                    <ul className="space-y-1 text-red-800/90">
                      {cs.before.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                    <p className="font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      After using InterviewMate
                    </p>
                    <ul className="space-y-1 text-emerald-800/90">
                      {cs.after.map((item) => (
                        <li key={item} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="mt-[2px]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  {cs.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2"
                    >
                      <p className="text-xs font-semibold text-slate-900">
                        {m.value}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
