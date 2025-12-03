"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const SECTORS = [
  "IT Sector",
  "Management",
  "Education",
  "Commercial",
  "Other",
];

const TYPES = ["Full-Time", "Part-Time", "Remote", "Internship"];

export default function PostJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [dbUser, setDbUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [jobTime, setJobTime] = useState("");
  const [vacancy, setVacancy] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("BDT");
  const [description, setDescription] = useState("");

  // Company identity
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  // Load dbUser (role + status + companyProfile)
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Not logged in → send to login
      router.push("/authentication/login");
      return;
    }

    let active = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const res = await fetch(`/api/users/me?uid=${user.uid}`);
        if (!res.ok) {
          setError("Failed to load user data.");
          return;
        }
        const data = await res.json();
        if (!active) return;

        setDbUser(data);

        if (data.role !== "company") {
          setError("Only company accounts can post jobs.");
          return;
        }

        if (data.status !== "active") {
          setError(
            "Your company account is not active yet. Please wait for admin approval."
          );
          return;
        }

        const cp = data.companyProfile || {};
        setCompanyName(cp.companyName || "");
        setCompanyEmail(cp.companyEmail || data.email || user.email || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load user data.");
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !sector || !type || !location || !description) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!vacancy) {
      setError("Please provide job vacancy.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        sector,
        type,
        location,
        jobTime,
        jobVacancy: Number(vacancy),
        description,
        salary: {
          min: salaryMin ? Number(salaryMin) : null,
          max: salaryMax ? Number(salaryMax) : null,
          currency: salaryCurrency || "BDT",
        },
        company: companyName,
        companyEmail,
        postedByUid: user.uid,
        postedByEmail: user.email,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to post job.");
      }

      setSuccess("Job posted successfully!");
      // Optional: redirect after short delay
      setTimeout(() => {
        router.push("/jobs");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading || loadingUser) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center text-sm text-gray-600">
          Loading company information...
        </div>
      </main>
    );
  }

  // Shows error if user is not allowed
  if (error && (!dbUser || dbUser.role !== "company" || dbUser.status !== "active")) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl font-semibold mb-2">Job Posting Restricted</h1>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
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

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Post a New Job</h1>
      <p className="text-sm text-gray-600 mb-6">
        Create a new job posting for candidates on InterviewMate.
      </p>

      {error && (
        <p className="mb-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md px-3 py-2">
          {success}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7"
      >
        {/* Company info (read-only) */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              readOnly
              className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Company Email
            </label>
            <input
              type="email"
              value={companyEmail}
              readOnly
              className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior DevOps Engineer"
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Sector & Type */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Sector <span className="text-red-500">*</span>
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select sector</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select type</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Job Time */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Job Address / Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bashundhara, Dhaka"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Job Time / Schedule
            </label>
            <input
              type="text"
              value={jobTime}
              onChange={(e) => setJobTime(e.target.value)}
              placeholder="e.g. 9 AM - 6 PM, Sun-Thu"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Vacancy & Salary */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Vacancy <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={vacancy}
              onChange={(e) => setVacancy(e.target.value)}
              min={1}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Salary Range
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Min"
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Max"
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe responsibilities, requirements, benefits etc."
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 shadow-sm"
          >
            {saving ? "Posting job..." : "Post Job"}
          </button>
        </div>
      </form>
    </main>
  );
}
