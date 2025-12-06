"use client";

import { useEffect, useState, use } from "react"; // Added 'use' import
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

/**
 * JobDetailsPage
 */
export default function JobDetailsPage({ params }) {
  // 🟢 FIX: Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

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
    if (!id) return; // Guard clause

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
        const idToken = await user.getIdToken(); // Firebase ID token

        const res = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });

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

  // Candidate profile + resume presence
  const candidateProfile = dbUser?.candidateProfile || {};
  const hasResumeLink = !!candidateProfile.resumeUrl;

  // --------- Check if user already applied to this job ----------
  useEffect(() => {
    if (!job || !user || !role || role !== "candidate") return;

    let active = true;

    const checkExistingApplication = async () => {
      try {
        const jobIdForApplication = job._id || job.id;
        if (!jobIdForApplication) return;

        const params = new URLSearchParams();
        params.set("candidateUid", user.uid);
        params.set("jobId", jobIdForApplication);

        const res = await fetch(
          `/api/users-jobs-application?${params.toString()}`
        );
        if (!res.ok) return;

        const data = await res.json();
        if (!active) return;

        if (Array.isArray(data) && data.length > 0) {
          setHasApplied(true);
          setApplyMessage("You have already applied for this job.");
        }
      } catch (err) {
        console.error("Error checking existing application:", err);
      }
    };

    checkExistingApplication();

    return () => {
      active = false;
    };
  }, [job, user, role]);

  // --------- Derived helpers ----------
  const isCandidate = !!user && role === "candidate";

  // Compute deadline status
  let deadlineDate = null;
  let isDeadlineOver = false;

  if (job?.deadline) {
    deadlineDate = new Date(job.deadline);
    if (!Number.isNaN(deadlineDate.getTime())) {
      isDeadlineOver = deadlineDate < new Date();
    }
  }

  // Candidate can apply only if:
  // - logged in as candidate
  // - resumeUrl is present
  // - deadline not over
  const canApply =
    isCandidate && hasResumeLink && !isDeadlineOver && !hasApplied;

  // --------- Handle apply ----------
  const handleApply = async () => {
    setApplyMessage("");

    if (!user) {
      router.push("/authentication/login");
      return;
    }

    if (role && role !== "candidate") {
      setApplyMessage("Only candidate accounts can apply for jobs.");
      return;
    }

    if (isDeadlineOver) {
      setApplyMessage("Application deadline is over for this job.");
      return;
    }

    if (hasApplied) {
      setApplyMessage("You have already applied for this job.");
      return;
    }

    // Extra safety: require resume URL
    const candidateProfileFromDb = dbUser?.candidateProfile || {};
    const resumeUrl = candidateProfileFromDb.resumeUrl;

    if (!resumeUrl) {
      setApplyMessage(
        "To apply, please add your CV / Resume link in your profile (Profile → Candidate Information → CV / Resume URL)."
      );
      return;
    }

    if (!job) return;

    setApplyLoading(true);

    try {
      const fullNameFromProfile =
        (candidateProfileFromDb.firstName || "") +
        (candidateProfileFromDb.lastName
          ? ` ${candidateProfileFromDb.lastName}`
          : "");

      const candidateName =
        fullNameFromProfile.trim() ||
        dbUser?.name ||
        user.displayName ||
        (user.email ? user.email.split("@")[0] : "Unknown");

      const candidatePhone =
        candidateProfileFromDb.phone ||
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
        jobVacancy: job.jobVacancy,
        jobTime: job.jobTime,
        jobAddress: job.jobAddress,
        jobDeadline: job.deadline,

        candidateUid: user.uid,
        candidateEmail: dbUser?.email || user.email,
        candidateName,
        candidatePhone,
        resumeUrl, 

        appliedAt: new Date().toISOString(), 
      };

      const res = await fetch("/api/users-jobs-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 409) {
          setHasApplied(true);
          setApplyMessage(
            data?.message || "You have already applied for this job."
          );
          return;
        }

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
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" label="Loading jobs details" />
        </div>
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
    jobVacancy,
    jobTime,
    jobAddress,
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
          {typeof jobVacancy === "number" && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              👥 Vacancy: {jobVacancy}
            </span>
          )}
          {jobTime && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              🕒 Job Time: {jobTime}
            </span>
          )}
          {jobAddress && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              📫 Address: {jobAddress}
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
          {deadlineDate && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              ⏰ Deadline: {deadlineDate.toLocaleDateString()}
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
          {/* Candidate with resume & within deadline */}
          {isCandidate && (
            <button
              onClick={handleApply}
              disabled={!canApply || applyLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeadlineOver
                ? "Deadline over"
                : hasApplied
                ? "Already applied"
                : !hasResumeLink
                ? "Add CV in profile to apply"
                : applyLoading
                ? "Applying..."
                : "Apply Now"}
            </button>
          )}

          {/* Deadline message */}
          {isDeadlineOver && (
            <p className="text-xs text-red-500 mt-1">
              Application deadline is over. You can no longer apply for this
              job.
            </p>
          )}

          {/* If not logged in, show hint */}
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

          {/* Candidate missing resume */}
          {isCandidate && !hasResumeLink && (
            <p className="text-xs text-red-500">
              To apply, please add your CV / Resume link in your profile
              (Profile → Candidate Information → CV / Resume URL).
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