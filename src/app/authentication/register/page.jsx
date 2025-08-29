"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";  // Firebase auth import
import { Loader2, UserPlus } from "lucide-react";  // Icons from lucide-react
import { FaGoogle } from "react-icons/fa";  // Google icon from react-icons
import { motion } from "framer-motion";
import Link from "next/link";

import animationData from "../../../../public/animation.json"; // Path to your Lottie animation JSON
import Lottie from "lottie-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState(""); // Phone number state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhoneSignUp, setIsPhoneSignUp] = useState(false); // Toggle for Phone Sign-Up
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to dashboard after successful registration
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard"); // Redirect after successful Google login
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen justify-center items-center p-4">
      {/* Background Image and Lottie Animation */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Lottie animationData={animationData} loop={true} className="w-full h-full" />
      </div>

      {/* Form Container */}
      <motion.div
        className="relative max-w-md w-full bg-white/60 backdrop-blur-lg p-8 rounded-xl shadow-xl z-10 mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Sign Up for <span className="text-blue-600">InterviewMate</span>
        </h2>

        {/* Toggle for Email or Phone Sign Up */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setIsPhoneSignUp(false)}
            className={`py-2 px-4 rounded-md ${!isPhoneSignUp ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Email Sign Up
          </button>
          <button
            onClick={() => setIsPhoneSignUp(true)}
            className={`py-2 px-4 rounded-md ${isPhoneSignUp ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Phone Sign Up
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          {!isPhoneSignUp ? (
            <>
              {/* Email Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </motion.div>
            </>
          ) : (
            <>
              {/* Phone Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+880 1XXX-XXXXXX"
                  className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </motion.div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <motion.p
              className="text-red-500 text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
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
              {loading ? "Registering..." : "Create Account"}
            </button>
          </motion.div>
        </form>

        {/* Google Sign-Up Button */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full py-3 mt-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <FaGoogle size={18} />
            {loading ? "Signing in..." : "Sign Up with Google"}
          </button>
        </motion.div>

        {/* Register Link */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/authentication/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
