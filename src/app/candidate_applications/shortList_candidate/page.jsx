"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";


import {
  Building2,
  Briefcase,
  CalendarDays,
  Clock,
  MapPin,
  Mail,
  Phone,
  User as UserIcon,
  BadgeCheck,
  FileText,
  Search,
} from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";

const PAGE_SIZE = 10;

export default function ShortListCandidatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    document.title = "Shortlisted Candidates | InterviewMate";
  }, []);

  // 1) Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication/login");
    }
  }, [authLoading, user, router]);

  // 2) Load DB user (role/status)
  useEffect(() => {
    const loadUserDoc = async () => {
      if (authLoading || !user) return;

      try {
        setRoleLoading(true);
        setError("");

        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
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

  // 3) Non-company users -> 404
  useEffect(() => {
    if (!authLoading && !roleLoading && user && dbUser) {
      if (role !== "company") {
        router.replace("/404");
      }
    }
  }, [authLoading, roleLoading, user, dbUser, role, router]);

  // 4) Load shortlisted candidates
  useEffect(() => {
    const loadData = async () => {
      if (!user || !dbUser || role !== "company") return;

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));
        params.set("companyEmail", user.email);

        const res = await fetch(
          `/api/company/shortlist-candidates?${params.toString()}`
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.message || "Failed to load shortlisted candidates."
          );
        }

        const data = await res.json();
        setCandidates(data.candidates || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load shortlisted candidates.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !roleLoading && role === "company") {
      loadData();
    }
  }, [authLoading, roleLoading, role, user, dbUser, page]);

  // Filter by email (client-side)
  const filteredCandidates = useMemo(() => {
    if (!searchEmail.trim()) return candidates;
    const term = searchEmail.trim().toLowerCase();
    return candidates.filter((c) =>
      c.candidateEmail?.toLowerCase().includes(term)
    );
  }, [candidates, searchEmail]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  // While user/role loading
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Shortlisted Candidates
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              View all candidates shortlisted by your company. Quickly find
              strong profiles using search and filters.
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

        {/* Search + list */}
        {!loading && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Total shortlisted:{" "}
                  <span className="font-semibold text-slate-900">
                    {total}
                  </span>
                </p>
              </div>
              <div className="w-full sm:w-72">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Search shortlisted by email"
                    className="w-full pl-8 pr-3 py-2 rounded-full border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                No shortlisted candidates found yet.
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
                          Shortlisted On
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((c, index) => {
                        const shortlistedTime =
                          c.createdAt || c.appliedAt || null;

                        return (
                          <tr
                            key={c._id}
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
                                    {c.candidateName || "Unnamed candidate"}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <BadgeCheck size={10} />
                                    Shortlisted
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                                  {c.candidateEmail && (
                                    <span className="flex items-center gap-1">
                                      <Mail size={11} />
                                      {c.candidateEmail}
                                    </span>
                                  )}
                                  {c.candidatePhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone size={11} />
                                      {c.candidatePhone}
                                    </span>
                                  )}
                                  {c.candidateAddress && (
                                    <span className="flex items-center gap-1">
                                      <MapPin size={11} />
                                      {c.candidateAddress}
                                    </span>
                                  )}
                                </div>

                                {c.resumeUrl && (
                                  <a
                                    href={c.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-0.5"
                                  >
                                    <FileText size={11} />
                                    <span>View CV / Resume</span>
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Job */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-800">
                                  <Briefcase size={13} />
                                  <span className="font-medium">
                                    {c.jobTitle}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  <span>{c.company}</span>
                                  {c.location && (
                                    <>
                                      {" "}
                                      • <span>{c.location}</span>
                                    </>
                                  )}
                                  {c.type && (
                                    <>
                                      {" "}
                                      • <span>{c.type}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Shortlisted on */}
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col text-[11px] text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays size={12} />
                                  <span>
                                    {shortlistedTime
                                      ? new Date(
                                          shortlistedTime
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                </div>
                                {shortlistedTime && (
                                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                                    <Clock size={12} />
                                    <span>
                                      Time:{" "}
                                      {new Date(
                                        shortlistedTime
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 align-top">
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <BadgeCheck size={12} />
                                {c.status || "shortlisted"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Page {page} of {totalPages} • {total} shortlisted
                      {total !== 1 && " candidates"}
                      {searchEmail
                        ? ` (filtered by "${searchEmail}")`
                        : ""}
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
