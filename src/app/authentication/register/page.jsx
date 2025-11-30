"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, UserPlus } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "../../../../public/Password Authentication.json";

const ROLE_OPTIONS = [
  { value: "company", label: "Company", desc: "Post jobs & manage hiring" },
  { value: "hr", label: "HR", desc: "Handle interviews & candidates" },
  { value: "candidate", label: "Candidate", desc: "Search & apply for jobs" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth(); // from AuthContext

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (value) => {
    setRole(value);
    setError("");
  };

  // EMAIL/PASSWORD SIGNUP
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role (Company, HR, or Candidate).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cred = await signup(email, password);
      const firebaseUser = cred.user;

      await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name,
          role,
        }),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with this email.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGNUP
  const handleGoogleSignup = async () => {
    if (!role) {
      setError("Please select a role first, then continue with Google.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || name || "",
          role,
        }),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen justify-center items-center p-6 md:p-12">
      {/* Lottie Animation (Left Side) */}
      <div className="w-full md:w-1/2 h-full mb-6 md:mb-0">
        <Lottie
          animationData={animationData}
          loop={true}
          className="w-full h-full"
        />
      </div>

      {/* Register Form (Right Side) */}
      <motion.div
        className="w-full md:w-1/2 bg-white/60 backdrop-blur-lg p-8 rounded-xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Create your <span className="text-blue-600">InterviewMate</span> account
        </h2>

        {/* ROLE SELECT */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Choose your role
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLE_OPTIONS.map((r) => {
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRoleSelect(r.value)}
                  className={`text-left border rounded-lg p-3 text-sm transition ${
                    active
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <p
                    className={`font-semibold mb-1 ${
                      active ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-600">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* EMAIL SIGNUP FORM */}
        <form onSubmit={handleEmailSignup} className="space-y-5">
          {/* Name */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
          >
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </motion.div>

          {/* Email */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
          >
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email (Gmail)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@gmail.com"
              className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </motion.div>

          {/* Password */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
          >
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a strong password"
              className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </motion.div>

          {/* Error */}
          {error && (
            <motion.p
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </motion.div>
        </form>

        {/* OR divider */}
        <div className="my-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            OR
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google signup */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.25 }}
        >
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <FaGoogle size={18} />
            {loading ? "Processing..." : "Continue with Google"}
          </button>
        </motion.div>

        {/* Login link */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/authentication/login"
            className="text-blue-600 hover:underline"
          >
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
