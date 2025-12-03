"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Mail,
  User,
  Tag,
  BadgeDollarSign,
  Send,
  Hourglass,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function InterviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ---------- ROLE & USER STATE ----------
  const [currentUserDoc, setCurrentUserDoc] = useState(null); // full Mongo user doc
  const [role, setRole] = useState(null);                     // "hr" | "admin" | ...
  const [status, setStatus] = useState(null);                 // "active" | "inactive" | ...
  const [roleLoading, setRoleLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);    // true => hard 404
  const isHrInactive = role === "hr" && status !== "active";  // HR but not active

  // ---------- APPLICATION DATA ----------
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sending state per application: { [applicationId]: boolean }
  const [sending, setSending] = useState({});
  const [message, setMessage] = useState("");

  // Already sent candidates: { applicationId: recordFromInterviewsCandidate }
  const [interviewByApplicationId, setInterviewByApplicationId] = useState({});

  // Set title
  useEffect(() => {
    document.title = "Interviews | Participants - Interview-Mate";
  }, []);

  // ---------- 1) AUTH GUARD: must be logged in ----------
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/authentication/login");
    }
  }, [authLoading, user, router]);

  // ---------- 2) LOAD USER ROLE & STATUS ----------
  // Only "hr" and "admin" are allowed.
  // Others (candidate, company, etc) => unauthorized => 404.
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    let active = true;

    const fetchUserDoc = async () => {
      try {
        setRoleLoading(true);

        const res = await fetch(`/api/users/me?uid=${user.uid}`);
        if (!res.ok) {
          console.error("Failed to load user doc for interviews page.");
          setUnauthorized(true);
          return;
        }

        const data = await res.json();
        if (!active) return;

        setCurrentUserDoc(data);

        const r = data.role || null;
        const s = data.status || "unknown";

        setRole(r);
        setStatus(s);

        if (r !== "hr" && r !== "admin") {
          // ❌ anything that is not hr or admin is blocked
          setUnauthorized(true);
        } else {
          setUnauthorized(false);
        }
      } catch (err) {
        console.error("Error fetching user doc:", err);
        setUnauthorized(true);
      } finally {
        if (active) setRoleLoading(false);
      }
    };

    fetchUserDoc();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  // ---------- 3) LOAD APPLICATIONS & INTERVIEW CANDIDATES ----------
  useEffect(() => {
    const load = async () => {
      if (authLoading || roleLoading) return;
      if (!user) return;
      if (unauthorized) return; // no data for blocked roles

      setLoading(true);
      setMessage("");

      try {
        // 1) fetch all applications
        const appsRes = await fetch("/api/applications");
        const appsData = await appsRes.json();

        // 2) fetch existing interview candidates
        const interviewsRes = await fetch("/api/interviews-candidate");
        let interviewsData = [];
        if (interviewsRes.ok) {
          interviewsData = await interviewsRes.json();
        }

        const map = {};
        if (Array.isArray(interviewsData)) {
          for (const rec of interviewsData) {
            if (rec.applicationId) {
              map[rec.applicationId] = rec;
            }
          }
        }

        setApplications(Array.isArray(appsData) ? appsData : []);
        setInterviewByApplicationId(map);
      } catch (err) {
        console.error("Error loading data:", err);
        setMessage("Failed to load interview data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, roleLoading, unauthorized, user]);

  // ---------- 4) SORT APPLICATIONS ----------
  const sortedApplications = useMemo(() => {
    if (!Array.isArray(applications) || applications.length === 0) {
      return [];
    }

    const parseDate = (dStr) => {
      const d = new Date(dStr);
      return Number.isNaN(d.getTime()) ? new Date(0) : d;
    };

    const priority = [];
    const others = [];

    for (const app of applications) {
      const approved = app.approvalStatus === "Approved";
      const alreadyInInterview = !!interviewByApplicationId[app._id];

      if (approved && !alreadyInInterview) {
        priority.push(app);
      } else {
        others.push(app);
      }
    }

    priority.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    others.sort((a, b) => parseDate(a.date) - parseDate(b.date));

    return [...priority, ...others];
  }, [applications, interviewByApplicationId]);

  // ---------- 5) SEND CANDIDATE HANDLER ----------
  const handleSend = async (app) => {
    if (!user) return;

    // HR must be active; admin can always send
    if (role === "hr" && status !== "active") {
      setMessage(
        "Your HR account is not active yet. You cannot send candidates until activation."
      );
      return;
    }

    setSending((prev) => ({ ...prev, [app._id]: true }));
    setMessage("");

    try {
      const createdByEmail = user.email;
      const createdByName =
        currentUserDoc?.name ||
        user.displayName ||
        (user.email ? user.email.split("@")[0] : "Unknown");

      const payload = {
        applicationId: app._id,
        applicantName: app.name,
        applicantEmail: app.email,
        date: app.date,
        timeSlot: app.timeSlot,
        topic: app.topic,
        paymentStatus: app.paymentStatus,
        approvalStatus: app.approvalStatus,
        createdByEmail,
        createdByName,
      };

      const res = await fetch("/api/interviews-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send candidate.");
      }

      // Mark this application as now in Interviews_Candidate
      setInterviewByApplicationId((prev) => ({
        ...prev,
        [app._id]: { applicationId: app._id, ...payload },
      }));

      setMessage("Candidate sent successfully for interview!");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to send candidate.");
    } finally {
      setSending((prev) => ({ ...prev, [app._id]: false }));
    }
  };

  // ---------- 6) PERMISSION LOADING ----------
  if (authLoading || roleLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-2 text-sm text-slate-600">
          <span className="inline-block h-6 w-6 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
          Checking permissions...
        </div>
      </main>
    );
  }

  // ---------- 7) HARD BLOCK: ONLY HR & ADMIN ----------
  if (unauthorized) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h1 className="text-2xl font-bold mb-2">404 | Page not found</h1>
          <p className="text-sm text-gray-600 mb-4">
            This interview management page is only available for HR and admin
            accounts.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Go back home
          </button>
        </div>
      </main>
    );
  }

  // ---------- 8) MAIN HR / ADMIN PAGE ----------
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Interviews Candidates
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage applicants and send approved candidates to the interview
              list.
            </p>
          </div>
          {user && (
            <div className="text-xs sm:text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1">
              Logged in as{" "}
              <span className="font-semibold text-slate-800">
                {currentUserDoc?.name ||
                  user.displayName ||
                  user.email?.split("@")[0]}
              </span>{" "}
              · Role:{" "}
              <span className="capitalize font-semibold">{role}</span>
            </div>
          )}
        </div>

        {/* HR inactive warning */}
        {isHrInactive && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5" size={18} />
            <div>
              <p className="font-semibold">Waiting for active status</p>
              <p className="mt-1">
                Your HR account status is currently{" "}
                <span className="font-semibold">inactive</span>. You can view
                applicants, but you{" "}
                <span className="font-semibold">
                  cannot send candidates for interview
                </span>{" "}
                until an admin activates your profile.
              </p>
            </div>
          </div>
        )}

        {/* Loading data spinner */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <span className="inline-block h-8 w-8 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
              <span className="text-sm">Loading applicants...</span>
            </div>
          </div>
        )}

        {/* No applicants */}
        {!loading && sortedApplications.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No applicants found yet.
          </div>
        )}

        {/* Table */}
        {!loading && sortedApplications.length > 0 && (
          <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100/70 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Applicant
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Date &amp; Time
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.map((app, index) => {
                  const alreadyInInterview =
                    !!interviewByApplicationId[app._id];

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
                      {/* Applicant */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-500" />
                            <span className="font-medium text-slate-900">
                              {app.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={12} />
                            <span>{app.email}</span>
                          </div>
                        </div>
                      </td>

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
                          <Hourglass size={12} />
                          {app.approvalStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 align-top">
                        {app.approvalStatus === "Approved" ? (
                          alreadyInInterview ? (
                            // Already stored in Interviews_Candidate
                            <button
                              disabled
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-200 cursor-not-allowed"
                            >
                              <Hourglass size={14} />
                              Waiting for Interview
                            </button>
                          ) : isHrInactive ? (
                            // HR inactive, cannot send
                            <button
                              disabled
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-200 cursor-not-allowed"
                            >
                              <AlertTriangle size={14} />
                              Waiting for active status
                            </button>
                          ) : (
                            // HR active or Admin
                            <button
                              onClick={() => handleSend(app)}
                              disabled={!!sending[app._id]}
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                            >
                              <Send size={14} />
                              {sending[app._id] ? "Sending..." : "Send"}
                            </button>
                          )
                        ) : (
                          // Not approved yet
                          <button
                            disabled
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 cursor-not-allowed"
                          >
                            <Hourglass size={14} />
                            Waiting
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Global message */}
        {message && (
          <div className="mt-4 text-sm text-center text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
