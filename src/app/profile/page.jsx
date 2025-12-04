"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { CheckCircle2, XCircle } from "lucide-react";

// Simple reusable modal component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // which modal is open: "candidate" | "hr" | "company" | null
  const [activeModal, setActiveModal] = useState(null);

  // Candidate fields
  const [candidateData, setCandidateData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    educationalQualification: "",
    currentJobPosition: "",
    age: "",
    imageUrl: "",
    resumeUrl: "",
    portfolioUrl: "",
  });

  // HR fields
  const [hrData, setHrData] = useState({
    fullName: "",
    age: "",
    nidNumber: "",
    contactPhone: "",
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    companyTenureDays: "",
  });

  // Company fields
  const [companyData, setCompanyData] = useState({
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication/login");
    }
  }, [authLoading, user, router]);

  // Dynamic page title
  useEffect(() => {
    document.title = user?.email
      ? `Profile | ${user.email} | Interview-Mate`
      : "Profile | Interview-Mate";
  }, [user]);

  // Load profile from DB (secured with Firebase ID token)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoadingProfile(true);
      setError("");
      setSuccess("");

      try {
        const idToken = await user.getIdToken(); // 👈 secure token from Firebase

        const res = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`, // 👈 backend verifies this
          },
        });

        if (!res.ok) {
          setError("Failed to load profile.");
          setLoadingProfile(false);
          return;
        }

        const data = await res.json();
        setDbUser(data);

        if (data.role === "candidate" && data.candidateProfile) {
          setCandidateData((prev) => ({
            ...prev,
            ...data.candidateProfile,
            age: data.candidateProfile.age ?? "",
          }));
        }
        if (data.role === "hr" && data.hrProfile) {
          setHrData((prev) => ({
            ...prev,
            ...data.hrProfile,
          }));
        }
        if (data.role === "company" && data.companyProfile) {
          setCompanyData((prev) => ({
            ...prev,
            ...data.companyProfile,
          }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const role = dbUser?.role;
  const status = dbUser?.status || "unknown";

  // Helper to send authorized PATCH to /api/users/me
  const authorizedPatch = async (payload) => {
    const idToken = await user.getIdToken(); // 👈 get fresh token
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // 👈 secure API call
      },
      body: JSON.stringify(payload),
    });
    return res;
  };

  // ---------- SAVE HANDLERS ----------

  // Candidate can always edit
  const saveCandidate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!candidateData.address || !candidateData.phone || !candidateData.age) {
      setError("Address, phone, and age are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await authorizedPatch({
        uid: user.uid, // backend may ignore this and use decoded token uid
        candidateProfile: {
          ...candidateData,
          age: Number(candidateData.age),
        },
      });

      if (!res.ok) throw new Error("Failed to save candidate profile.");
      setSuccess("Profile updated successfully.");
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // HR can edit ONLY when status is not "active"
  const saveHr = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (status === "active") {
      setError(
        "Your HR profile is already verified and locked. Contact support to change information."
      );
      return;
    }

    const required = [
      hrData.fullName,
      hrData.age,
      hrData.nidNumber,
      hrData.contactPhone,
      hrData.companyName,
      hrData.companyEmail,
      hrData.companyAddress,
      hrData.companyTenureDays,
    ];
    if (required.some((v) => !v)) {
      setError("Please fill in all required HR fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await authorizedPatch({
        uid: user.uid,
        hrProfile: {
          ...hrData,
          age: Number(hrData.age),
          companyTenureDays: Number(hrData.companyTenureDays),
        },
      });

      if (!res.ok) throw new Error("Failed to save HR profile.");
      setSuccess(
        "HR information submitted. Once the team marks you as active, your data will be locked."
      );
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save HR profile.");
    } finally {
      setSaving(false);
    }
  };

  // Company can edit ONLY when status is not "active"
  const saveCompany = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (status === "active") {
      setError(
        "Your company profile is already verified and locked. Contact support to change information."
      );
      return;
    }

    const required = [
      companyData.companyName,
      companyData.companyAddress,
      companyData.companyEmail,
      companyData.ownerName,
      companyData.ownerEmail,
      companyData.ownerPhone,
    ];
    if (required.some((v) => !v)) {
      setError("Please fill in all required company fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await authorizedPatch({
        uid: user.uid,
        companyProfile: {
          ...companyData,
        },
      });

      if (!res.ok) throw new Error("Failed to save company profile.");
      setSuccess(
        "Company information submitted. Once the team marks you as active, your data will be locked."
      );
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingProfile || !user || !dbUser) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" label="Loading profile..." />
        </div>
      </main>
    );
  }

  const fullCandidateName =
    candidateData.firstName || candidateData.lastName
      ? `${candidateData.firstName || ""} ${candidateData.lastName || ""
        }`.trim()
      : dbUser.name || dbUser.email;

  const hrCanEdit = role === "hr" && status !== "active";
  const companyCanEdit = role === "company" && status !== "active";

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-gray-600">
          Role:{" "}
          <span className="font-semibold capitalize">{role}</span>
          {role !== "candidate" && (
            <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-gray-100">
              Status:{" "}
              <span
                className={
                  status === "active" ? "text-green-600" : "text-orange-600"
                }
              >
                {status}
              </span>
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500">Email: {dbUser.email}</p>
      </header>

      {/* Global messages */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
          {success}
        </p>
      )}

      {/* CANDIDATE VIEW CARD (always editable) */}
      {role === "candidate" && (
        <section className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Candidate Information</h2>
              <p className="text-xs text-gray-500">
                This is your public profile for interviewers.
              </p>
            </div>
            <button
              onClick={() => setActiveModal("candidate")}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Full Name</p>
              <p className="font-medium text-gray-900">
                {fullCandidateName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Age</p>
              <p className="font-medium text-gray-900">
                {candidateData.age || "Not provided"}
              </p>

              <div className="space-y-1">
                <p className="text-gray-500 text-xs">CV / Resume URL</p>

                {candidateData.resumeUrl ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <a
                      href={candidateData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 underline text-xs sm:text-sm"
                    >
                    </a>
                    {/* {candidateData.resumeUrl} */}
                    <span className="text-[11px] font-semibold text-emerald-600">
                      Submitted
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-gray-900 text-xs sm:text-sm">
                      Apply to jobs must need submit
                    </span>
                    <span className="text-[11px] font-semibold text-red-600">
                      Not submitted
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs">Address</p>
              <p className="font-medium text-gray-900">
                {candidateData.address || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Phone</p>
              <p className="font-medium text-gray-900">
                {candidateData.phone || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">
                Website / Portfolio URL
              </p>
              <p className="font-medium text-gray-900">
                {candidateData.portfolioUrl || "Not provided"}
              </p>
              <br />
              <p className="text-gray-500 text-xs">
                Educational Qualification
              </p>
              <p className="font-medium text-gray-900">
                {candidateData.educationalQualification || "Not provided"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs">
                Current Job Position (if any)
              </p>
              <p className="font-medium text-gray-900">
                {candidateData.currentJobPosition || "Not provided"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs">Profile Image URL</p>
              <p className="font-medium text-gray-900 break-all">
                {candidateData.imageUrl || "Not provided"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* HR VIEW CARD */}
      {role === "hr" && (
        <section className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">HR Verification</h2>
              <p className="text-xs text-gray-500">
                Your status:{" "}
                <span
                  className={
                    status === "active" ? "text-green-600" : "text-orange-600"
                  }
                >
                  {status}
                </span>
              </p>
              {status === "active" && (
                <p className="mt-1 text-[11px] text-gray-500">
                  Your profile is verified and locked. Contact support if any
                  information is incorrect.
                </p>
              )}
            </div>
            <button
              onClick={() => hrCanEdit && setActiveModal("hr")}
              disabled={!hrCanEdit}
              className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border ${hrCanEdit
                  ? "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  : "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Full Name</p>
              <p className="font-medium text-gray-900">
                {hrData.fullName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Age</p>
              <p className="font-medium text-gray-900">
                {hrData.age || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">NID Number</p>
              <p className="font-medium text-gray-900">
                {hrData.nidNumber || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Contact Phone</p>
              <p className="font-medium text-gray-900">
                {hrData.contactPhone || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Company Name</p>
              <p className="font-medium text-gray-900">
                {hrData.companyName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Company Email</p>
              <p className="font-medium text-gray-900">
                {hrData.companyEmail || "Not provided"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs">Company Address</p>
              <p className="font-medium text-gray-900">
                {hrData.companyAddress || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">
                Days in current company
              </p>
              <p className="font-medium text-gray-900">
                {hrData.companyTenureDays || "Not provided"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* COMPANY VIEW CARD */}
      {role === "company" && (
        <section className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Company Verification</h2>
              <p className="text-xs text-gray-500">
                Your status:{" "}
                <span
                  className={
                    status === "active" ? "text-green-600" : "text-orange-600"
                  }
                >
                  {status}
                </span>
              </p>
              {status === "active" && (
                <p className="mt-1 text-[11px] text-gray-500">
                  Your company profile is verified and locked. Contact support
                  if any information needs to be changed.
                </p>
              )}
            </div>
            <button
              onClick={() => companyCanEdit && setActiveModal("company")}
              disabled={!companyCanEdit}
              className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border ${companyCanEdit
                  ? "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  : "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Company Name</p>
              <p className="font-medium text-gray-900">
                {companyData.companyName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Company Email</p>
              <p className="font-medium text-gray-900">
                {companyData.companyEmail || "Not provided"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs">Company Address</p>
              <p className="font-medium text-gray-900">
                {companyData.companyAddress || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Owner Name</p>
              <p className="font-medium text-gray-900">
                {companyData.ownerName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Owner Email</p>
              <p className="font-medium text-gray-900">
                {companyData.ownerEmail || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Owner Phone</p>
              <p className="font-medium text-gray-900">
                {companyData.ownerPhone || "Not provided"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ---------- MODALS ---------- */}

      {/* Candidate edit modal (always allowed) */}
      {activeModal === "candidate" && (
        <Modal
          title="Update Candidate Information"
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={saveCandidate} className="space-y-4">
            <p className="text-xs text-gray-500">
              Fields marked with <span className="text-red-500">*</span> are
              required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={candidateData.firstName}
                  onChange={(e) =>
                    setCandidateData((p) => ({
                      ...p,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={candidateData.lastName}
                  onChange={(e) =>
                    setCandidateData((p) => ({
                      ...p,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
                value={candidateData.address}
                onChange={(e) =>
                  setCandidateData((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                  value={candidateData.phone}
                  onChange={(e) =>
                    setCandidateData((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                  value={candidateData.age}
                  onChange={(e) =>
                    setCandidateData((p) => ({ ...p, age: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                Resume / CV URL <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={candidateData.resumeUrl}
                onChange={(e) =>
                  setCandidateData((p) => ({
                    ...p,
                    resumeUrl: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Portfolio / website URL (Optional)
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={candidateData.portfolioUrl}
                onChange={(e) =>
                  setCandidateData((p) => ({
                    ...p,
                    portfolioUrl: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Educational Qualification
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={candidateData.educationalQualification}
                onChange={(e) =>
                  setCandidateData((p) => ({
                    ...p,
                    educationalQualification: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Current Job Position (if any)
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={candidateData.currentJobPosition}
                onChange={(e) =>
                  setCandidateData((p) => ({
                    ...p,
                    currentJobPosition: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Profile Image URL (optional)
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={candidateData.imageUrl}
                onChange={(e) =>
                  setCandidateData((p) => ({
                    ...p,
                    imageUrl: e.target.value,
                  }))
                }
              />
            </div>


            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-2 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* HR edit modal (only when inactive) */}
      {activeModal === "hr" && (
        <Modal
          title="Update HR Information"
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={saveHr} className="space-y-4">
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertTriangle size={14} className="mt-0.5" />
              <p>
                Please provide <strong>real & accurate</strong> information.
                Once your HR status is marked <strong>active</strong> by the
                InterviewMate team, your profile will be{" "}
                <strong>locked and no longer editable</strong> from here.
              </p>
            </div>

            <p className="text-xs text-gray-500">
              All fields below are required for HR verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={hrData.fullName}
                  onChange={(e) =>
                    setHrData((p) => ({ ...p, fullName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={hrData.age}
                  onChange={(e) =>
                    setHrData((p) => ({ ...p, age: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                NID Number <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={hrData.nidNumber}
                onChange={(e) =>
                  setHrData((p) => ({ ...p, nidNumber: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={hrData.contactPhone}
                onChange={(e) =>
                  setHrData((p) => ({ ...p, contactPhone: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={hrData.companyName}
                onChange={(e) =>
                  setHrData((p) => ({ ...p, companyName: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Company Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={hrData.companyEmail}
                onChange={(e) =>
                  setHrData((p) => ({ ...p, companyEmail: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Company Address <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={hrData.companyAddress}
                onChange={(e) =>
                  setHrData((p) => ({ ...p, companyAddress: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Days in this company <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={hrData.companyTenureDays}
                onChange={(e) =>
                  setHrData((p) => ({
                    ...p,
                    companyTenureDays: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-2 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? "Submitting..." : "Submit verification info"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Company edit modal (only when inactive) */}
      {activeModal === "company" && (
        <Modal
          title="Update Company Information"
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={saveCompany} className="space-y-4">
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertTriangle size={14} className="mt-0.5" />
              <p>
                Please provide <strong>real company details</strong>. Once your
                company status is marked <strong>active</strong> by the
                InterviewMate team, this information will be{" "}
                <strong>locked and no longer editable</strong> from here.
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Provide accurate company details to help with verification.
            </p>

            <div>
              <label className="text-sm font-medium">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={companyData.companyName}
                onChange={(e) =>
                  setCompanyData((p) => ({
                    ...p,
                    companyName: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Company Address <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={companyData.companyAddress}
                onChange={(e) =>
                  setCompanyData((p) => ({
                    ...p,
                    companyAddress: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Company Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={companyData.companyEmail}
                onChange={(e) =>
                  setCompanyData((p) => ({
                    ...p,
                    companyEmail: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={companyData.ownerName}
                  onChange={(e) =>
                    setCompanyData((p) => ({
                      ...p,
                      ownerName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Owner Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={companyData.ownerEmail}
                  onChange={(e) =>
                    setCompanyData((p) => ({
                      ...p,
                      ownerEmail: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Owner Phone <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={companyData.ownerPhone}
                onChange={(e) =>
                  setCompanyData((p) => ({
                    ...p,
                    ownerPhone: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-2 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? "Submitting..." : "Submit company info"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
