"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";

// How many jobs per page to request from the backend
const PAGE_SIZE = 30;

export default function JobsPage() {
  // =========================================================
  // AUTH & ROLE STATE
  // =========================================================
  // Firebase auth user (from AuthContext)
  const { user, loading: authLoading } = useAuth();

  // The user document stored in MongoDB (/api/users/me)
  const [dbUser, setDbUser] = useState(null);

  // Role comes from MongoDB user doc: "candidate" | "hr" | "company" | "admin" | null
  const [role, setRole] = useState(null);

  // While we are fetching the DB user / role, this stays true
  const [roleLoading, setRoleLoading] = useState(true);

  // If true, this page is blocked for this role (we show a 404-style screen)
  const [blocked, setBlocked] = useState(false);

  // =========================================================
  // JOB LIST STATE
  // =========================================================
  const [jobs, setJobs] = useState([]);           // list of job objects
  const [loading, setLoading] = useState(true);   // jobs loading spinner flag
  const [selectedSector, setSelectedSector] = useState("all"); // sector filter
  const [page, setPage] = useState(1);            // current pagination page
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);          // total number of jobs in DB

  // Set browser tab title once on mount
  useEffect(() => {
    document.title = "JobListings | InterviewMate";
  }, []);

  // =========================================================
  // LOAD USER ROLE & STATUS FROM DB (MongoDB)
  // =========================================================
  // We call /api/users/me?uid=<firebase uid> and use:
  //   - data.role   (candidate / hr / company / admin)
  //   - data.status (active / inactive)
  useEffect(() => {
    if (authLoading) return; // wait until Firebase auth finishes

    // Guest user → no role restriction, can see jobs
    if (!user) {
      setDbUser(null);
      setRole(null);
      setBlocked(false);
      setRoleLoading(false);
      return;
    }

    let active = true;

    const fetchRole = async () => {
      try {
        setRoleLoading(true);
        const res = await fetch(`/api/users/me?uid=${user.uid}`);
        if (!res.ok) {
          console.error("Failed to load user role for jobs page.");
          return;
        }
        const data = await res.json();
        if (!active) return;

        setDbUser(data);
        const r = data.role || null;
        setRole(r);

        // ❌ HR cannot see jobs page
        // ✅ Company, candidate, admin etc. can
        if (r === "hr") {
          setBlocked(true);
        } else {
          setBlocked(false);
        }
      } catch (err) {
        console.error("Error loading role:", err);
      } finally {
        if (active) setRoleLoading(false);
      }
    };

    fetchRole();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // Derived flags for company users
  const isCompany = role === "company";
  const isCompanyActive = isCompany && dbUser?.status === "active";

  // =========================================================
  // FETCH JOBS FROM API (ONLY IF NOT BLOCKED)
  // =========================================================
  useEffect(() => {
    // Wait until auth + role are decided
    if (authLoading || roleLoading) return;

    // HR blocked completely → do not load jobs
    if (blocked) {
      setJobs([]);
      setLoading(false);
      return;
    }

    async function fetchJobs() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));
        if (selectedSector !== "all") {
          params.set("sector", selectedSector);
        }

        const res = await fetch(`/api/jobs?${params.toString()}`);
        const data = await res.json();

        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Failed to load jobs:", err);
        setJobs([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [selectedSector, page, authLoading, roleLoading, blocked]);

  // =========================================================
  // SECTORS (FILTER DROPDOWN)
  // =========================================================
  // Build a unique list of all sectors from current page's jobs
  const sectors = useMemo(() => {
    const s = new Set(jobs.map((job) => job.sector).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [jobs]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function handleSectorChange(e) {
    setSelectedSector(e.target.value);
    setPage(1);
  }

  // =========================================================
  // LOADING STATE: AUTH OR ROLE
  // =========================================================
  if (authLoading || roleLoading) {
    // While we don't know the role yet, we show only a spinner,
    // so restricted content does not flash.
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" label="Loading jobs..." />
        </div>
      </main>
    );
  }

  // =========================================================
  // ROLE BLOCK: HR → 404 STYLE
  // =========================================================
  // HR users are not allowed to see the jobs list at all.
  if (blocked) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">404 | Page not found</h1>
          <p className="text-sm text-gray-600 mb-4">
            This page is not available for your account role.
            <br />
            If you think this is a mistake, please contact the site admin.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Go back home
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // NORMAL JOBS PAGE (Candidate / Company / Guest / Admin)
  // =========================================================
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header + sector filter + Post Job button (for company) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Latest Jobs</h1>
          <p className="text-gray-600 text-sm">
            Showing page {page} of {totalPages} ({total} jobs)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Sector filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sector:</label>
            <select
              value={selectedSector}
              onChange={handleSectorChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector === "all" ? "All sectors" : sector}
                </option>
              ))}
            </select>
          </div>

          {/* Company-only: "Post a Job" button.
              If company.status !== "active", button is disabled and shows alert. */}
          {isCompany && (
            <div className="flex justify-end">
              {isCompanyActive ? (
                <Link
                  href="/jobs/post"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 shadow-sm"
                >
                  Post a Job
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Your company profile is not active yet. Please wait for admin approval before posting jobs."
                    )
                  }
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gray-300 text-gray-700 text-sm font-semibold cursor-not-allowed"
                >
                  Post a Job (inactive account)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spinner while loading jobs */}
      {loading && (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" label="Loading jobs..." />
        </div>
      )}

      {/* No jobs case */}
      {!loading && jobs.length === 0 && (
        <p className="text-gray-500">No jobs found for this sector.</p>
      )}

      {/* =====================================================
          JOB CARDS GRID
          Each card now also shows Vacancy (jobVacancy)
         ===================================================== */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {jobs.map((job) => {
          const {
            _id,
            id,
            title,
            company,
            companyLogo,
            logoUrl,
            sector,
            type,
            location,
            salary,
            postedDate,
            jobVacancy,   // 👈 NEW FIELD from DB
          } = job;

          const jobIdForUrl = id || _id;
          const logo = logoUrl || companyLogo || null;

          return (
            <Link
              key={_id}
              href={`/jobs/${jobIdForUrl}`}
              className="group border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              {/* Company logo + title */}
              <div className="flex items-center gap-3 px-4 pt-4">
                {logo ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={logo}
                      alt={company || "Company logo"}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 flex-shrink-0">
                    {(company || "?").charAt(0)}
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {sector || "General"}
                  </p>
                  <h2 className="text-base font-semibold leading-snug">
                    {title}
                  </h2>
                  <p className="text-xs text-gray-600">{company}</p>
                </div>
              </div>

              {/* Small meta chips: location, type, vacancy */}
              <div className="px-4 mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                {location && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">
                    📍 {location}
                  </span>
                )}
                {type && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">
                    💼 {type}
                  </span>
                )}
                {jobVacancy !== undefined &&
                  jobVacancy !== null &&
                  jobVacancy !== "" && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">
                      👥 Vacancy: {jobVacancy}
                    </span>
                  )}
              </div>

              {/* Bottom row: salary + posted date */}
              <div className="px-4 py-3 mt-auto flex items-center justify-between text-xs text-gray-600 border-t border-gray-100">
                {salary && (
                  <span>
                    {salary.min} - {salary.max} {salary.currency}
                  </span>
                )}
                {postedDate && (
                  <span className="text-gray-400">
                    {new Date(postedDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="px-4 pb-3 text-xs text-indigo-600 font-medium group-hover:underline">
                View details →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                canPrev
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                canNext
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
