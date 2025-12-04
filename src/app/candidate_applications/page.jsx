// src/app/shortList_candidate/page.jsx
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
  FileText,
  BadgeCheck,
} from "lucide-react";

const PAGE_SIZE = 10;

export default function ShortListedCandidatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // All shortlisted records from cv_shortListed_database
  const [shortlisted, setShortlisted] = useState([]);
  const [totalShortlisted, setTotalShortlisted] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");

  // pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Shortlisted Candidates | InterviewMate";
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

  // 4) Load shortlisted candidates for this company (from cv_shortListed_database)
  useEffect(() => {
    const loadShortlist = async () => {
      if (!user || !dbUser || role !== "company") return;

      setLoading(true);
      setError("");

      try {
        const email = dbUser.email || user.email;

        const params = new URLSearchParams();
        params.set("email", email);

        const res = await fetch(`/api/company/shortlist?${params.toString()}`);

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.message || "Failed to load shortlisted candidates."
          );
        }

        const data = await res.json();
        setShortlisted(data.shortlisted || []);
        setTotalShortlisted(data.totalShortlisted || 0);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load shortlisted candidates.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !roleLoading && role === "company") {
      loadShortlist();
    }
  }, [authLoading, roleLoading, role, user, dbUser]);

  // --- Distinct job sectors from shortlist (for filter) ---
  const sectors = useMemo(() => {
    const s = new Set();
    for (const rec of shortlisted) {
      if (rec.jobSector) s.add(rec.jobSector);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [shortlisted]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchEmail, selectedSector]);

  // --- Filter & sort shortlisted list ---
  const filteredShortlisted = useMemo(() => {
    let base = shortlisted;

    // filter by companyEmail is already done on backend
    // now filter by selected sector
    if (selectedSector !== "all") {
      base = base.filter((rec) => rec.jobSector === selectedSector);
    }

    // filter by candidate email
    if (searchEmail.trim()) {
      const term = searchEmail.trim().toLowerCase();
      base = base.filter((rec) =>
        rec.candidateEmail?.toLowerCase().includes(term)
      );
    }

    // sort:
    // 1) jobSector (A–Z)
    // 2) jobTitle (A–Z)
    // 3) appliedAt / createdAt (newest first)
    return [...base].sort((a, b) => {
      const sA = (a.jobSector || "").localeCompare(a.jobSector || "");
      const sB = (b.jobSector || "").localeCompare(b.jobSector || "");

      const sectorCompare = (a.jobSector || "").localeCompare(
        b.jobSector || ""
      );
      if (sectorCompare !== 0) return sectorCompare;

      const tCompare = (a.jobTitle || "").localeCompare(b.jobTitle || "");
      if (tCompare !== 0) return tCompare;

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
      return dB - dA;
    });
  }, [shortlisted, searchEmail, selectedSector]);

  const totalPages =
    filteredShortlisted.length === 0
      ? 1
      : Math.max(1, Math.ceil(filteredShortlisted.length / PAGE_SIZE));

  const currentPage = page > totalPages ? totalPages : page;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredShortlisted.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

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
              Shortlisted Candidates
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              These candidates are collected from{" "}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px]">
                cv_shortListed_database
              </code>{" "}
              for your company. Filter them by job sector and candidate email.
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
            see shortlisted candidates, but other actions may be limited until
            verification is complete.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total shortlisted</p>
              <p className="text-xl font-semibold text-slate-900">
                {totalShortlisted}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">
                Job sectors with shortlist
              </p>
              <p className="text-xl font-semibold text-slate-900">
                {sectors.length}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Clock size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Candidates per page</p>
              <p className="text-xl font-semibold text-slate-900">
                {PAGE_SIZE}
              </p>
              <p className="text-[11px] text-slate-400">
                Page {currentPage} of {totalPages}
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

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner
              size="lg"
              label="Loading shortlisted candidates..."
            />
          </div>
        )}

        {/* Shortlisted list */}
        {!loading && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Shortlisted candidates (job sector wise)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Filter by job sector or candidate email. Data is first
                  filtered by your company email, then sorted by{" "}
                  <strong>jobSector</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Sector filter */}
                <div className="w-full sm:w-52">
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-full px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All sectors</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
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

            {filteredShortlisted.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                No shortlisted candidates found for this selection yet.
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
                          Job (Sector wise)
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Timeline
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Status / CV
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((rec, index) => {
                        const appliedDate = rec.appliedAt || rec.applicationCreatedAt;
                        const shortlistedDate = rec.createdAt;

                        return (
                          <motion.tr
                            key={rec._id}
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
                                    {rec.candidateName || "Unnamed candidate"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                                  {rec.candidateEmail && (
                                    <span className="flex items-center gap-1">
                                      <Mail size={11} />
                                      {rec.candidateEmail}
                                    </span>
                                  )}
                                  {rec.candidatePhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone size={11} />
                                      {rec.candidatePhone}
                                    </span>
                                  )}
                                  {rec.candidateAddress && (
                                    <span className="flex items-center gap-1">
                                      <MapPin size={11} />
                                      {rec.candidateAddress}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Job (with sector) */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-800">
                                  <Briefcase size={13} />
                                  <span className="font-medium">
                                    {rec.jobTitle || "Untitled job"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  <span>{rec.jobCompany}</span>
                                  {rec.jobSector && (
                                    <>
                                      {" "}
                                      •{" "}
                                      <span className="font-medium">
                                        {rec.jobSector}
                                      </span>
                                    </>
                                  )}
                                  {rec.jobLocation && (
                                    <>
                                      {" "}
                                      • <span>{rec.jobLocation}</span>
                                    </>
                                  )}
                                  {rec.jobType && (
                                    <>
                                      {" "}
                                      • <span>{rec.jobType}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Timeline */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col text-[11px] text-slate-600 gap-1">
                                {appliedDate && (
                                  <div className="flex items-center gap-1.5">
                                    <CalendarDays size={12} />
                                    <span>
                                      Applied:{" "}
                                      {new Date(
                                        appliedDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                {shortlistedDate && (
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <Clock size={12} />
                                    <span>
                                      Shortlisted:{" "}
                                      {new Date(
                                        shortlistedDate
                                      ).toLocaleDateString()}{" "}
                                      •{" "}
                                      {new Date(
                                        shortlistedDate
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status + CV */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <BadgeCheck size={12} />
                                  Shortlisted
                                </span>

                                {rec.resumeUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      window.open(
                                        rec.resumeUrl,
                                        "_blank",
                                        "noopener,noreferrer"
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                                  >
                                    <FileText size={12} />
                                    View CV
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Page {currentPage} of {totalPages} •{" "}
                      {filteredShortlisted.length} result
                      {filteredShortlisted.length !== 1 && "s"}
                      {searchEmail
                        ? ` (filtered by "${searchEmail}")`
                        : ""}
                      {selectedSector !== "all"
                        ? ` • Sector: ${selectedSector}`
                        : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          canPrev && setPage((p) => Math.max(1, p - 1))
                        }
                        disabled={!canPrev}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          canPrev
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() =>
                          canNext &&
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={!canNext}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          canNext
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
