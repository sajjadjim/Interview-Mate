// src/app/candidate_applications/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  Building2,
  Users,
  Briefcase,
  CalendarDays,
  MapPin,
  Clock,
  Search,
  Mail,
  Phone,
  User as UserIcon,
  BadgeCheck,
  FileText,
  Star,
  Trash2,
} from "lucide-react";

const JOBS_PAGE_SIZE = 9;
const APPS_PAGE_SIZE = 10;

export default function CandidateApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [applicationsPerJob, setApplicationsPerJob] = useState({});
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);

  const [applicants, setApplicants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // applicants search & pagination & job filter
  const [searchEmail, setSearchEmail] = useState("");
  const [appsPage, setAppsPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState("all");

  // shortlist & delete loading states per application
  const [shortlistLoading, setShortlistLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  useEffect(() => {
    document.title = "Candidate Applications | InterviewMate";
  }, []);

  // 1) Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication/login");
    }
  }, [authLoading, user, router]);

  // 2) Load Mongo user doc (to get role + status)
  useEffect(() => {
    const loadUserDoc = async () => {
      if (authLoading || !user) return;

      try {
        setRoleLoading(true);
        setError("");

        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load user profile.");
        }

        const data = await res.json();
        setDbUser(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load user profile.");
      } finally {
        setRoleLoading(false);
      }
    };

    loadUserDoc();
  }, [authLoading, user]);

  const role = dbUser?.role;
  const status = dbUser?.status || "unknown";

  // 3) Non-company users -> redirect to 404 (hard-block)
  useEffect(() => {
    if (!authLoading && !roleLoading && user && dbUser) {
      if (role !== "company") {
        router.replace("/404");
      }
    }
  }, [authLoading, roleLoading, user, dbUser, role, router]);

  // 4) Load jobs + applicants for this company
  useEffect(() => {
    const loadData = async () => {
      if (!user || !dbUser || role !== "company") return;

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(jobsPage));
        params.set("limit", String(JOBS_PAGE_SIZE));
        // backend will check this email belongs to a company account
        params.set("email", dbUser.email || user.email);

        const res = await fetch(
          `/api/company/candidate-applications?${params.toString()}`
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.message || "Failed to load candidate applications."
          );
        }

        const data = await res.json();
        setJobs(data.jobs || []);
        setApplicationsPerJob(data.applicationsPerJob || {});
        setTotalJobs(data.totalJobs || 0);
        setTotalApplications(data.totalApplications || 0);
        setJobsTotalPages(data.totalPages || 1);
        setApplicants(data.applicants || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load candidate applications.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !roleLoading && role === "company") {
      loadData();
    }
  }, [authLoading, roleLoading, role, user, dbUser, jobsPage]);

  const canJobsPrev = jobsPage > 1;
  const canJobsNext = jobsPage < jobsTotalPages;

  // --- Job options (sorted by job title) for filter & cards ---
  const sortedJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return [...jobs].sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );
  }, [jobs]);

  const jobFilterOptions = useMemo(() => {
    const options = sortedJobs.map((job) => ({
      id: job._id,
      title: job.title || "(Untitled job)",
    }));
    return options;
  }, [sortedJobs]);

  // whenever search term or selected job changes, reset applicants page
  useEffect(() => {
    setAppsPage(1);
  }, [searchEmail, selectedJobId]);

  // --- Applicants search, job filter & sorting by job title + applied time ---
  const filteredApplicants = useMemo(() => {
    let base = applicants;

    // filter by selected job
    if (selectedJobId !== "all") {
      base = base.filter((a) => a.jobId === selectedJobId);
    }

    // filter by email search
    if (searchEmail.trim()) {
      const term = searchEmail.trim().toLowerCase();
      base = base.filter((a) =>
        a.candidateEmail?.toLowerCase().includes(term)
      );
    }

    // sort by jobTitle (A–Z), then by applied time (newest first)
    base = [...base].sort((a, b) => {
      const tA = (a.jobTitle || "").localeCompare(b.jobTitle || "");
      if (tA !== 0) return tA;

      const dA = a.appliedAt
        ? new Date(a.appliedAt).getTime()
        : a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;
      const dB = b.appliedAt
        ? new Date(b.appliedAt).getTime()
        : b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;
      return dB - dA; // newest first
    });

    return base;
  }, [applicants, searchEmail, selectedJobId]);

  const appsTotalPages = useMemo(() => {
    if (filteredApplicants.length === 0) return 1;
    return Math.max(1, Math.ceil(filteredApplicants.length / APPS_PAGE_SIZE));
  }, [filteredApplicants.length]);

  const currentAppsPage =
    appsPage > appsTotalPages ? appsTotalPages : appsPage;

  const appsStartIndex = (currentAppsPage - 1) * APPS_PAGE_SIZE;
  const appsPageItems = filteredApplicants.slice(
    appsStartIndex,
    appsStartIndex + APPS_PAGE_SIZE
  );

  const canAppsPrev = currentAppsPage > 1;
  const canAppsNext = currentAppsPage < appsTotalPages;

  // --------- Shortlist button handler ----------
  const handleShortlist = async (app) => {
    if (!user || !dbUser) return;
    const companyEmail = dbUser.email || user.email;

    setShortlistLoading((prev) => ({ ...prev, [app._id]: true }));

    try {
      const res = await fetch("/api/company/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyEmail,
          application: app,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Failed to shortlist candidate.");
        return;
      }

      // mark this applicant as shortlisted in local state
      setApplicants((prev) =>
        prev.map((a) =>
          a._id === app._id ? { ...a, shortlisted: true } : a
        )
      );
    } catch (err) {
      console.error("Error shortlisting candidate:", err);
      alert("Error shortlisting candidate. Please try again.");
    } finally {
      setShortlistLoading((prev) => ({ ...prev, [app._id]: false }));
    }
  };

  // --------- Delete application handler ----------
  const handleDeleteApplication = async (app) => {
    if (!user || !dbUser) return;
    const companyEmail = dbUser.email || user.email;

    const confirm = window.confirm(
      `Delete this application of ${app.candidateName || "candidate"} for "${app.jobTitle}"?`
    );
    if (!confirm) return;

    setDeleteLoading((prev) => ({ ...prev, [app._id]: true }));

    try {
      const res = await fetch("/api/company/candidate-applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyEmail,
          applicationId: app._id,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Failed to delete application.");
        return;
      }

      // remove from local applicants
      setApplicants((prev) => prev.filter((a) => a._id !== app._id));

      // update total applications + per-job counters
      setTotalApplications((prev) => Math.max(0, prev - 1));
      setApplicationsPerJob((prev) => {
        const next = { ...prev };
        if (app.jobId && typeof next[app.jobId] === "number") {
          next[app.jobId] = Math.max(0, next[app.jobId] - 1);
        }
        return next;
      });
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Error deleting application. Please try again.");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [app._id]: false }));
    }
  };

  // While auth/role info is loading, hide everything
  if (authLoading || roleLoading || (user && !dbUser)) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" label="Loading company data..." />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header + status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Candidate Applications
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              First see your company jobs (sorted by job name), then review all
              candidates who applied to those jobs. You can shortlist or delete
              applications directly from here.
            </p>
          </div>

          {dbUser && (
            <div className="text-xs sm:text-sm bg-white border border-slate-200 rounded-full px-3 py-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="flex items-center gap-1 text-slate-700">
                <Building2 size={14} />
                {dbUser.companyProfile?.companyName || "Your company account"}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-slate-500">
                Status:{" "}
                <span
                  className={
                    status === "active" ? "text-emerald-600" : "text-amber-600"
                  }
                >
                  {status}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Warning if company is inactive */}
        {status !== "active" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-800">
            Your company account is currently <strong>{status}</strong>. You can
            see your jobs and applicants, but some actions may be limited until
            verification is complete.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total jobs posted</p>
              <p className="text-xl font-semibold text-slate-900">
                {totalJobs}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total applications</p>
              <p className="text-xl font-semibold text-slate-900">
                {totalApplications}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Clock size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Applicants per page</p>
              <p className="text-xl font-semibold text-slate-900">
                {APPS_PAGE_SIZE}
              </p>
              <p className="text-[11px] text-slate-400">
                Page {currentAppsPage} of {appsTotalPages}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Loading overall */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner
              size="lg"
              label="Loading your jobs & applicants..."
            />
          </div>
        )}

        {/* Jobs grid (top section) */}
        {!loading && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Your posted jobs (sorted by job name)
            </h2>

            {sortedJobs.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                You haven&apos;t posted any jobs yet. Once you post jobs, they
                will appear here with application counts.
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedJobs.map((job, index) => {
                    const appsCount =
                      applicationsPerJob[job._id] !== undefined
                        ? applicationsPerJob[job._id]
                        : 0;

                    return (
                      <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col p-4"
                      >
                        <div className="mb-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">
                            {job.sector || "General"}
                          </p>
                          <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {job.company}
                          </p>
                        </div>

                        <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                          {job.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.type && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase size={12} />
                              <span>{job.type}</span>
                            </div>
                          )}
                          {job.postedDate && (
                            <div className="flex items-center gap-1.5">
                              <CalendarDays size={12} />
                              <span>
                                Posted:{" "}
                                {new Date(job.postedDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {job.deadline && (
                            <div className="flex items-center gap-1.5">
                              <CalendarDays size={12} />
                              <span>
                                Deadline:{" "}
                                {new Date(job.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <Users size={12} />
                            {appsCount}{" "}
                            {appsCount === 1 ? "Applicant" : "Applicants"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {jobsTotalPages > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Jobs page {jobsPage} of {jobsTotalPages} • {totalJobs} job
                      {totalJobs !== 1 && "s"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => canJobsPrev && setJobsPage((p) => p - 1)}
                        disabled={!canJobsPrev}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          canJobsPrev
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => canJobsNext && setJobsPage((p) => p + 1)}
                        disabled={!canJobsNext}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          canJobsNext
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
        )}

        {/* Applicants list (bottom section) */}
        {!loading && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Applicants list (sorted by job name)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  First choose a job or see all, then filter by email. You can
                  open the CV, shortlist the candidate, or delete the
                  application.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Job filter dropdown */}
                <div className="w-full sm:w-52">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-full px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All jobs</option>
                    {jobFilterOptions.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search by email */}
                <div className="w-full sm:w-64">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="Search by candidate email"
                      className="w-full pl-8 pr-3 py-2 rounded-full border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredApplicants.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                No applicants found for this selection yet.
              </div>
            ) : (
              <>
                <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-slate-100/70 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Candidate
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Job
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Applied On
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appsPageItems.map((app, index) => {
                        const appliedDate = app.appliedAt || app.createdAt;
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
                              index % 2 === 0
                                ? "bg-white"
                                : "bg-slate-50/50"
                            }
                          >
                            {/* Candidate */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <UserIcon
                                    size={14}
                                    className="text-slate-500"
                                  />
                                  <span className="font-medium text-slate-900">
                                    {app.candidateName || "Unnamed candidate"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                                  {app.candidateEmail && (
                                    <span className="flex items-center gap-1">
                                      <Mail size={11} />
                                      {app.candidateEmail}
                                    </span>
                                  )}
                                  {app.candidatePhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone size={11} />
                                      {app.candidatePhone}
                                    </span>
                                  )}
                                  {app.candidateAddress && (
                                    <span className="flex items-center gap-1">
                                      <MapPin size={11} />
                                      {app.candidateAddress}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Job */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-800">
                                  <Briefcase size={13} />
                                  <span className="font-medium">
                                    {app.jobTitle}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  <span>{app.company}</span>
                                  {app.location && (
                                    <>
                                      {" "}
                                      • <span>{app.location}</span>
                                    </>
                                  )}
                                  {app.type && (
                                    <>
                                      {" "}
                                      • <span>{app.type}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Applied on + CV */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col text-[11px] text-slate-600 gap-1">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays size={12} />
                                  <span>
                                    {appliedDate
                                      ? new Date(
                                          appliedDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                </div>
                                {appliedDate && (
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <Clock size={12} />
                                    <span>
                                      {new Date(
                                        appliedDate
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}

                                {app.resumeUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      window.open(
                                        app.resumeUrl,
                                        "_blank",
                                        "noopener,noreferrer"
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 mt-1"
                                  >
                                    <FileText size={12} />
                                    View CV
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 align-top">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
                                  app.status === "submitted"
                                    ? "bg-slate-100 text-slate-700 border border-slate-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}
                              >
                                <BadgeCheck size={12} />
                                {app.status || "submitted"}
                              </span>
                            </td>

                            {/* Actions: Shortlist + Delete */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-2">
                                {/* Shortlist button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    !app.shortlisted && handleShortlist(app)
                                  }
                                  disabled={app.shortlisted || shortlistLoading[app._id]}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                                    app.shortlisted
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default"
                                      : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                                  } disabled:opacity-60`}
                                >
                                  <Star
                                    size={12}
                                    className={
                                      app.shortlisted
                                        ? "text-emerald-600"
                                        : "text-slate-500"
                                    }
                                  />
                                  {app.shortlisted
                                    ? "Shortlisted"
                                    : shortlistLoading[app._id]
                                    ? "Shortlisting..."
                                    : "Shortlist"}
                                </button>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteApplication(app)}
                                  disabled={deleteLoading[app._id]}
                                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60"
                                >
                                  <Trash2 size={12} />
                                  {deleteLoading[app._id]
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Applicants pagination */}
                {appsTotalPages > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Applicants page {currentAppsPage} of {appsTotalPages} •{" "}
                      {filteredApplicants.length} result
                      {filteredApplicants.length !== 1 && "s"}
                      {searchEmail
                        ? ` (filtered by "${searchEmail}")`
                        : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          canAppsPrev &&
                          setAppsPage((p) => Math.max(1, p - 1))
                        }
                        disabled={!canAppsPrev}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          canAppsPrev
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() =>
                          canAppsNext &&
                          setAppsPage((p) =>
                            Math.min(appsTotalPages, p + 1)
                          )
                        }
                        disabled={!canAppsNext}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          canAppsNext
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
        )}
      </div>
    </main>
  );
}
