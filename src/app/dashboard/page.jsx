// src/app/dashboard/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "../components/RequireAuth";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  Briefcase,
  Users,
  Building2,
  CalendarDays,
  MapPin,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [dbUser, setDbUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Company stats
  const [companyStatsLoading, setCompanyStatsLoading] = useState(false);
  const [companyStatsError, setCompanyStatsError] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [latestJobs, setLatestJobs] = useState([]);
  const [applicationsPerJob, setApplicationsPerJob] = useState({});

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  // 1) Load Mongo user profile (role, companyProfile, etc.)
  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return;

      if (!user) {
        setDbUser(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError("");

      try {
        // Secure: /api/users/me expects Firebase ID token in Authorization header
        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load user profile.");
        }

        const data = await res.json();
        setDbUser(data);
      } catch (err) {
        console.error("Dashboard profile load error:", err);
        setProfileError(err.message || "Failed to load profile.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, user]);

  const role = dbUser?.role;
  const companyName = dbUser?.companyProfile?.companyName || null;

  // 2) For company role → load job stats using company candidate-applications API
  useEffect(() => {
    const loadCompanyStats = async () => {
      if (!user || !dbUser || role !== "company") return;

      setCompanyStatsLoading(true);
      setCompanyStatsError("");

      try {
        const token = await user.getIdToken();
        const companyEmail = dbUser.email || user.email;

        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "5"); // only need a few latest jobs for dashboard
        if (companyEmail) {
          params.set("email", companyEmail);
        }

        const res = await fetch(
          `/api/company/candidate-applications?${params.toString()}`,
          {
            // Works for both:
            //  - secure version (uses Authorization + decoded uid)
            //  - simpler version (uses ?email=)
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.message || "Failed to load company job stats."
          );
        }

        const data = await res.json();

        setTotalJobs(data.totalJobs || (data.jobs?.length ?? 0));
        setTotalApplications(data.totalApplications || 0);
        setLatestJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setApplicationsPerJob(data.applicationsPerJob || {});
      } catch (err) {
        console.error("Dashboard company stats error:", err);
        setCompanyStatsError(err.message || "Failed to load company stats.");
      } finally {
        setCompanyStatsLoading(false);
      }
    };

    if (!authLoading && !profileLoading && role === "company") {
      loadCompanyStats();
    }
  }, [authLoading, profileLoading, role, user, dbUser]);

  const latestJobsSafe = useMemo(
    () => (Array.isArray(latestJobs) ? latestJobs : []),
    [latestJobs]
  );

  // While auth/profile loading → show spinner
  if (authLoading || profileLoading) {
    return (
      <RequireAuth>
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" label="Loading dashboard..." />
          </div>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome,{" "}
            <span className="font-semibold text-gray-800">
              {user?.email}
            </span>
            {dbUser?.role && (
              <>
                {" "}
                · Role:{" "}
                <span className="capitalize">{dbUser.role}</span>
              </>
            )}
          </p>

          {profileError && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {profileError}
            </p>
          )}

          {role === "company" && (
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <Building2 size={14} className="text-gray-400" />
              Company:{" "}
              <span className="font-medium text-gray-800">
                {companyName || "Not set yet"}
              </span>
            </p>
          )}
        </section>

        {/* ===== COMPANY DASHBOARD SUMMARY ===== */}
        {role === "company" && (
          <section className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Company Overview
            </h2>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white border border-gray-200 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Briefcase size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    Jobs posted by your company
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {companyStatsLoading ? "…" : totalJobs}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white border border-gray-200 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Users size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    Total applications received
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {companyStatsLoading ? "…" : totalApplications}
                  </p>
                </div>
              </div>
            </div>

            {companyStatsError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {companyStatsError}
              </p>
            )}

            {/* Latest jobs table */}
            {!companyStatsLoading && latestJobsSafe.length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Latest jobs you posted
                </h3>
                <div className="overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Job
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Sector & Location
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Posted
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Applicants
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestJobsSafe.map((job, index) => {
                        const appsCount =
                          applicationsPerJob[job._id] ?? 0;
                        return (
                          <tr
                            key={job._id}
                            className={
                              index % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50/60"
                            }
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-gray-900">
                                  {job.title}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {job.company}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-[11px] text-gray-700">
                              <div className="flex flex-col gap-0.5">
                                {job.sector && (
                                  <span className="inline-flex items-center gap-1">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    {job.sector}
                                  </span>
                                )}
                                {job.location && (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin size={11} />
                                    {job.location}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-[11px] text-gray-600">
                              {job.postedDate ? (
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays size={11} />
                                  <span>
                                    {new Date(
                                      job.postedDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3 align-top text-[11px] text-gray-700">
                              <span className="inline-flex items-center rounded-full px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100">
                                <Users size={11} className="mr-1" />
                                {appsCount}{" "}
                                {appsCount === 1
                                  ? "Applicant"
                                  : "Applicants"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!companyStatsLoading && latestJobsSafe.length === 0 && (
              <p className="text-xs text-gray-500 bg-white border border-dashed border-gray-200 rounded-lg px-3 py-3">
                You haven&apos;t posted any jobs yet. Once you post jobs, this
                section will show how many you have posted and their
                applications.
              </p>
            )}
          </section>
        )}

        {/* ===== SIMPLE DASHBOARD FOR OTHER ROLES ===== */}
        {role !== "company" && (
          <section className="rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-sm text-gray-700">
              This is your personal dashboard. In future, you can show candidate
              / HR specific analytics here (e.g. applications, interviews,
              approvals).
            </p>
          </section>
        )}
      </main>
    </RequireAuth>
  );
}
