import Link from "next/link";
import { ChevronRight, Home, Map, Link2 } from "lucide-react";

export const metadata = {
  title: "Sitemap | InterviewMate",
  description: "All important pages and sections of the InterviewMate website.",
};

const sitemapSections = [
  {
    title: "Main Pages",
    icon: Home,
    links: [
      { label: "Home", href: "/", description: "Landing page of InterviewMate." },
      { label: "Jobs", href: "/jobs", description: "Browse and search available jobs." },
      { label: "Interviews", href: "/interviews", description: "Manage interview candidates and slots." },
      { label: "Apply", href: "/apply", description: "Submit your interview application." },
      { label: "Blogs", href: "/blogs", description: "Interview and career related articles." },
      { label: "About", href: "/about", description: "Learn more about InterviewMate." },
      { label: "Contact", href: "/contact", description: "Contact support or send a message." },
    ],
  },
  {
    title: "Authentication",
    icon: Link2,
    links: [
      {
        label: "Login",
        href: "/authentication/login",
        description: "Sign in with email, Google, or phone number.",
      },
      {
        label: "Register",
        href: "/authentication/register",
        description: "Create a new InterviewMate account.",
      },
    ],
  },
  {
    title: "User & Dashboard",
    icon: Map,
    links: [
      {
        label: "Dashboard",
        href: "/dashboard",
        description: "Overview of your account, activity, and shortcuts.",
      },
      {
        label: "Profile",
        href: "/profile",
        description: "View and update your candidate / HR / company profile.",
      },
    ],
  },
  {
    title: "Support & System",
    icon: Map,
    links: [
      {
        label: "Sitemap",
        href: "/sitemap",
        description: "This page – an overview of all main routes.",
      },
      {
        label: "404 Page",
        href: "/not-found",
        description: "Custom not-found experience (used when route is invalid).",
      },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6 md:pt-12">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">
            Sitemap
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Website sitemap for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
              InterviewMate
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            Quickly explore all important pages of the platform — from jobs and interviews
            to authentication and profile management.
          </p>
        </div>
      </section>

      {/* Sitemap sections */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {sitemapSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={18} />
                  </span>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li
                      key={link.href}
                      className="group flex items-start justify-between gap-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 px-3 py-2 transition-colors"
                    >
                      <div>
                        <Link
                          href={link.href}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 group-hover:text-blue-800"
                        >
                          {link.label}
                          <ChevronRight
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {link.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 break-all hidden sm:inline">
                        {link.href}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
