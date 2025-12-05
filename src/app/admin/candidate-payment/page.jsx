"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"; // Added Trash2
import app from "@/lib/firebase";


export default function CandidatePaymentPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("unpaid");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Replace with your real role check logic
        setIsAuthorized(true); 
        setCheckingAuth(false);
        fetchApplications(1, filter);
      } else {
        notFound();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchApplications = async (pageNum, currentFilter) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/candidate-payment?status=${currentFilter}&page=${pageNum}`);
      const data = await res.json();
      setApplications(data.applications || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    fetchApplications(1, newFilter);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchApplications(newPage, filter);
    }
  };

  const handleUpdateStatus = async (id, type, currentValue) => {
    let newValue;
    if (type === "paymentStatus") {
      newValue = currentValue === "paid" ? "unpaid" : "paid";
    } else {
      newValue = currentValue === "Approved" ? "Not approved" : "Approved";
    }

    Swal.fire({
      title: "Update Status?",
      text: `Change to ${newValue}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/admin/candidate-payment", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, [type]: newValue }),
          });
          if (res.ok) fetchApplications(page, filter);
        } catch (err) {
          Swal.fire("Error", "Failed", "error");
        }
      }
    });
  };

  // --- NEW DELETE FUNCTION ---
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This application is unpaid. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/candidate-payment?id=${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            Swal.fire("Deleted!", "The application has been deleted.", "success");
            fetchApplications(page, filter); // Refresh list
          } else {
            const errorData = await res.json();
            Swal.fire("Error", errorData.message || "Failed to delete", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Network error", "error");
        }
      }
    });
  };

  if (checkingAuth) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Candidate Payment & Approval</h1>

      <div className="flex space-x-4 bg-white p-2 rounded-lg shadow-sm w-fit">
        <button onClick={() => handleFilterChange("unpaid")} className={`px-5 py-2 rounded-md font-semibold transition ${filter === "unpaid" ? "bg-red-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Unpaid</button>
        <button onClick={() => handleFilterChange("paid")} className={`px-5 py-2 rounded-md font-semibold transition ${filter === "paid" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Paid</button>
        <button onClick={() => handleFilterChange("all")} className={`px-5 py-2 rounded-md font-semibold transition ${filter === "all" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>All</button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Candidate Info</th>
                    <th className="px-6 py-4">Session Details</th>
                    <th className="px-6 py-4 text-center">Payment</th>
                    <th className="px-6 py-4 text-center">Approval</th>
                    <th className="px-6 py-4 text-center">Action</th> 
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{app.name}</div>
                          <div className="text-gray-500">{app.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-800 font-medium">{app.topic}</div>
                          <div className="text-gray-500 text-xs">{app.date} | {app.timeSlot}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleUpdateStatus(app._id, "paymentStatus", app.paymentStatus)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                              app.paymentStatus === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {app.paymentStatus ? app.paymentStatus.toUpperCase() : "UNKNOWN"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleUpdateStatus(app._id, "approvalStatus", app.approvalStatus)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                              app.approvalStatus === "Approved" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {app.approvalStatus || "Pending"}
                          </button>
                        </td>
                        
                        {/* DELETE BUTTON COLUMN */}
                        <td className="px-6 py-4 text-center">
                          {app.paymentStatus === "unpaid" ? (
                            <button
                              onClick={() => handleDelete(app._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                              title="Delete Unpaid Application"
                            >
                              <Trash2 size={20} />
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {applications.length > 0 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="flex items-center gap-1 px-4 py-2 border rounded-md bg-white disabled:opacity-50">
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="flex items-center gap-1 px-4 py-2 border rounded-md bg-white disabled:opacity-50">
                   Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}