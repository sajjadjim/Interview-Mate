"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="max-w-xl w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 mb-1">
            Oops!
          </p>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
              404
            </span>
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="space-y-2 mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
            Page not found
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. You can go back or explore jobs and interviews.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Go back
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            <Home size={16} />
            Go to Home
          </Link>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-white text-blue-700 border border-blue-100 hover:bg-blue-50"
          >
            <Search size={16} />
            Browse Jobs
          </Link>
        </motion.div>

        {/* Small hint */}
        <p className="mt-6 text-[11px] text-slate-400">
          If you think this is a mistake, please contact support from the
          Contact page.
        </p>
      </div>
    </main>
  );
}
