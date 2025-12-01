"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Tag,
  BadgeDollarSign,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const res = await fetch(
          `/api/applications?email=${encodeURIComponent(user.email)}`
        );
        if (!res.ok) {
          throw new Error("Failed to load applications.");
        }

        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              My Applications
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track the status of all your interview applications.
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
        </div>

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

        {/* No data */}
        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            You haven&apos;t submitted any applications yet.
          </div>
        )}

        {/* Table */}
        {!loading && !error && applications.length > 0 && (
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
                {applications.map((app, index) => (
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
      </div>
    </main>
  );
}
