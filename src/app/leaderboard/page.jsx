"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import Auth Context

// --- Helper: Generate consistent colors from names ---
const getAvatarColor = (name) => {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", 
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
    "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
    "bg-pink-500", "bg-rose-500"
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function LeaderboardPage() {
  const { user } = useAuth(); // Get current login state
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (data.success) {
          setLeaders(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  // --- Helper: Mask Email ---
  const formatEmail = (email) => {
    if (user) return email; // If logged in, show full email
    
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (local.length <= 3) return `${local}***@${domain}`;
    return `${local.substring(0, 3)}*****@${domain}`;
  };

  // Separate Top 3 from the rest
  const topThree = leaders.slice(0, 3);
  const restList = leaders.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#2563EB] pb-32 pt-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative mx-auto max-w-5xl px-4 text-center text-white">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 backdrop-blur-md">
            <Trophy className="h-4 w-4 text-yellow-300" />
            InterviewMate Rankings
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Global Leaderboard
          </h1>
          <p className="mt-4 text-lg text-blue-100/90">
            Top performing candidates based on interview scores and consistency.
          </p>
          {!user && (
            <p className="mt-2 text-xs text-blue-200/70 bg-blue-700/30 inline-block px-3 py-1 rounded-full">
              <span className="font-bold">Note:</span> Log in to see full candidate emails.
            </p>
          )}
        </div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative mx-auto -mt-24 max-w-5xl px-4">
        
        {loading ? (
          <div className="flex h-96 items-center justify-center rounded-3xl bg-white shadow-xl">
            <div className="text-slate-400">Loading rankings...</div>
          </div>
        ) : (
          <>
            {/* --- TOP 3 PODIUM --- */}
            {topThree.length > 0 && (
              <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-end">
                {/* 2nd Place (Left) */}
                {topThree[1] && (
                  <div className="order-2 sm:order-1 relative flex flex-col items-center">
                    <div className="relative z-10 mb-4 h-24 w-24 rounded-full border-4 border-white bg-slate-200 shadow-xl">
                      <div className={`flex h-full w-full items-center justify-center rounded-full text-2xl font-bold text-white ${getAvatarColor(topThree[1].applicantName)}`}>
                        {getInitials(topThree[1].applicantName)}
                      </div>
                      <div className="absolute -bottom-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-slate-400 font-bold text-white shadow-md ring-4 ring-slate-50">
                        2
                      </div>
                    </div>
                    <div className="w-full rounded-2xl bg-white p-6 text-center shadow-lg transition-transform hover:-translate-y-1">
                      <h3 className="truncate text-lg font-bold text-slate-900">{topThree[1].applicantName}</h3>
                      <p className="truncate text-xs text-slate-400 mb-1">{formatEmail(topThree[1].applicantEmail)}</p>
                      <p className="text-xs font-semibold uppercase text-slate-500">Silver Medalist</p>
                      <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1 text-sm font-bold text-slate-700">
                        <Star className="h-4 w-4 fill-slate-400 text-slate-400" />
                        {topThree[1].totalScoreAccumulated}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place (Center - Biggest) */}
                {topThree[0] && (
                  <div className="order-1 sm:order-2 relative flex flex-col items-center sm:-mt-12">
                    <Crown className="absolute -top-14 h-12 w-12 animate-bounce text-yellow-400 drop-shadow-lg" />
                    <div className="relative z-10 mb-4 h-32 w-32 rounded-full border-4 border-yellow-400 bg-yellow-100 shadow-2xl ring-4 ring-white">
                      <div className={`flex h-full w-full items-center justify-center rounded-full text-4xl font-bold text-white ${getAvatarColor(topThree[0].applicantName)}`}>
                        {getInitials(topThree[0].applicantName)}
                      </div>
                      <div className="absolute -bottom-4 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-yellow-500 font-bold text-white shadow-md ring-4 ring-slate-50">
                        1
                      </div>
                    </div>
                    <div className="relative w-full overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl transition-transform hover:-translate-y-2">
                      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>
                      <h3 className="truncate text-xl font-extrabold text-slate-900">{topThree[0].applicantName}</h3>
                      <p className="truncate text-xs text-slate-400 mb-2">{formatEmail(topThree[0].applicantEmail)}</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-yellow-600">Champion</p>
                      <div className="mt-4 inline-flex items-center gap-1 rounded-xl bg-yellow-50 px-4 py-2 text-lg font-bold text-yellow-700">
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                        {topThree[0].totalScoreAccumulated}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place (Right) */}
                {topThree[2] && (
                  <div className="order-3 sm:order-3 relative flex flex-col items-center">
                    <div className="relative z-10 mb-4 h-24 w-24 rounded-full border-4 border-white bg-orange-100 shadow-xl">
                      <div className={`flex h-full w-full items-center justify-center rounded-full text-2xl font-bold text-white ${getAvatarColor(topThree[2].applicantName)}`}>
                        {getInitials(topThree[2].applicantName)}
                      </div>
                      <div className="absolute -bottom-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-orange-400 font-bold text-white shadow-md ring-4 ring-slate-50">
                        3
                      </div>
                    </div>
                    <div className="w-full rounded-2xl bg-white p-6 text-center shadow-lg transition-transform hover:-translate-y-1">
                      <h3 className="truncate text-lg font-bold text-slate-900">{topThree[2].applicantName}</h3>
                      <p className="truncate text-xs text-slate-400 mb-1">{formatEmail(topThree[2].applicantEmail)}</p>
                      <p className="text-xs font-semibold uppercase text-slate-500">Bronze Medalist</p>
                      <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-1 text-sm font-bold text-orange-800">
                        <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                        {topThree[2].totalScoreAccumulated}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- LIST (4 to 100) --- */}
            {restList.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                  <h3 className="font-semibold text-slate-700">All Candidates</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {restList.map((user, index) => (
                    <div
                      key={user._id || index}
                      className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-blue-50/50"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        {/* Rank Number */}
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-blue-200 group-hover:text-blue-700">
                          {index + 4}
                        </div>

                        {/* Avatar */}
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(user.applicantName)}`}>
                          {getInitials(user.applicantName)}
                        </div>

                        {/* Name & Email */}
                        <div className="min-w-0">
                          <h4 className="truncate font-bold text-slate-900">{user.applicantName}</h4>
                          <p className="truncate text-xs text-slate-500 font-mono">
                            {formatEmail(user.applicantEmail)}
                          </p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-1 font-mono text-lg font-bold text-slate-700 group-hover:text-blue-600">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {user.totalScoreAccumulated}
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Score</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer of list */}
                <div className="bg-slate-50 p-4 text-center text-xs text-slate-400">
                  Showing top 100 candidates
                </div>
              </div>
            )}

            {/* Empty State */}
            {leaders.length === 0 && (
              <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Trophy className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Leaderboard is empty</h3>
                <p className="text-slate-500">No interviews have been graded yet. Be the first!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}