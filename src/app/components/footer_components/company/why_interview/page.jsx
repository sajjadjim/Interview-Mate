import {
  HelpCircle,
  Users,
  Briefcase,
  GraduationCap,
  Target,
  Clock,
  Globe2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Why Interviews? | InterviewMate",
  description:
    "Why Bangladeshi candidates, HRs and companies use InterviewMate for mock interviews and job search in one place.",
};

const reasons = [
  {
    icon: GraduationCap,
    title: "Bangladesh job market is very competitive",
    body: "Every year thousands of graduates from public and private universities compete for a limited number of good jobs. Good CGPA is not enough — communication, interview skills and confidence matter a lot.",
  },
  {
    icon: Users,
    title: "Most people don’t get structured interview practice",
    body: "Many candidates only practice in front of the mirror or with friends. They don’t get real-time feedback like an HR or senior engineer would give in a real interview.",
  },
  {
    icon: Briefcase,
    title: "HR & Company teams are overloaded",
    body: "HRs in Dhaka, Chattogram or other cities often handle hundreds of CVs. They don’t have time to run separate mock sessions for each candidate or manage messy Excel sheets for interview slots.",
  },
  {
    icon: Clock,
    title: "Time slot & status tracking is usually manual",
    body: "In most local setups, interview time, payment status, and approval status are tracked in WhatsApp, Messenger and spreadsheets — easy to lose, hard to filter.",
  },
];

const whoUses = [
  {
    title: "Students & fresh graduates",
    points: [
      "Final year university students preparing for their first job.",
      "Polytechnic / diploma holders entering the IT or commercial sector.",
      "Self-taught learners who want to test their skills against real interview-style questions.",
    ],
  },
  {
    title: "Working professionals (IT & non-IT)",
    points: [
      "Junior / mid-level engineers preparing for better offers or foreign remote jobs.",
      "Non-tech professionals in banking, commercial and management roles wanting to upgrade their interview presence.",
      "People switching career paths (e.g., non-CS to software).",
    ],
  },
  {
    title: "HRs & Companies in Bangladesh",
    points: [
      "HR executives in local companies who need a faster way to manage applicants & interview slots.",
      "Startups and SMEs who cannot build their own full ATS but still want structure.",
      "Training institutes or coaching centers that want to run mock interviews in a professional way.",
    ],
  },
];

const comparisonRows = [
  {
    label: "Primary focus",
    jobSites: "Job postings & CV search (e.g., general job portals)",
    learningSites: "Recorded video courses, notes, MCQ practice",
    interviewMate:
      "Mock interviews + job search + time slot management in one system",
  },
  {
    label: "Bangladesh specific context",
    jobSites: "Country-specific, but mainly job listing focused",
    learningSites: "Some Bangla content, mostly theory/exam focused",
    interviewMate:
      "Designed for Bangladeshi candidates & HR workflows (BD time slots, local sectors, status like unpaid / not approved, etc.)",
  },
  {
    label: "Mock interview support",
    jobSites: "Usually no structured mock interview feature",
    learningSites: "Tips and theory, sometimes no live mock practice",
    interviewMate:
      "Applicants_Details + Interviews_Candidate + clear slots to simulate real interview flow",
  },
  {
    label: "Roles & permissions",
    jobSites: "Job seeker vs employer accounts",
    learningSites: "Student vs instructor",
    interviewMate:
      "Candidate, HR, Company roles with their own profile and actions inside the same platform",
  },
  {
    label: "Status tracking",
    jobSites: "Applied / shortlisted / rejected (basic)",
    learningSites: "Course progress",
    interviewMate:
      "PaymentStatus (paid / unpaid) + ApprovalStatus (approved / not approved / waiting) to keep interview pipeline clean",
  },
];

const faqItems = [
  {
    q: "Is InterviewMate a job portal or a mock interview platform?",
    a: "It is a hybrid. You can search & apply to jobs, but at the same time you can book interview slots, run mock interviews and track your progress. For Bangladesh, this 2-in-1 approach is still uncommon.",
  },
  {
    q: "Are there other platforms in Bangladesh that do something similar?",
    a: "Bangladesh already has strong job portals and some interview-preparation sites, and even a few mock interview platforms. But most of them either focus only on job listings or only on learning/mock practice. Combining role-based profiles (Candidate, HR, Company), interview slot booking, status tracking and job posts in one place is still quite rare locally.",
  },
  {
    q: "Why is this important for Bangladeshi candidates?",
    a: "Because many talented students and professionals lose opportunities not due to lack of skills, but due to lack of structured preparation and guidance. A platform focused on the local context can reduce that gap.",
  },
];

export default function WhyInterviewsPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 md:pt-12">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1.1fr] items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">
              Why Interviews • Bangladesh Perspective
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Why people in{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                Bangladesh
              </span>{" "}
              should use our interview system
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl">
              InterviewMate is built for Bangladeshi students, job seekers, HRs and
              companies who want something more than just a job post or a random
              mock-interview call. It gives you one place to prepare, apply and
              manage interviews in a structured way.
            </p>
          </div>

          {/* Highlight card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HelpCircle size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  What problem are we solving?
                </p>
                <p className="text-[11px] text-slate-500">
                  Many Bangladeshi candidates can find job circulars, but very few
                  get guided practice and structured follow-up for interviews.
                </p>
              </div>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1.5">
              <li>• One account, three roles: Candidate, HR, Company.</li>
              <li>• Apply to jobs and also book interview / mock slots.</li>
              <li>• Payment & approval status tracked clearly instead of messy notes.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why this platform (cards) */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
          Why an interview-focused platform is important in Bangladesh
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex gap-3"
              >
                <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* For whom section */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            Who uses InterviewMate in Bangladesh?
          </h2>
          <p className="text-[11px] text-slate-500">
            Designed for different roles: Candidate, HR & Company
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {whoUses.map((group) => (
            <div
              key={group.title}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col"
            >
              <p className="text-sm font-semibold text-slate-900 mb-2">
                {group.title}
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                {group.points.map((p) => (
                  <li key={p} className="flex items-start gap-1.5">
                    <CheckCircle2 size={12} className="mt-[2px] text-emerald-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Bangladesh & similar platforms explanation */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1.3fr] items-start">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Globe2 size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Are there similar platforms in Bangladesh?
                </p>
                <p className="text-[11px] text-slate-500">
                  Short answer: we already have strong job portals and some interview
                  resources, but this combined approach is still uncommon.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Bangladesh has popular job portals where you can find thousands of job
              circulars and apply online. There are also learning platforms and some
              mock-interview or interview-question websites. However, most of them
              focus only on one part of the journey: either{" "}
              <strong>finding jobs</strong> or <strong>learning theory / questions</strong>.
            </p>

            <p className="text-xs text-slate-600">
              InterviewMate tries to connect these pieces for the local context: a
              Bangladeshi candidate can{" "}
              <span className="font-semibold">
                apply to jobs, book interview or mock slots, and track payment /
                approval status
              </span>{" "}
              in the same system. HRs and companies can see structured candidate
              information instead of jumping between many tools.
            </p>
          </div>

          {/* Comparison mini-table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              How is InterviewMate different?
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              A simple comparison between typical platforms and your 2-in-1 approach.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="text-left px-2 py-1 border-b border-slate-200">
                      Aspect
                    </th>
                    <th className="text-left px-2 py-1 border-b border-slate-200">
                      Job sites
                    </th>
                    <th className="text-left px-2 py-1 border-b border-slate-200">
                      Learning / prep
                    </th>
                    <th className="text-left px-2 py-1 border-b border-slate-200">
                      InterviewMate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="align-top">
                      <td className="px-2 py-2 border-b border-slate-100 text-slate-700 font-semibold">
                        {row.label}
                      </td>
                      <td className="px-2 py-2 border-b border-slate-100 text-slate-600">
                        {row.jobSites}
                      </td>
                      <td className="px-2 py-2 border-b border-slate-100 text-slate-600">
                        {row.learningSites}
                      </td>
                      <td className="px-2 py-2 border-b border-slate-100 text-slate-900 font-medium">
                        {row.interviewMate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Simple BD-focused flow */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
            How a Bangladeshi candidate typically uses InterviewMate
          </h2>
          <ol className="space-y-2 text-[11px] text-slate-600">
            <li className="flex gap-2">
              <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                1
              </span>
              <span>
                Creates an account as <strong>Candidate</strong> with email / Google /
                phone and fills the profile in the <strong>Profile</strong> page.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                2
              </span>
              <span>
                Goes to <strong>Jobs</strong> page, finds a role (IT, Commercial,
                Educational, etc.), and applies using the platform.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                3
              </span>
              <span>
                Uses the <strong>Apply</strong> page to book a time slot (e.g., 9–10AM,
                2–3PM, 9–10PM) and fills in topic and details.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                4
              </span>
              <span>
                HR / Company views the candidate in <strong>Applicants_Details</strong>{" "}
                and then moves them to <strong>Interviews_Candidate</strong> when
                approved, updating payment and approval status.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                5
              </span>
              <span>
                Candidate attends real or mock interview, gets feedback, and keeps using
                the platform to apply for more roles and improve performance.
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* FAQ & Call to action */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-[1.5fr_1.1fr] items-start">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
              Common questions about this platform
            </h2>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.q} className="border-b last:border-b-0 border-slate-100 pb-2">
                  <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    <Target size={13} className="text-blue-600" />
                    {item.q}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-500 rounded-2xl shadow-sm p-4 text-white">
            <p className="text-sm font-semibold mb-1">
              Ready to try InterviewMate for your next step?
            </p>
            <p className="text-[11px] text-blue-50 mb-3">
              Whether you&apos;re a student in Dhaka, a mid-level engineer in Chattogram,
              or an HR in Narayanganj — you can start by creating a profile and booking
              your first interview slot today.
            </p>
            <div className="flex flex-wrap gap-2 text-[12px]">
              <a
                href="/authentication/register"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-blue-700 font-semibold hover:bg-blue-50"
              >
                Create an account
                <ArrowRight size={14} />
              </a>
              <a
                href="/apply"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/40 text-white/95 hover:bg-white/10"
              >
                Book an interview slot
              </a>
              <a
                href="/jobs"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/40 text-white/95 hover:bg-white/10"
              >
                Explore jobs
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
