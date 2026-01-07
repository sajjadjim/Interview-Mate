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
  CalendarX,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function InterviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ---------- ROLE & USER STATE ----------
  const [currentUserDoc, setCurrentUserDoc] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const isHrInactive = role === "hr" && status !== "active";

  // ---------- APPLICATION DATA ----------
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sending state
  const [sending, setSending] = useState({});
  const [message, setMessage] = useState("");

  // Already sent candidates
  const [interviewByApplicationId, setInterviewByApplicationId] = useState({});

  // ---------- SORTING & PAGINATION STATE ----------
  const [sortOption, setSortOption] = useState("default"); // default | date_asc | date_desc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    document.title = "Interviews | Participants - Interview-Mate";
  }, []);

  // ---------- 1) AUTH GUARD ----------
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/authentication/login");
    }
  }, [authLoading, user, router]);

  // ---------- 2) LOAD USER ROLE ----------
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    let active = true;

    const fetchUserDoc = async () => {
      try {
        setRoleLoading(true);
        const idToken = await user.getIdToken(); 
        const res = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,   
          },
        });

        if (!res.ok) {
          setUnauthorized(true);
          return;
        }

        const data = await res.json();
        if (!active) return;

        setCurrentUserDoc(data);
        setRole(data.role || null);
        setStatus(data.status || "unknown");

        if (data.role !== "hr" && data.role !== "admin") {
          setUnauthorized(true);
        } else {
          setUnauthorized(false);
        }
      } catch (err) {
        setUnauthorized(true);
      } finally {
        if (active) setRoleLoading(false);
      }
    };

    fetchUserDoc();
    return () => { active = false; };
  }, [authLoading, user]);

  // ---------- 3) LOAD DATA ----------
  useEffect(() => {
    const load = async () => {
      if (authLoading || roleLoading) return;
      if (!user || unauthorized) return; 

      setLoading(true);
      setMessage("");

      try {
        const appsRes = await fetch("/api/applications");
        const appsData = await appsRes.json();

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
        console.error(err);
        setMessage("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, roleLoading, unauthorized, user]);

  // ---------- 4) HELPER: PARSE DATES ----------
  const parseDateTime = (dateStr, timeSlotStr) => {
    try {
      if (!dateStr) return new Date(0); // Invalid date
      const datePart = new Date(dateStr);
      
      // If valid date, try to add time
      if (!Number.isNaN(datePart.getTime()) && timeSlotStr) {
        // Handle "3-4 PM" or "11-12 AM"
        const period = timeSlotStr.match(/(AM|PM)/i)?.[0];
        const startHourStr = timeSlotStr.split('-')[0]?.trim();
        
        if (period && startHourStr) {
           return new Date(`${dateStr} ${startHourStr}:00 ${period}`);
        }
        // Fallback: just return the date at midnight
        return datePart;
      }
      return datePart;
    } catch (e) {
      return new Date(0);
    }
  };

  const checkIsExpired = (dateObj) => {
    const now = new Date();
    // Compare timestamp
    return dateObj < now;
  };

  // ---------- 5) SORTING & PROCESSING LOGIC ----------
  const processedApplications = useMemo(() => {
    if (!Array.isArray(applications) || applications.length === 0) return [];

    // 1. Augment data with status flags
    const augmented = applications.map(app => {
      const dateObj = parseDateTime(app.date, app.timeSlot);
      const isExpired = checkIsExpired(dateObj);
      const isSent = !!interviewByApplicationId[app._id];
      const isApproved = app.approvalStatus === 'Approved';

      // Determine "Tier" for Default Sorting
      // Tier 0: ACTION NEEDED (Approved + Not Sent + Not Expired) -> Show at TOP
      // Tier 1: UPCOMING (Approved + Sent + Not Expired)
      // Tier 2: EXPIRED (Approved + Expired)
      // Tier 3: NOT APPROVED
      let tier = 3; 
      if (isApproved && !isSent && !isExpired) tier = 0;
      else if (isApproved && isSent && !isExpired) tier = 1;
      else if (isApproved && isExpired) tier = 2;
      else tier = 3;

      return { ...app, dateObj, isExpired, isSent, tier };
    });

    // 2. Sort Logic
    return augmented.sort((a, b) => {
      if (sortOption === 'default') {
        // Sort by Tier first
        if (a.tier !== b.tier) return a.tier - b.tier;
        // Then by Date (Nearest first)
        return a.dateObj - b.dateObj;
      }
      else if (sortOption === 'date_asc') {
        return a.dateObj - b.dateObj;
      }
      else if (sortOption === 'date_desc') {
        return b.dateObj - a.dateObj;
      }
      return 0;
    });

  }, [applications, interviewByApplicationId, sortOption]);

  // ---------- 6) PAGINATION LOGIC ----------
  const totalPages = Math.ceil(processedApplications.length / itemsPerPage);
  const currentData = processedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // ---------- 7) SEND HANDLER ----------
  const handleSend = async (app) => {
    if (!user) return;
    if (role === "hr" && status !== "active") {
      setMessage("Your HR account is not active yet.");
      return;
    }

    setSending((prev) => ({ ...prev, [app._id]: true }));
    setMessage("");

    try {
      const createdByEmail = user.email;
      const createdByName = currentUserDoc?.name || user.displayName || "Unknown";

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

      if (!res.ok) throw new Error("Failed to send candidate.");

      setInterviewByApplicationId((prev) => ({
        ...prev,
        [app._id]: { applicationId: app._id, ...payload },
      }));

      setMessage("Candidate sent successfully!");
    } catch (err) {
      setMessage("Failed to send candidate.");
    } finally {
      setSending((prev) => ({ ...prev, [app._id]: false }));
    }
  };

  // ---------- 8) LOADING / 404 ----------
  if (authLoading || roleLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-sm text-slate-600">
          <span className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-blue-600 rounded-full"/>
          Loading...
        </div>
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-4">Only HR and Admin can access this page.</p>
          <button onClick={() => router.push("/")} className="text-blue-600 hover:underline">Go Home</button>
        </div>
      </main>
    );
  }

  // ---------- 9) MAIN UI ----------
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Interviews Candidates</h1>
            <p className="text-sm text-slate-600 mt-1">Manage applicants and send interview invites.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sorting Dropdown */}
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ArrowUpDown size={14} className="text-slate-400" />
               </div>
               <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer"
               >
                  <option value="default">Default (Action Priority)</option>
                  <option value="date_asc">Date (Oldest First)</option>
                  <option value="date_desc">Date (Newest First)</option>
               </select>
            </div>

            {user && (
              <div className="hidden sm:block text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-2 shadow-sm">
                <span className="font-bold">{currentUserDoc?.name}</span> · <span className="capitalize">{role}</span>
              </div>
            )}
          </div>
        </div>

        {/* HR Inactive Alert */}
        {isHrInactive && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5" size={18} />
            <div>
              <p className="font-semibold">Account Pending Activation</p>
              <p>You cannot send invites until an Admin approves your account.</p>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && currentData.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-100/70 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Applicant</th>
                    <th className="px-4 py-3 font-semibold">Date &amp; Time</th>
                    <th className="px-4 py-3 font-semibold">Topic</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Approval</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.map((app, index) => (
                    <motion.tr
                      key={app._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`hover:bg-slate-50 transition-colors ${app.tier === 0 ? 'bg-blue-50/30' : ''}`}
                    >
                      {/* Name */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 flex items-center gap-2">
                            <User size={14} className="text-slate-400"/> {app.name}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                            <Mail size={12}/> {app.email}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 align-top">
                        <div className={`flex flex-col gap-1 text-xs ${app.isExpired ? "text-red-600 font-bold" : "text-slate-700"}`}>
                          <div className="flex items-center gap-2">
                            <CalendarDays size={12} /> <span>{app.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={12} /> <span>{app.timeSlot}</span>
                          </div>
                          {app.isExpired && <span className="text-[10px] bg-red-100 px-1.5 py-0.5 rounded w-fit">Expired</span>}
                        </div>
                      </td>

                      {/* Topic */}
                      <td className="px-4 py-3 align-top text-slate-700"><div className="flex items-center gap-2"><Tag size={12}/> {app.topic}</div></td>

                      {/* Payment */}
                      <td className="px-4 py-3 align-top">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${app.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          <BadgeDollarSign size={12}/> {app.paymentStatus}
                        </span>
                      </td>

                      {/* Approval */}
                      <td className="px-4 py-3 align-top">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${app.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {app.approvalStatus === 'Approved' ? <Send size={12}/> : <Hourglass size={12}/>} {app.approvalStatus}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3 align-top">
                        {app.approvalStatus === "Approved" ? (
                          <>
                            {app.isSent ? (
                              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 cursor-not-allowed opacity-80">
                                <Hourglass size={14} /> Waiting for Interview
                              </button>
                            ) : app.isExpired ? (
                              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed">
                                <CalendarX size={14} /> Date Over
                              </button>
                            ) : isHrInactive ? (
                              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 cursor-not-allowed">
                                <AlertTriangle size={14} /> Account Inactive
                              </button>
                            ) : (
                              <button onClick={() => handleSend(app)} disabled={!!sending[app._id]} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70">
                                <Send size={14} /> {sending[app._id] ? "Sending..." : "Send Invite"}
                              </button>
                            )}
                          </>
                        ) : (
                          <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
                            <Hourglass size={14} /> Waiting Approval
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                     Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, processedApplications.length)}</span> of <span className="font-medium">{processedApplications.length}</span> results
                  </p>
                  <div className="flex items-center gap-2">
                     <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600">
                        <ChevronLeft size={16} />
                     </button>
                     <span className="text-xs font-medium text-slate-700">Page {currentPage} of {totalPages}</span>
                     <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600">
                        <ChevronRight size={16} />
                     </button>
                  </div>
               </div>
            )}
          </div>
        ) : (
          !loading && <div className="text-center py-20 text-slate-500">No applicants found.</div>
        )}

        {/* Toast */}
        {message && (
          <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-in fade-in slide-in-from-bottom-4 z-50">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}