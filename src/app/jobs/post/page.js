// src/app/jobs/post/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

/**
 * JobsPostPage
 *
 * Responsibilities:
 *  - Only accessible to:
 *      * logged-in user
 *      * role === "company"
 *      * status === "active"
 *  - Form to create job via POST /api/jobs
 *  - Fields:
 *      - title, sector, type, location
 *      - jobVacancy, jobTime, jobAddress
 *      - salaryMin, salaryMax, salaryCurrency
 *      - deadline (application last date)
 *      - description, requirements, responsibilities
 */
const SECTORS = ["IT Sector", "Management", "Education", "Commercial"];
const TYPES = ["Full-Time", "Part-Time", "Contract", "Internship"];

export default function JobsPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState(SECTORS[0]);
  const [type, setType] = useState(TYPES[0]);
  const [location, setLocation] = useState("");
  const [jobVacancy, setJobVacancy] = useState("");
  const [jobTime, setJobTime] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("BDT");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Set page title
  useEffect(() => {
    document.title = "Post a Job | InterviewMate";
  }, []);

  // Check auth + role + status
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/authentication/login");
      return;
    }

    let active = true;

    const checkUser = async () => {
      try {
        setCheckingAccess(true);
        const res = await fetch(`/api/users/me?uid=${user.uid}`);
        if (!res.ok) {
          console.error("Failed to load user for job post page.");
          setNotAllowed(true);
          return;
        }
        const data = await res.json();
        if (!active) return;

        setDbUser(data);
        setRole(data.role || null);
        setStatus(data.status || null);

        // Only active company accounts can access
        if (data.role !== "company" || data.status !== "active") {
          setNotAllowed(true);
        } else {
          setNotAllowed(false);
        }
      } catch (err) {
        console.error("Error checking access:", err);
        setNotAllowed(true);
      } finally {
        if (active) setCheckingAccess(false);
      }
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [authLoading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!dbUser || role !== "company" || status !== "active") {
      setMessage("You are not allowed to post jobs.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        sector,
        type,
        location,
        jobVacancy,
        jobTime,
        jobAddress,
        salaryMin,
        salaryMax,
        salaryCurrency,
        companyName: dbUser.companyProfile?.companyName || "Unknown Company",
        companyEmail: dbUser.email,
        deadline,
        description,
        requirements,
        responsibilities,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create job.");
      }

      setMessage("Job posted successfully.");
      // Reset form
      setTitle("");
      setSector(SECTORS[0]);
      setType(TYPES[0]);
      setLocation("");
      setJobVacancy("");
      setJobTime("");
      setJobAddress("");
      setSalaryMin("");
      setSalaryMax("");
      setSalaryCurrency("BDT");
      setDeadline("");
      setDescription("");
      setRequirements("");
      setResponsibilities("");

      // Redirect to jobs page after short delay
      setTimeout(() => {
        router.push("/jobs");
      }, 1000);
    } catch (err) {
      console.error("Job post error:", err);
      setMessage(err.message || "Something went wrong while posting the job.");
    } finally {
      setSaving(false);
    }
  };

  // Loading / access states
  if (authLoading || checkingAccess) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p>Checking permission...</p>
      </main>
    );
  }

  if (notAllowed) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">
            You are not allowed to post jobs
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            This page is only available for{" "}
            <span className="font-semibold">active company accounts</span>. If
            your status is inactive, please wait for admin approval.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Post a New Job</h1>
      <p className="text-sm text-gray-600 mb-4">
        Company:{" "}
        <span className="font-semibold">
          {dbUser?.companyProfile?.companyName || "Unknown Company"}
        </span>{" "}
        ({dbUser?.email})
      </p>

      {message && (
        <p className="mb-4 text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl border">
        {/* Basic info */}
        <div>
          <label className="text-sm font-medium">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">
              Sector <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Banani, Dhaka"
              required
            />
          </div>
        </div>

        {/* Vacancy / time / address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">
              Vacancy <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={jobVacancy}
              onChange={(e) => setJobVacancy(e.target.value)}
              placeholder="e.g. 3"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Job Time <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={jobTime}
              onChange={(e) => setJobTime(e.target.value)}
              placeholder="e.g. 9:00 AM - 6:00 PM"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Application Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Job Address <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            value={jobAddress}
            onChange={(e) => setJobAddress(e.target.value)}
            placeholder="e.g. Company head office full address"
            required
          />
        </div>

        {/* Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">
              Salary Min <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="e.g. 40000"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Salary Max <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="e.g. 60000"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Description / requirements / responsibilities */}
        <div>
          <label className="text-sm font-medium">Job Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm mt-1 min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description about the role and responsibilities."
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Requirements (one per line)
          </label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm mt-1 min-h-[80px]"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder={"e.g.\n• 3+ years experience\n• Strong JavaScript skills"}
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Responsibilities (one per line)
          </label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm mt-1 min-h-[80px]"
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            placeholder={"e.g.\n• Lead a small engineering team\n• Review pull requests"}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? "Posting..." : "Post Job"}
        </button>
      </form>
    </main>
  );
}
