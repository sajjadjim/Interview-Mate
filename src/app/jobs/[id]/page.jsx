"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function JobDetailsPage({ params }) {
  const { id } = params;

  // Job state
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth / user state
  const { user, loading: authLoading } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Apply state
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [hasApplied, setHasApplied] = useState(false);

  const router = useRouter();

  // --------- Load job details ----------
  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) {
          setJob(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setJob(data);

        // optional: update page title
        if (data?.title) {
          document.title = `${data.title} | InterviewMate`;
        }
      } catch (err) {
        console.error("Failed to load job:", err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  // --------- Load Mongo user (role, profile, phone, etc.) ----------
  useEffect(() => {
    if (!user) {
      setDbUser(null);
      setRole(null);
      setRoleLoading(false);
      return;
    }

    let active = true;

    const fetchDbUser = async () => {
      try {
        setRoleLoading(true);
        const res = await fetch(`/api/users/me?uid=${user.uid}`);
        if (!res.ok) {
          console.error("Failed to load DB user for job details.");
          return;
        }
        const data = await res.json();
        if (!active) return;
        setDbUser(data);
        setRole(data?.role || null);
      } catch (err) {
        console.error("Error loading DB user:", err);
      } finally {
        if (active) setRoleLoading(false);
      }
    };

    fetchDbUser();

    return () => {
      active = false;
    };
  }, [user]);

  // --------- Derived helpers ----------
  const canApply = !!user && role === "candidate"; // only logged-in candidates

  // --------- Handle apply ----------
  const handleApply = async () => {
    setApplyMessage("");

    // If not logged in, send them to login
    if (!user) {
      router.push("/authentication/login");
      return;
    }

    // Safety check: only candidate role can apply
    if (role && role !== "candidate") {
      setApplyMessage("Only candidate accounts can apply for jobs.");
      return;
    }

    if (!job) return;

    setApplyLoading(true);

    try {
      const candidateProfile = dbUser?.candidateProfile || {};

      // Build a nice full name
      const fullNameFromProfile =
        (candidateProfile.firstName || "") +
        (candidateProfile.lastName ? ` ${candidateProfile.lastName}` : "");

      const candidateName =
        fullNameFromProfile.trim() ||
        dbUser?.name ||
        user.displayName ||
        (user.email ? user.email.split("@")[0] : "Unknown");

      const candidatePhone =
        candidateProfile.phone ||
        dbUser?.phone ||
        dbUser?.candidatePhone ||
        "";

      const payload = {
        jobId: job._id || job.id,
        jobTitle: job.title,
        company: job.company,
        sector: job.sector,
        type: job.type,
        location: job.location,
        salary: job.salary,
        postedDate: job.postedDate,

        candidateUid: user.uid,
        candidateEmail: dbUser?.email || user.email,
        candidateName,
        candidatePhone,
      };

      // POST to your API route that writes into `users_jobs_application`
      const res = await fetch("/api/users-jobs-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to apply for this job.");
      }

      setHasApplied(true);
      setApplyMessage("Your application has been submitted successfully.");
    } catch (err) {
      console.error("Apply error:", err);
      setApplyMessage(
        err.message || "Something went wrong while applying. Please try again."
      );
    } finally {
      setApplyLoading(false);
    }
  };

  // --------- RENDERING ----------

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p>Loading job details...</p>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="mb-4 text-red-500">Job not found.</p>
        <Link href="/jobs" className="text-indigo-600 hover:underline text-sm">
          ← Back to jobs
        </Link>
      </main>
    );
  }

  const {
    title,
    company,
    companyLogo,
    logoUrl,
    sector,
    type,
    location,
    salary,
    postedDate,
    description,
    requirements,
    responsibilities,
  } = job;

  const logo = logoUrl || companyLogo || null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/jobs" className="text-indigo-600 hover:underline text-sm">
        ← Back to jobs
      </Link>

      <section className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo */}
          {logo ? (
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={logo}
                alt={company || "Company logo"}
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-semibold text-indigo-700 flex-shrink-0">
              {(company || "?").charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {sector || "General"}
            </p>
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
            <p className="text-sm text-gray-600">{company}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-700">
          {location && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              📍 {location}
            </span>
          )}
          {type && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              💼 {type}
            </span>
          )}
          {salary && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              💰 {salary.min} - {salary.max} {salary.currency}
            </span>
          )}
          {postedDate && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              📅 Posted: {new Date(postedDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-800">
          {description && (
            <div>
              <h2 className="font-semibold mb-1">Job Description</h2>
              <p>{description}</p>
            </div>
          )}

          {Array.isArray(responsibilities) && responsibilities.length > 0 && (
            <div>
              <h2 className="font-semibold mb-1">Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1">
                {responsibilities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(requirements) && requirements.length > 0 && (
            <div>
              <h2 className="font-semibold mb-1">Requirements</h2>
              <ul className="list-disc list-inside space-y-1">
                {requirements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Apply section */}
        <div className="mt-6 space-y-2">
          {/* Only show apply button for logged-in candidates */}
          {canApply && (
            <button
              onClick={handleApply}
              disabled={applyLoading || hasApplied}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {hasApplied
                ? "Application Sent"
                : applyLoading
                ? "Applying..."
                : "Apply Now"}
            </button>
          )}

          {/* If not logged in, you can optionally show a hint */}
          {!user && (
            <p className="text-xs text-gray-500">
              Please{" "}
              <Link
                href="/authentication/login"
                className="text-indigo-600 underline"
              >
                log in
              </Link>{" "}
              as a candidate to apply for this job.
            </p>
          )}

          {/* If logged in but not candidate */}
          {user && role && role !== "candidate" && (
            <p className="text-xs text-gray-500">
              Only{" "}
              <span className="font-semibold text-gray-700">candidate</span>{" "}
              accounts can apply for jobs.
            </p>
          )}

          {/* Feedback message */}
          {applyMessage && (
            <p className="text-xs mt-1 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              {applyMessage}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
