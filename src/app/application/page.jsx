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
  PhoneCall,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const JOBS_PAGE_SIZE = 10;
const ALLOWED_ROLES = ["candidate", "admin", "hr"];

/**
 * Parse slot date + timeSlot string into a JS Date for the interview start.
 * Supports approximate formats like:
 *  - "3-4 PM"
 *  - "3 PM - 4 PM"
 *  - "15:00-16:00"
 */
function getInterviewStartDate(app) {
  const { date, timeSlot } = app || {};
  if (!date || !timeSlot) return null;

  try {
    let normalized = String(timeSlot).toUpperCase().trim();

    // Take the first part before '-' or '–' or 'TO'
    let [startPart] = normalized.split(/-|–|TO/);
    startPart = startPart.trim();

    // If overall string has AM/PM but startPart doesn't, append it
    const ampmMatch = normalized.match(/\b(AM|PM)\b/);
    if (ampmMatch && !/\b(AM|PM)\b/.test(startPart)) {
      startPart = `${startPart} ${ampmMatch[1]}`;
    }

    // Try simple Date parse first
    let candidate = new Date(`${date} ${startPart}`);
    if (!isNaN(candidate.getTime())) {
      return candidate;
    }

    // Manual parse
    const m = startPart.match(
      /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/
    );
    if (!m) return null;

    let hour = parseInt(m[1], 10);
    const minute = m[2] ? parseInt(m[2], 10) : 0;
    const ampm = m[3];

    if (ampm) {
      if (ampm === "PM" && hour < 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
    }

    const [year, month, day] = date.split("-").map((x) => parseInt(x, 10));
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day, hour, minute, 0);
  } catch {
    return null;
  }
}

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Interview slot applications (from /api/applications)
  const [slotApplications, setSlotApplications] = useState([]);
  // Interviews_Candidate records, keyed by applicationId
  const [interviewDetailsByAppId, setInterviewDetailsByAppId] = useState({});
  // Job applications (from users_jobs_application)
  const [jobApplications, setJobApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For time-based enabling of the call button
  const [now, setNow] = useState(new Date());

  // Pagination state for job applications
  const [jobPage, setJobPage] = useState(1);

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

  // Update "now" every 60s so buttons auto-enable when time comes
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Page title
  useEffect(() => {
    if (!user) return;
    document.title = "My Applications | InterviewMate";
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    // Not logged in → go to login
    if (!user) {
      router.push("/authentication/login");
      return;
    }

    // Role-based access control
    // const role = user.role; // assumes AuthContext attaches role to user
    // if (!ALLOWED_ROLES.includes(role)) {
    //   router.replace("/not-found");
    //   return;
    // }

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // Build query for job applications using BOTH uid & email
        const jobParams = new URLSearchParams();
        if (user.uid) jobParams.set("candidateUid", user.uid);
        if (user.email) jobParams.set("candidateEmail", user.email);

        // Fetch interview slot applications + job applications + candidate interviews in parallel
        const [slotRes, jobRes, interviewsRes] = await Promise.all([
          fetch(`/api/applications?email=${encodeURIComponent(user.email)}`),
          fetch(`/api/users-jobs-application?${jobParams.toString()}`),
          fetch(
            `/api/interviews-candidate?email=${encodeURIComponent(
              user.email
            )}`
          ),
        ]);

        let slotData = [];
        let jobDataRaw = [];
        let interviewsDataRaw = [];

        // ---- slot applications ----
        if (slotRes.ok) {
          const json = await slotRes.json();
          slotData = Array.isArray(json) ? json : [];
        } else {
          console.error("Failed to load interview applications.");
        }

        // ---- job applications ----
        if (jobRes.ok) {
          const json = await jobRes.json();
          jobDataRaw = Array.isArray(json) ? json : [];
        } else {
          console.error("Failed to load job applications.");
        }

        // ---- interviews candidate (approved / paid etc.) ----
        if (interviewsRes.ok) {
          const json = await interviewsRes.json();
          interviewsDataRaw = Array.isArray(json) ? json : [];
        } else {
          console.error("Failed to load interviews candidate data.");
        }

        if (!slotRes.ok && !jobRes.ok) {
          throw new Error("Failed to load your applications.");
        }

        setSlotApplications(slotData);

        // Map applicationId → interview detail
        const map = {};
        for (const interview of interviewsDataRaw) {
          if (interview.applicationId) {
            map[interview.applicationId] = interview;
          }
        }
        setInterviewDetailsByAppId(map);

        // Sort job applications by newest
        const sortedJobs = Array.isArray(jobDataRaw)
          ? [...jobDataRaw].sort((a, b) => {
              const da = new Date(a.appliedAt || a.createdAt || 0).getTime();
              const db = new Date(b.appliedAt || b.createdAt || 0).getTime();
              return db - da;
            })
          : [];

        setJobApplications(sortedJobs);
        setJobPage(1);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, user, router]);

  // Join call → redirect to /calling with roomId + candidate name
  const handleJoinCall = (roomId) => {
    if (!roomId) return;

    const displayName =
      user?.displayName || user?.fullName || user?.email || "Candidate";

    router.push(
      `/calling?roomId=${encodeURIComponent(
        roomId
      )}&name=${encodeURIComponent(displayName)}`
    );
  };

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
        {(authLoading || loading) && !error && (
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

        {/* CONTENT */}
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
                          Date &amp; Time
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
                          Interviewer (HR)
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Applied At
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Join Interview
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {slotApplications.map((app, index) => {
                        // applicationId is the foreign key for Interviews_Candidate
                        const appId =
                          app.applicationId || app._id?.toString();
                        const interview = appId
                          ? interviewDetailsByAppId[appId]
                          : undefined;

                        const mergedPaymentStatus =
                          interview?.paymentStatus || app.paymentStatus;
                        const mergedApprovalStatus =
                          interview?.approvalStatus || app.approvalStatus;

                        const isPaidApproved =
                          mergedPaymentStatus === "paid" &&
                          mergedApprovalStatus === "Approved";

                        const startDate = getInterviewStartDate(app);
                        let isWithinTimeWindow = false;
                        let timeMessage = "";

                        if (startDate && !isNaN(startDate.getTime())) {
                          const diffMs = startDate.getTime() - now.getTime();
                          const oneHourMs = 60 * 60 * 1000;

                          // Allow from 1 hour before until 1 hour after start
                          if (
                            diffMs <= oneHourMs &&
                            diffMs >= -oneHourMs
                          ) {
                            isWithinTimeWindow = true;
                          }

                          if (diffMs > oneHourMs) {
                            timeMessage = "Available 1 hour before start time";
                          } else if (diffMs < -oneHourMs) {
                            timeMessage = "Interview time has passed";
                          }
                        } else {
                          timeMessage = "Time not set correctly";
                        }

                        const canJoinCall =
                          appId && isPaidApproved && isWithinTimeWindow;

                        return (
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
                                  mergedPaymentStatus === "unpaid"
                                    ? "bg-red-50 text-red-700 border border-red-100"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}
                              >
                                <BadgeDollarSign size={12} />
                                {mergedPaymentStatus}
                              </span>
                            </td>

                            {/* Approval Status */}
                            <td className="px-4 py-3 align-top">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                  mergedApprovalStatus === "Not approved"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}
                              >
                                <ShieldAlert size={12} />
                                {mergedApprovalStatus}
                              </span>
                            </td>

                            {/* HR Details */}
                            <td className="px-4 py-3 align-top text-xs text-slate-600">
                              {isPaidApproved && interview ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-slate-800">
                                    {interview.createdByName || "HR"}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {interview.createdByEmail}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  Pending HR assignment
                                </span>
                              )}
                            </td>

                            {/* Created At */}
                            <td className="px-4 py-3 align-top text-xs text-slate-500">
                              {app.createdAt
                                ? new Date(app.createdAt).toLocaleString()
                                : "-"}
                            </td>

                            {/* Join Interview / Call Button */}
                            <td className="px-4 py-3 align-top text-xs text-slate-500">
                              {canJoinCall ? (
                                <button
                                  onClick={() => handleJoinCall(appId)}
                                  className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white px-3 py-1.5 text-[11px] font-medium hover:bg-blue-700"
                                >
                                  <PhoneCall size={12} />
                                  Join Interview
                                </button>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[11px] text-slate-400">
                                    {isPaidApproved
                                      ? timeMessage ||
                                        "Call will be available near start time"
                                      : "Complete payment & approval to enable call"}
                                  </span>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
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
                    button on job details. You have applied to{" "}
                    <span className="font-semibold text-slate-700">
                      {jobApplications.length}
                    </span>{" "}
                    job{jobApplications.length !== 1 && "s"} so far.
                  </p>
                </div>
                {jobApplications.length > 0 && (
                  <div className="text-xs text-slate-500 text-right">
                    Showing{" "}
                    <span className="font-semibold">
                      {paginatedJobApplications.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {jobApplications.length}
                    </span>{" "}
                    applications
                    <br />
                    <span className="text-[11px] text-slate-400">
                      Page {jobPage} of {totalJobPages}
                    </span>
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
                            Job Details
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
                        {paginatedJobApplications.map((app, index) => {
                          const appliedAt = app.appliedAt || app.createdAt;
                          const deadline = app.jobDeadline;
                          return (
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
                                    <Briefcase
                                      size={14}
                                      className="text-slate-500"
                                    />
                                    <span className="font-semibold">
                                      {app.jobTitle}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    {app.company}
                                  </p>
                                </div>
                              </td>

                              {/* Job details */}
                              <td className="px-4 py-3 align-top text-xs text-slate-700">
                                <div className="flex flex-col gap-1.5">
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
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                      <BadgeDollarSign size={11} />
                                      <span>
                                        {app.salary.min} - {app.salary.max}{" "}
                                        {app.salary.currency}
                                      </span>
                                    </div>
                                  )}

                                  {typeof app.jobVacancy === "number" && (
                                    <div className="text-[11px] text-slate-600">
                                      👥 Vacancy: {app.jobVacancy}
                                    </div>
                                  )}

                                  {app.jobTime && (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                      <Clock size={11} />
                                      <span>{app.jobTime}</span>
                                    </div>
                                  )}

                                  {app.jobAddress && (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                      <MapPin size={11} />
                                      <span>{app.jobAddress}</span>
                                    </div>
                                  )}

                                  {deadline && (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                      <CalendarDays size={11} />
                                      <span>
                                        Deadline:{" "}
                                        {new Date(
                                          deadline
                                        ).toLocaleDateString()}
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
                                {appliedAt ? (
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <CalendarDays size={11} />
                                      <span>
                                        {new Date(
                                          appliedAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock size={11} />
                                      <span>
                                        {new Date(
                                          appliedAt
                                        ).toLocaleTimeString()}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalJobPages > 1 && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="text-slate-500">
                        Page{" "}
                        <span className="font-semibold">{jobPage}</span> of{" "}
                        <span className="font-semibold">
                          {totalJobPages}
                        </span>{" "}
                        •{" "}
                        <span className="font-semibold">
                          {jobApplications.length}
                        </span>{" "}
                        total application
                        {jobApplications.length !== 1 && "s"}
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
