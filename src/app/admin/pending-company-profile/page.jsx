"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/lib/firebase";
import Swal from "sweetalert2";
import { Dialog } from "@headlessui/react";
import {
  XCircle, ChevronLeft, ChevronRight, Building2,
  UserCheck, CheckCircle2, Clock, BarChart3
} from "lucide-react";

export default function PendingCompanyPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Data & Stats State
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 }); // New Stats State
  const [statusFilter, setStatusFilter] = useState("inactive");
  const [isLoading, setIsLoading] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // 1. Auth Check
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        fetchCompanies(1, statusFilter);
      } else {
        notFound();
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data (Includes Stats)
  const fetchCompanies = async (pageNum, currentStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/pending-company?status=${currentStatus}&page=${pageNum}`);
      const data = await res.json();

      setCompanies(data.companies || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 1);

      // Update Stats from API response
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    const action = newStatus === "active" ? "Activate" : "Deactivate";

    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this Company?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "active" ? "#10B981" : "#EF4444",
      confirmButtonText: `Yes, ${action}!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/admin/pending-company", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, status: newStatus }),
          });

          if (res.ok) {
            Swal.fire("Success", `Company is now ${newStatus}`, "success");
            fetchCompanies(page, statusFilter); // Refresh data & stats
          } else {
            Swal.fire("Error", "Failed to update status", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Network error", "error");
        }
      }
    });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/admin/pending-company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editData._id,
          profileData: editData.companyProfile,
        }),
      });

      if (res.ok) {
        Swal.fire("Saved", "Profile updated", "success");
        setShowEditModal(false);
        fetchCompanies(page, statusFilter);
      } else {
        Swal.fire("Error", "Failed to save", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Network error", "error");
    }
  };

  const openEditModal = (company) => {
    setEditData(JSON.parse(JSON.stringify(company)));
    setShowEditModal(true);
  };

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setPage(1);
    fetchCompanies(1, status);
  };

  if (checkingAuth) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* HEADER & TITLE */}
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        Company Management
      </h1>

      {/* --- STATISTICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Total Companies</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <BarChart3 size={28} />
          </div>
        </div>

        {/* Active Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Active</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.active}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600">
            <CheckCircle2 size={28} />
          </div>
        </div>

        {/* Inactive Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Inactive / Pending</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.inactive}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-600">
            <Clock size={28} />
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
          Active Companies
        </button>
      </div>

      {/* TABLE SECTION */}
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
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companies.length > 0 ? (
                    companies.map((co) => (
                      <tr key={co._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{co.companyProfile?.companyName || "N/A"}</div>
                          <div className="text-xs text-gray-500 mt-1">{co.companyProfile?.companyAddress}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{co.companyProfile?.ownerName || co.name}</div>
                          <div className="text-xs text-gray-500">{co.companyProfile?.ownerPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">{co.companyProfile?.companyEmail}</div>
                          <div className="text-xs text-blue-500">{co.companyProfile?.ownerEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${co.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                            {co.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEditModal(co)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleStatusChange(co._id, co.status === "active" ? "inactive" : "active")}
                            className={`font-medium hover:underline ${co.status === "active" ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"
                              }`}
                          >
                            {co.status === "active" ? "Deactivate" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No {statusFilter} companies found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {companies.length > 0 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-4 py-2 border rounded-md bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm text-gray-600 font-medium">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

      {/* EDIT MODAL - (Identical to previous response, kept for completeness) */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <XCircle size={24} />
            </button>
            <Dialog.Title className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <UserCheck className="text-blue-600" /> Edit Company Profile
            </Dialog.Title>
            {editData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-500 border-b pb-1 mb-2">Company Info</div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input type="text" value={editData.companyProfile?.companyName || ""} onChange={(e) => setEditData({ ...editData, companyProfile: { ...editData.companyProfile, companyName: e.target.value } })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <input type="text" value={editData.companyProfile?.companyAddress || ""} onChange={(e) => setEditData({ ...editData, companyProfile: { ...editData.companyProfile, companyAddress: e.target.value } })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={editData.companyProfile?.companyEmail || ""} onChange={(e) => setEditData({ ...editData, companyProfile: { ...editData.companyProfile, companyEmail: e.target.value } })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-500 border-b pb-1 mb-2 mt-4">Owner Info</div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Owner Name</label>
                  <input type="text" value={editData.companyProfile?.ownerName || ""} onChange={(e) => setEditData({ ...editData, companyProfile: { ...editData.companyProfile, ownerName: e.target.value } })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Owner Phone</label>
                  <input type="text" value={editData.companyProfile?.ownerPhone || ""} onChange={(e) => setEditData({ ...editData, companyProfile: { ...editData.companyProfile, ownerPhone: e.target.value } })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-md text-gray-700">Cancel</button>
              <button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}