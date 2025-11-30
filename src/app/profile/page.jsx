"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Load profile from DB
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoadingProfile(true);
      setError("");
      setSuccess("");

      try {
        const res = await fetch(`/api/users/me?uid=${user.uid}`);
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

  // ---------- SAVE HANDLERS ----------
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
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          candidateProfile: {
            ...candidateData,
            age: Number(candidateData.age),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save candidate profile.");
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveHr = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          hrProfile: {
            ...hrData,
            age: Number(hrData.age),
            companyTenureDays: Number(hrData.companyTenureDays),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save HR profile.");
      setSuccess(
        "HR information submitted. Your status will stay inactive until verified by the team."
      );
    } catch (err) {
      console.error(err);
      setError("Failed to save HR profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveCompany = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          companyProfile: {
            ...companyData,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save company profile.");
      setSuccess(
        "Company information submitted. Your status will stay inactive until verified by the team."
      );
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

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-gray-600">
          Role: <span className="font-semibold capitalize">{role}</span>{" "}
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

      {/* Candidate form */}
      {role === "candidate" && (
        <form onSubmit={saveCandidate} className="space-y-4 bg-white p-4 rounded-xl border">
          <h2 className="text-lg font-semibold mb-1">Candidate Information</h2>
          <p className="text-xs text-gray-500 mb-2">
            Fields marked with * are required.
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
                setCandidateData((p) => ({ ...p, imageUrl: e.target.value }))
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Later you can plug this into Firebase Storage or Cloudinary.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      )}

      {/* HR form */}
      {role === "hr" && (
        <form onSubmit={saveHr} className="space-y-4 bg-white p-4 rounded-xl border">
          <h2 className="text-lg font-semibold mb-1">HR Verification</h2>
          <p className="text-xs text-gray-500 mb-2">
            Your account status is <strong>{status}</strong>. Submit this
            information to be verified by the team.
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
              How many days you are in this company?{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={hrData.companyTenureDays}
              onChange={(e) =>
                setHrData((p) => ({ ...p, companyTenureDays: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? "Submitting..." : "Submit verification info"}
          </button>
        </form>
      )}

      {/* Company form */}
      {role === "company" && (
        <form
          onSubmit={saveCompany}
          className="space-y-4 bg-white p-4 rounded-xl border"
        >
          <h2 className="text-lg font-semibold mb-1">Company Verification</h2>
          <p className="text-xs text-gray-500 mb-2">
            Your account status is <strong>{status}</strong>. Submit company
            information to get verified and then post jobs.
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

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? "Submitting..." : "Submit company info"}
          </button>
        </form>
      )}
    </main>
  );
}
