"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Mail,
  User,
  Tag,
  BadgeDollarSign,
  ShieldAlert,
  UserCheck,
  Timer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function parseStartDateTime(dateStr, timeSlot) {
  if (!dateStr) return new Date(0);

  try {
    if (!timeSlot) {
      return new Date(dateStr);
    }

    // timeSlot format: "3-4 PM", "9-10 AM", etc.
    const match = timeSlot.match(/^(\d{1,2})-(\d{1,2})\s*(AM|PM)$/i);
    if (!match) {
      return new Date(dateStr);
    }

    let hour = parseInt(match[1], 10); // start hour
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    const hourStr = String(hour).padStart(2, "0");
    // Local time
    return new Date(`${dateStr}T${hourStr}:00:00`);
  } catch {
    return new Date(0);
  }
}

function formatRelativeTime(target) {
  const now = new Date().getTime();
  const t = target.getTime();
  const diffMs = t - now;
  const absMs = Math.abs(diffMs);

  const minutes = Math.round(absMs / (1000 * 60));
  const hours = Math.round(absMs / (1000 * 60 * 60));
  const days = Math.round(absMs / (1000 * 60 * 60 * 24));

  if (absMs < 60 * 60 * 1000) {
    // < 1 hour
    return diffMs >= 0 ? `in ${minutes} min` : `${minutes} min ago`;
  }
  if (absMs < 24 * 60 * 60 * 1000) {
    return diffMs >= 0 ? `in ${hours} hours` : `${hours} hours ago`;
  }
  return diffMs >= 0 ? `in ${days} days` : `${days} days ago`;
}

export default function ApplicantTrackingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (authLoading) return;

      // Must be logged in
      if (!user) {
        router.push("/authentication/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/interviews-candidate");
        if (!res.ok) {
          throw new Error("Failed to load interview candidates.");
        }
        const data = await res.json();

        const all = Array.isArray(data) ? data : [];

        // Filter by createdByEmail = logged-in user email
        const mine = all.filter(
          (item) =>
            item.createdByEmail &&
            item.createdByEmail.toLowerCase() === user.email.toLowerCase()
        );

        setRecords(mine);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, user, router]);

  // Sort: nearest upcoming interviews first, then later upcoming, then expired last
  const sortedRecords = useMemo(() => {
    const now = new Date();

    const upcoming = [];
    const past = [];

    for (const rec of records) {
      const start = parseStartDateTime(rec.date, rec.timeSlot);
      if (start >= now) {
        upcoming.push({ ...rec, startDateTime: start });
      } else {
        past.push({ ...rec, startDateTime: start });
      }
    }

    upcoming.sort((a, b) => a.startDateTime - b.startDateTime); // soonest first
    past.sort((a, b) => b.startDateTime - a.startDateTime); // most recently expired first

    return [...upcoming, ...past];
  }, [records]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Applicant Tracking
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track all candidates you&apos;ve sent for interviews. Upcoming
              interviews appear at the top, expired slots at the bottom.
            </p>
          </div>
          {user && (
            <div className="text-xs sm:text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1 flex items-center gap-2">
              <UserCheck size={14} className="text-emerald-600" />
              <span>
                Logged in as{" "}
                <span className="font-semibold text-slate-800">
                  {user.email}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <span className="inline-block h-8 w-8 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
              <span className="text-sm">Loading candidates...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* No data */}
        {!loading && !error && sortedRecords.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            You have not sent any candidates to interviews yet.
          </div>
        )}

        {/* Table */}
        {!loading && !error && sortedRecords.length > 0 && (
          <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100/70 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Topic
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Approval
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Tracking
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((rec, index) => {
                  const start = parseStartDateTime(rec.date, rec.timeSlot);
                  const now = new Date();
                  const isPast = start < now;
                  const relative = formatRelativeTime(start);

                  return (
                    <motion.tr
                      key={rec._id || rec.applicationId || index}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }
                    >
                      {/* Candidate */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-500" />
                            <span className="font-medium text-slate-900">
                              {rec.applicantName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={12} />
                            <span>{rec.applicantEmail}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Room ID (Calling Room): {rec.applicationId}
                          </p>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-700">
                            <CalendarDays size={12} />
                            <span>{rec.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={12} />
                            <span>{rec.timeSlot}</span>
                          </div>
                        </div>
                      </td>

                      {/* Topic */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <Tag size={12} />
                          <span>{rec.topic}</span>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            rec.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          <BadgeDollarSign size={12} />
                          {rec.paymentStatus}
                        </span>
                      </td>

                      {/* Approval Status */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            rec.approvalStatus === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          <ShieldAlert size={12} />
                          {rec.approvalStatus}
                        </span>
                      </td>

                      {/* Tracking (time status) */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            isPast
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          <Timer size={12} />
                          {isPast ? "Expired" : "Upcoming"}
                        </span>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {relative}
                        </p>
                      </td>

                      {/* Created By */}
                      <td className="px-4 py-3 align-top text-xs text-slate-600">
                        <p className="font-medium text-slate-800">
                          {rec.createdByName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {rec.createdByEmail}
                        </p>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 align-top text-xs text-slate-500">
                        {rec.createdAt
                          ? new Date(rec.createdAt).toLocaleString()
                          : "-"}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
