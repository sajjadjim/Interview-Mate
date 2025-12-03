import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  Briefcase,
  GraduationCap,
  Video,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Users,
  CalendarDays, // ✅ ADD THIS
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top navigation */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white">
        {/* subtle shapes */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:justify-between md:py-20">
          {/* Left text content */}
          <div className="max-w-xl space-y-6 text-center md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
              <Sparkles className="h-3 w-3" />
              Built for Bangladeshi job seekers & HR
            </p>

            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              Practice interviews.
              <br />
              <span className="text-yellow-300">Get hired faster.</span>
            </h1>

            <p className="text-sm leading-relaxed text-blue-100 md:text-base">
              InterviewMate connects candidates, trainers and HR professionals
              to run realistic mock interviews, share structured feedback, and
              apply directly to verified jobs in Bangladesh.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <a
                href="/authentication/login"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-50"
              >
                Get Started Free
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Learn how it works
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-blue-100/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>Structured feedback from real HR & trainers</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-200" />
                <span>Designed for students, freshers & mid-level talents</span>
              </div>
            </div>
          </div>

          {/* Right “card” */}
          <div className="w-full max-w-md rounded-2xl bg-white/95 p-5 text-slate-900 shadow-2xl ring-1 ring-slate-200/60 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your mock interview at a glance
            </p>
            <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">
                  Role: Junior Software Engineer
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  IT Sector
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                  <CalendarDays className="h-3 w-3" /> Tomorrow, 8 PM
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                  <Video className="h-3 w-3" /> Live video call
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                  <MessageCircle className="h-3 w-3" /> 1:1 feedback
                </span>
              </div>
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800">
                  Next step for you
                </p>
                <p className="mt-1">
                  Book a free slot, join the call on time, and get a scorecard
                  with strengths, weaknesses and improvement tips.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <div>
                <p>
                  Avg. rating from candidates:
                  <span className="ml-1 font-semibold text-amber-500">
                    ★ 4.8 / 5
                  </span>
                </p>
                <p>Based on practice interviews across Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it’s for */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
            One platform for candidates, trainers & HR
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 md:text-base">
            Whether you are a student, a job seeker or a hiring team in
            Bangladesh, InterviewMate makes the interview journey smoother.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Students / Freshers */}
            <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Students & Freshers
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Practice for campus placements, entry-level roles and internships
                with real interview questions asked by employers in Bangladesh.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
                <li>CV-based mock interviews</li>
                <li>English speaking & communication practice</li>
                <li>Category-wise sessions (IT, business, non-tech)</li>
              </ul>
            </div>

            {/* Job seekers */}
            <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Job Seekers
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Upgrade your interview skills for mid-level positions and switch
                roles confidently with targeted feedback.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
                <li>Role & experience-level specific questions</li>
                <li>Behavioural & HR round simulations</li>
                <li>Direct access to posted jobs</li>
              </ul>
            </div>

            {/* HR & Companies */}
            <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                HR & Companies
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Run structured interviews, track candidates and discover
                better-prepared applicants for your openings.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
                <li>Shortlist from mock performance</li>
                <li>Manage interview slots & candidate lists</li>
                <li>Bangladesh-focused talent pipeline</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature / Steps section */}
      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
            How InterviewMate works
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 md:text-base">
            Simple steps to move from practice to real job offers.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                Step 1
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Create your profile
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Sign up as candidate, HR, or company. Add your basic details so
                we can match you with the right sessions.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                Step 2
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Book an interview slot
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Choose your topic (IT, educational, management, commercial or
                others) and time slot that fits your schedule.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                Step 3
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Join, learn & apply
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Attend the live session, get feedback, and apply for suitable
                jobs directly from InterviewMate.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white md:flex-row">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                Ready to start?
              </p>
              <p className="text-base md:text-lg">
                Join InterviewMate today and turn interview fear into confidence.
              </p>
            </div>
            <a
              href="/authentication/register"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-50"
            >
              Create your free account
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}
