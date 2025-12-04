// src/app/shortList_candidate/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

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
} from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

const PAGE_SIZE = 10;

export default function ShortListCandidatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [shortlisted, setShortlisted] = useState([]);
  const [totalShortlisted, setTotalShortlisted] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchEmail, setSearchEmail] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");

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

  // 4) Load shortlisted candidates for this company
  useEffect(() => {
    const loadShortlist = async () => {
      if (!user || !dbUser || role !== "company") return;

      setLoading(true);
      setError("");

      try {
        const email = dbUser.email || user.email;

        const params = new URLSearchParams();
        params.set("email", email);
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));

        const res = await fetch(
          `/api/company/shortlist?${params.toString()}`
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.message || "Failed to load shortlisted candidates."
          );
        }

        const data = await res.json();
        setShortlisted(data.shortlisted || []);
        setTotalShortlisted(data.totalShortlisted || 0);
        setTotalPages(data.totalPages || 1);
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
  }, [authLoading, roleLoading, role, user, dbUser, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  // --- Sector options from current page data ---
  const sectorOptions = useMemo(() => {
    const set = new Set();
    shortlisted.forEach((s) => {
      if (s.jobSector) set.add(s.jobSector);
    });
    return ["all", ...Array.from(set).sort()];
  }, [shortlisted]);

  // Reset filters page when email/sector changes
  useEffect(() => {
    // we keep server page but you can also reset to page 1 if you want
    // setPage(1);
  }, [searchEmail, selectedSector]);

  const filteredShortlisted = useMemo(() => {
    let base = shortlisted;

    if (selectedSector !== "all") {
      base = base.filter((s) => s.jobSector === selectedSector);
    }

    if (searchEmail.trim()) {
      const term = searchEmail.trim().toLowerCase();
      base = base.filter(
        (s) =>
          s.candidateEmail?.toLowerCase().includes(term) ||
          s.candidateName?.toLowerCase().includes(term)
      );
    }

    return base;
  }, [shortlisted, selectedSector, searchEmail]);

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
              These are the candidates you have shortlisted from your job
              applications. Filter by job sector or search by email to find
              profiles quickly.
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
            see shortlisted candidates, but some actions may be limited until
            verification is complete.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Shortlisted candidates</p>
              <p className="text-xl font-semibold text-slate-900">
                {totalShortlisted}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Briefcase size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Sectors (current page)</p>
              <p className="text-xl font-semibold text-slate-900">
                {sectorOptions.length - 1}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Clock size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Page</p>
              <p className="text-xl font-semibold text-slate-900">
                {page} / {totalPages}
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

        {/* List */}
        {!loading && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Shortlisted list (sorted by job sector)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Filter by sector and search by candidate email or name.
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
                    {sectorOptions
                      .filter((sec) => sec !== "all")
                      .map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
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
                      placeholder="Search by email or name"
                      className="w-full pl-8 pr-3 py-2 rounded-full border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredShortlisted.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                No shortlisted candidates found for this selection.
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
                          Sector & Dates
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          CV
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShortlisted.map((item, index) => {
                        const applied = item.appliedAt || item.createdAt;
                        const shortlistedAt = item.shortlistedAt;

                        return (
                          <motion.tr
                            key={item._id}
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
                                    {item.candidateName || "Unnamed candidate"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                                  {item.candidateEmail && (
                                    <span className="flex items-center gap-1">
                                      <Mail size={11} />
                                      {item.candidateEmail}
                                    </span>
                                  )}
                                  {item.candidatePhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone size={11} />
                                      {item.candidatePhone}
                                    </span>
                                  )}
                                  {item.candidateAddress && (
                                    <span className="flex items-center gap-1">
                                      <MapPin size={11} />
                                      {item.candidateAddress}
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
                                    {item.jobTitle}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  <span>{item.companyName || item.company}</span>
                                  {item.jobLocation && (
                                    <>
                                      {" "}
                                      • <span>{item.jobLocation}</span>
                                    </>
                                  )}
                                  {item.jobType && (
                                    <>
                                      {" "}
                                      • <span>{item.jobType}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Sector & Dates */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                                {item.jobSector && (
                                  <div className="flex items-center gap-1.5">
                                    <Briefcase size={12} />
                                    <span>{item.jobSector}</span>
                                  </div>
                                )}

                                {applied && (
                                  <div className="flex items-center gap-1.5">
                                    <CalendarDays size={12} />
                                    <span>
                                      Applied:{" "}
                                      {new Date(
                                        applied
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}

                                {shortlistedAt && (
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <Clock size={12} />
                                    <span>
                                      Shortlisted:{" "}
                                      {new Date(
                                        shortlistedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* CV */}
                            <td className="px-4 py-3 align-top">
                              {item.resumeUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.open(
                                      item.resumeUrl,
                                      "_blank",
                                      "noopener,noreferrer"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                                >
                                  <FileText size={12} />
                                  View CV
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  No CV provided
                                </span>
                              )}
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
                      Page {page} of {totalPages} • {totalShortlisted} total
                      shortlisted
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => canPrev && setPage((p) => p - 1)}
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
                        onClick={() => canNext && setPage((p) => p + 1)}
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
