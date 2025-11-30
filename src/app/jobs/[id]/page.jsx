"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function JobDetailsPage({ params }) {
  const { id } = params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) {
        setJob(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setJob(data);
      setLoading(false);
    }

    fetchJob();
  }, [id]);

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

        {/* Apply button – you can connect this later */}
        <div className="mt-6">
          <button className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
            Apply Now
          </button>
        </div>
      </section>
    </main>
  );
}
