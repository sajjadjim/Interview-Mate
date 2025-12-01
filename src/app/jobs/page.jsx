"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "../components/ui/LoadingSpinner";


const PAGE_SIZE = 30;

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
useEffect(()=>{
  document.title="Jobs - JobBoard";
})

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (selectedSector !== "all") {
        params.set("sector", selectedSector);
      }

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    }

    fetchJobs();
  }, [selectedSector, page]);

  const sectors = useMemo(() => {
    const s = new Set(jobs.map((job) => job.sector).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [jobs]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function handleSectorChange(e) {
    setSelectedSector(e.target.value);
    setPage(1);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Latest Jobs</h1>
          <p className="text-gray-600 text-sm">
            Showing page {page} of {totalPages} ({total} jobs)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sector:</label>
          <select
            value={selectedSector}
            onChange={handleSectorChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector === "all" ? "All sectors" : sector}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spinner while loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" label="Loading jobs..." />
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <p className="text-gray-500">No jobs found for this sector.</p>
      )}

      {/* Cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {jobs.map((job) => {
          const {
            _id,
            id,
            title,
            company,
            companyLogo,
            logoUrl,
            sector,
            type,
            location,
            salary,
            postedDate,
          } = job;

          const jobIdForUrl = id || _id;
          const logo = logoUrl || companyLogo || null;

          return (
            <Link
              key={_id}
              href={`/jobs/${jobIdForUrl}`}
              className="group border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 pt-4">
                {logo ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={logo}
                      alt={company || "Company logo"}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 flex-shrink-0">
                    {(company || "?").charAt(0)}
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {sector || "General"}
                  </p>
                  <h2 className="text-base font-semibold leading-snug">
                    {title}
                  </h2>
                  <p className="text-xs text-gray-600">{company}</p>
                </div>
              </div>

              <div className="px-4 mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                {location && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">
                    📍 {location}
                  </span>
                )}
                {type && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">
                    💼 {type}
                  </span>
                )}
              </div>

              <div className="px-4 py-3 mt-auto flex items-center justify-between text-xs text-gray-600 border-t border-gray-100">
                {salary && (
                  <span>
                    {salary.min} - {salary.max} {salary.currency}
                  </span>
                )}
                {postedDate && (
                  <span className="text-gray-400">
                    {new Date(postedDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="px-4 pb-3 text-xs text-indigo-600 font-medium group-hover:underline">
                View details →
              </div>
            </Link>
          );
        })}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                canPrev
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                canNext
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
