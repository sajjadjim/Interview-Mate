"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/lib/firebase";
import Swal from "sweetalert2";
import { Dialog } from "@headlessui/react";
import {
  XCircle, ChevronLeft, ChevronRight, Users,
  UserCheck, UserX, Briefcase
} from "lucide-react";

export default function PendingHRPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Data & Stats State
  const [hrData, setHrData] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 }); // Stats State
  const [statusFilter, setStatusFilter] = useState("inactive");
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editHR, setEditHR] = useState(null);

  // 1. Auth Check
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        fetchHRUsers(1, statusFilter);
      } else {
        notFound();
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data
  const fetchHRUsers = async (pageNum, currentStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/pending-hr?status=${currentStatus}&page=${pageNum}`);
      const data = await res.json();

      setHrData(data.hrUsers || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 1);

      // Update Stats
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching HR users:", err);
      Swal.fire("Error", "Failed to fetch data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    const action = newStatus === "active" ? "Activate" : "Deactivate";

    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this HR?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "active" ? "#10B981" : "#EF4444",
      confirmButtonText: `Yes, ${action}!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/admin/pending-hr", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, status: newStatus }),
          });

          if (res.ok) {
            Swal.fire("Success", `HR status changed to ${newStatus}`, "success");
            fetchHRUsers(page, statusFilter);
          } else {
            Swal.fire("Error", "Failed to change status", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Network error", "error");
        }
      }
    });
  };

  const handleSaveHR = async () => {
    try {
      const res = await fetch("/api/admin/pending-hr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editHR._id,
          profileData: editHR.hrProfile,
        }),
      });

      if (res.ok) {
        Swal.fire("Success", "HR profile updated", "success");
        setShowEditModal(false);
        fetchHRUsers(page, statusFilter);
      } else {
        Swal.fire("Error", "Failed to save", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Network error", "error");
    }
  };

  const openEditModal = (hr) => {
    setEditHR(JSON.parse(JSON.stringify(hr)));
    setShowEditModal(true);
  };

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setPage(1);
    fetchHRUsers(1, status);
  };

  if (checkingAuth) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Briefcase className="w-8 h-8 text-blue-600" />
        HR Management
      </h1>

      {/* --- STATISTICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Total HRs</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <Users size={28} />
          </div>
        </div>

        {/* Active Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Active HRs</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.active}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600">
            <UserCheck size={28} />
          </div>
        </div>

        {/* Inactive Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Inactive / Pending</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.inactive}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-600">
            <UserX size={28} />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => handleFilterClick("inactive")}
          className={`px-6 py-2 rounded-t-lg font-semibold transition ${statusFilter === "inactive"
              ? "bg-red-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          Inactive Requests
        </button>
        <button
          onClick={() => handleFilterClick("active")}
          className={`px-6 py-2 rounded-t-lg font-semibold transition ${statusFilter === "active"
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          Active HRs
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg overflow-hidden min-h-[400px] border">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mr-2"></div>
            Loading...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hrData.length > 0 ? (
                    hrData.map((hr) => (
                      <tr key={hr._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{hr.name}</td>
                        <td className="px-6 py-4 text-gray-600">{hr.email}</td>
                        <td className="px-6 py-4 text-gray-600">{hr.hrProfile?.companyName || "N/A"}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${hr.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                          >
                            {hr.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEditModal(hr)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleStatusChange(hr._id, hr.status === "active" ? "inactive" : "active")}
                            className={`font-medium hover:underline ${hr.status === "active" ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"
                              }`}
                          >
                            {hr.status === "active" ? "Deactivate" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        No HR users found for this status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {hrData.length > 0 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-4 py-2 border rounded-md bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm text-gray-600 font-medium">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-4 py-2 border rounded-md bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit HR Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <XCircle size={24} />
            </button>
            <Dialog.Title className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              Edit HR Profile
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={editHR?.hrProfile?.fullName || ""}
                  onChange={(e) => setEditHR({ ...editHR, hrProfile: { ...editHR.hrProfile, fullName: e.target.value } })}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={editHR?.hrProfile?.age || ""}
                  onChange={(e) => setEditHR({ ...editHR, hrProfile: { ...editHR.hrProfile, age: e.target.value } })}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={editHR?.hrProfile?.companyName || ""}
                  onChange={(e) => setEditHR({ ...editHR, hrProfile: { ...editHR.hrProfile, companyName: e.target.value } })}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Email</label>
                <input
                  type="email"
                  value={editHR?.hrProfile?.companyEmail || ""}
                  readOnly
                  className="w-full mt-1 p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHR}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}