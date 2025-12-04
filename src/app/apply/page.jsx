"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Mail,
  User,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// All allowed time slots
const TIME_OPTIONS = [
  "9-10 AM",
  "11-12 AM",
  "2-3 PM",
  "3-4 PM",
  "9-10 PM",
  "10-11 PM",
];

// Topic dropdown options
const TOPIC_OPTIONS = [
  "IT Sector",
  "Educational",
  "Management",
  "Commercial",
  "Other",
];

/**
 * ApplyPage
 * - Students / candidates / admin can access.
 * - HR and Company users are blocked (404-style page).
 * - Stores application with default:
 *    paymentStatus: "unpaid"
 *    approvalStatus: "Not approved"
 */
export default function ApplyPage() {
  const router = useRouter();

  // ---------- AUTH & ROLE ----------
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [blocked, setBlocked] = useState(false); // true => show 404-style

  // default date = today (YYYY-MM-DD)
  const today = new Date();
  const defaultDate = today.toISOString().split("T")[0];

  // ---------- FORM STATE ----------
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [timeSlot, setTimeSlot] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // Set page title once
  useEffect(() => {
    document.title = "Interviews | Application - Interview-Mate";
  }, []);

  /**
   * Fetch the Mongo user (role) from /api/users/me.
   * Block HR & Company from this page.
   * Allow: admin, candidate (students), guests (no role).
   */
  useEffect(() => {
    if (authLoading) return;

    // Not logged in → no role restriction for Apply page
    if (!user) {
      setRole(null);
      setBlocked(false);
      setRoleLoading(false);
      return;
    }

    let active = true;

    const fetchRole = async () => {
      try {
        setRoleLoading(true);
        const idToken = await user.getIdToken(); // from Firebase client SDK

const res = await fetch("/api/users/me", {
  method: "GET", // or PATCH
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,   // 👈 important
  },
  // body: JSON.stringify(...profile data...)   // for PATCH only
});

        if (!res.ok) {
          console.error("Failed to load user role for apply page.");
          return;
        }
        const data = await res.json();
        if (!active) return;

        const r = data.role || null;
        setRole(r);

        // ❌ Block HR and Company
        if (r === "hr" || r === "company") {
          setBlocked(true);
        } else {
          // ✅ admin, candidate/student, other roles
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

  /**
   * Submit application:
   * - Validates required fields
   * - Sends POST /api/applications
   * - Backend should set:
   *     paymentStatus: "unpaid"
   *     approvalStatus: "Not approved"
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!timeSlot || !topic) {
      setError("Please select both a time slot and a topic.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          date,
          timeSlot,
          topic,
          // You can also send current user email if logged in:
          // userEmail: user?.email || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to submit application.");
      }

      setSuccessMsg("Your application has been submitted successfully!");
      setName("");
      setEmail("");
      setTimeSlot("");
      setTopic("");
      setDate(defaultDate);

      // Optionally redirect after a short delay:
      // setTimeout(() => router.push("/applicants-details"), 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- LOADING AUTH/ROLE ----------
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

  // ---------- BLOCKED: HR / COMPANY ⇒ 404 STYLE ----------
  if (blocked) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h1 className="text-2xl font-bold mb-2">404 | Page not found</h1>
          <p className="text-sm text-gray-600 mb-4">
            This application page is not available for your account role.
            <br />
            Only students/candidates (and admin) can book interview slots.
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

  // ---------- MAIN APPLY FORM (ALLOWED ROLES) ----------
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <motion.div
        className="w-full max-w-3xl bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Apply for an Interview Slot
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Fill in your details and choose a preferred date &amp; time. Payment
              status will start as{" "}
              <span className="font-semibold">unpaid</span> and approval as{" "}
              <span className="font-semibold">Not approved</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            <CheckCircle2 size={16} />
            Secure &amp; hassle-free booking
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 gap-1">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 gap-1">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 gap-1">
                <CalendarDays size={14} /> Preferred Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 gap-1">
                <Clock size={14} /> Preferred Time Slot
              </label>
              <select
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a time slot</option>
                {TIME_OPTIONS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 gap-1">
              <Tag size={14} /> Topic Category
            </label>
            <select
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a topic</option>
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status info (read-only) */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-700">Payment status</p>
              <p className="mt-1 text-slate-600">
                Default:{" "}
                <span className="font-semibold text-amber-600">unpaid</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-700">Approval status</p>
              <p className="mt-1 text-slate-600">
                Default:{" "}
                <span className="font-semibold text-rose-600">
                  Not approved
                </span>
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {successMsg}
            </p>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit Application</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
