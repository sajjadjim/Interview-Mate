"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Tag,
  BadgeDollarSign,
  ShieldAlert,
  Briefcase,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const JOBS_PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Interview slot applications (from /api/applications)
  const [slotApplications, setSlotApplications] = useState([]);
  // Job applications (from users_jobs_application)
  const [jobApplications, setJobApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state for job applications
  const [jobPage, setJobPage] = useState(1);

  // Derived pagination values
  const totalJobPages = useMemo(() => {
    if (!jobApplications.length) return 1;
    return Math.max(1, Math.ceil(jobApplications.length / JOBS_PAGE_SIZE));
  }, [jobApplications]);

  const paginatedJobApplications = useMemo(() => {
    const start = (jobPage - 1) * JOBS_PAGE_SIZE;
    const end = start + JOBS_PAGE_SIZE;
    return jobApplications.slice(start, end);
  }, [jobApplications, jobPage]);

  const canPrevJobPage = jobPage > 1;
  const canNextJobPage = jobPage < totalJobPages;

  useEffect(() => {
    if (!user) return;
    document.title = "My Applications | InterviewMate";
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (authLoading) return;

      // if not logged in → redirect to login
      if (!user) {
        router.push("/authentication/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Fetch interview slot applications + job applications in parallel
        const [slotRes, jobRes] = await Promise.all([
          fetch(`/api/applications?email=${encodeURIComponent(user.email)}`),
          fetch(
            `/api/users-jobs-application?candidateUid=${encodeURIComponent(
              user.uid
            )}`
          ),
        ]);

        let slotData = [];
        let jobData = [];

        if (slotRes.ok) {
          slotData = await slotRes.json();
        } else {
          console.error("Failed to load interview applications.");
        }

        if (jobRes.ok) {
          jobData = await jobRes.json();
        } else {
          console.error("Failed to load job applications.");
        }

        // If both failed, show error
        if (!slotRes.ok && !jobRes.ok) {
          throw new Error("Failed to load your applications.");
        }

        // Normalize arrays
        setSlotApplications(Array.isArray(slotData) ? slotData : []);

        // Sort job applications by newest first
        const sortedJobs = Array.isArray(jobData)
          ? [...jobData].sort((a, b) => {
              const da = new Date(a.createdAt || 0).getTime();
              const db = new Date(b.createdAt || 0).getTime();
              return db - da;
            })
          : [];

        setJobApplications(sortedJobs);
        setJobPage(1); // reset page when reloading
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, user, router]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              My Applications
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track your interview slot requests and job applications in one
              place.
            </p>
          </div>
          {user && (
            <div className="text-xs sm:text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1">
              Signed in as{" "}
              <span className="font-semibold text-slate-800">
                {user.email}
              </span>
            </div>
          )}
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <span className="inline-block h-8 w-8 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
              <span className="text-sm">Loading your applications...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* CONTENT (only when not loading & no global error) */}
        {!loading && !error && (
          <div className="space-y-10">
            {/* ==== SECTION 1: INTERVIEW SLOT APPLICATIONS ==== */}
            <section>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Interview Slot Applications
                  </h2>
                  <p className="text-xs text-slate-500">
                    These are the interview time slots you requested via the
                    Apply page.
                  </p>
                </div>
              </div>

              {slotApplications.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm bg-white border border-dashed border-slate-200 rounded-xl">
                  You haven&apos;t submitted any interview slot applications
                  yet.
                </div>
              ) : (
                <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100/70 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Topic
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Payment Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Approval Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Applied At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {slotApplications.map((app, index) => (
                        <motion.tr
                          key={app._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }
                        >
                          {/* Date & Time */}
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex items-center gap-2 text-slate-700">
                                <CalendarDays size={12} />
                                <span>{app.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock size={12} />
                                <span>{app.timeSlot}</span>
                              </div>
                            </div>
                          </td>

                          {/* Topic */}
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-center gap-2 text-xs text-slate-700">
                              <Tag size={12} />
                              <span>{app.topic}</span>
                            </div>
                          </td>

                          {/* Payment Status */}
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                app.paymentStatus === "unpaid"
                                  ? "bg-red-50 text-red-700 border border-red-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              }`}
                            >
                              <BadgeDollarSign size={12} />
                              {app.paymentStatus}
                            </span>
                          </td>

                          {/* Approval Status */}
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                app.approvalStatus === "Not approved"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              }`}
                            >
                              <ShieldAlert size={12} />
                              {app.approvalStatus}
                            </span>
                          </td>

                          {/* Created At */}
                          <td className="px-4 py-3 align-top text-xs text-slate-500">
                            {app.createdAt
                              ? new Date(app.createdAt).toLocaleString()
                              : "-"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ==== SECTION 2: JOB APPLICATIONS ==== */}
            <section>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Job Applications
                  </h2>
                  <p className="text-xs text-slate-500">
                    These are the jobs you have applied for using the Apply
                    button on job details.
                  </p>
                </div>
                {jobApplications.length > 0 && (
                  <div className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold">
                      {paginatedJobApplications.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {jobApplications.length}
                    </span>{" "}
                    applications
                  </div>
                )}
              </div>

              {jobApplications.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm bg-white border border-dashed border-slate-200 rounded-xl">
                  You haven&apos;t applied for any jobs yet.
                </div>
              ) : (
                <>
                  <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-100/70 text-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">
                            Job
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Details
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Applied At
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedJobApplications.map((app, index) => (
                          <motion.tr
                            key={app._id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: index * 0.02,
                            }}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            }
                          >
                            {/* Job title & company */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-900">
                                  <Briefcase size={14} className="text-slate-500" />
                                  <span className="font-semibold">
                                    {app.jobTitle}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">
                                  {app.company}
                                </p>
                              </div>
                            </td>

                            {/* Sector, location, salary */}
                            <td className="px-4 py-3 align-top text-xs text-slate-700">
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap gap-1.5">
                                  {app.sector && (
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                                      <Tag size={11} className="mr-1" />
                                      {app.sector}
                                    </span>
                                  )}
                                  {app.type && (
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                                      {app.type}
                                    </span>
                                  )}
                                  {app.location && (
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                                      <MapPin size={11} className="mr-1" />
                                      {app.location}
                                    </span>
                                  )}
                                </div>
                                {app.salary && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1">
                                    <BadgeDollarSign size={11} />
                                    <span>
                                      {app.salary.min} - {app.salary.max}{" "}
                                      {app.salary.currency}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 align-top text-xs">
                              {(() => {
                                const status = app.status || "submitted";
                                const lower = status.toLowerCase();

                                let classes =
                                  "bg-slate-100 text-slate-700 border border-slate-200";
                                let icon = <ShieldAlert size={12} />;

                                if (lower === "submitted") {
                                  classes =
                                    "bg-blue-50 text-blue-700 border border-blue-100";
                                  icon = <ShieldAlert size={12} />;
                                } else if (
                                  lower === "shortlisted" ||
                                  lower === "under review"
                                ) {
                                  classes =
                                    "bg-amber-50 text-amber-700 border border-amber-100";
                                  icon = <ShieldAlert size={12} />;
                                } else if (
                                  lower === "accepted" ||
                                  lower === "hired"
                                ) {
                                  classes =
                                    "bg-emerald-50 text-emerald-700 border border-emerald-100";
                                  icon = <CheckCircle2 size={12} />;
                                } else if (
                                  lower === "rejected" ||
                                  lower === "declined"
                                ) {
                                  classes =
                                    "bg-red-50 text-red-700 border border-red-100";
                                  icon = <ShieldAlert size={12} />;
                                }

                                return (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${classes}`}
                                  >
                                    {icon}
                                    {status}
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Applied At */}
                            <td className="px-4 py-3 align-top text-xs text-slate-500">
                              {app.createdAt
                                ? new Date(app.createdAt).toLocaleString()
                                : "-"}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Job pagination controls */}
                  {totalJobPages > 1 && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="text-slate-500">
                        Page{" "}
                        <span className="font-semibold">{jobPage}</span> of{" "}
                        <span className="font-semibold">
                          {totalJobPages}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            canPrevJobPage && setJobPage((p) => p - 1)
                          }
                          disabled={!canPrevJobPage}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                            canPrevJobPage
                              ? "bg-white hover:bg-slate-50"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={() =>
                            canNextJobPage && setJobPage((p) => p + 1)
                          }
                          disabled={!canNextJobPage}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                            canNextJobPage
                              ? "bg-white hover:bg-slate-50"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
