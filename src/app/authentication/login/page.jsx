"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, LogIn, X } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Lottie from "lottie-react";
import Swal from "sweetalert2";
import animationData from "../../../../public/Password Authentication.json";

export default function LoginPage() {
  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Forgot Password States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const router = useRouter();
  const { login } = useAuth();

  // ---------------- EMAIL LOGIN ----------------
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (isPhoneLogin) return;

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PHONE LOGIN SETUP ----------------
  useEffect(() => {
    if (isPhoneLogin && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved
          },
        }
      );
    }
  }, [isPhoneLogin]);

  const handlePhoneSendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      if (!phone) {
        setError("Please enter your phone number.");
        setLoading(false);
        return;
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );

      window.confirmationResult = confirmationResult;
      setIsOtpSent(true);
      Swal.fire("OTP Sent!", "Check your phone for the code.", "success");
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Ensure format is +8801XXXXXXXXX");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        setError("Session expired. Please request OTP again.");
        return;
      }

      await confirmationResult.confirm(otp);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

// ... inside your LoginPage component

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      Swal.fire("Error", "Please enter your email address", "error");
      return;
    }

    // Loading State
    Swal.fire({
      title: 'Checking Account...',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        // SUCCESS: Email sent
        Swal.fire(
          "Check Your Inbox",
          "We sent a reset link to your email.",
          "success"
        );
        setShowResetModal(false);
        setResetEmail("");
      } else {
        // ERROR: Show the specific reason (Google/Phone/Not Found)
        // This will now say: "You signed up with Google. Please click..."
        Swal.fire("Cannot Reset Password", data.error, "warning");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    }
  };

  // ---------------- UI TOGGLES ----------------
  const showEmailLogin = () => {
    setIsPhoneLogin(false);
    setIsOtpSent(false);
    setError("");
  };

  const showPhoneLogin = () => {
    setIsPhoneLogin(true);
    setIsOtpSent(false);
    setError("");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen justify-center items-center p-6 md:p-12 relative">
      
      {/* Lottie Animation */}
      <div className="w-full md:w-1/2 h-full mb-6 md:mb-0">
        <Lottie
          animationData={animationData}
          loop={true}
          className="w-full h-full max-h-[500px]"
        />
      </div>

      {/* Login Form */}
      <motion.div
        className="w-full md:w-1/2 bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">
          Sign in to <span className="text-blue-600 font-semibold">InterviewMate</span>
        </p>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-6 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
          <button
            type="button"
            onClick={showEmailLogin}
            className={`py-2 px-6 rounded-md text-sm font-medium transition-all ${
              !isPhoneLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={showPhoneLogin}
            className={`py-2 px-6 rounded-md text-sm font-medium transition-all ${
              isPhoneLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Phone
          </button>
        </div>

        <div id="recaptcha-container" className="hidden" />

        {/* EMAIL FORM */}
        {!isPhoneLogin && (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-70 transition flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}

        {/* PHONE FORM */}
        {isPhoneLogin && (
          <form onSubmit={isOtpSent ? handleOtpSubmit : (e) => e.preventDefault()} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+8801XXXXXXXXX"
                className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {!isOtpSent && (
              <button
                type="button"
                onClick={handlePhoneSendOtp}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-70 transition flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP Code"}
              </button>
            )}

            {isOtpSent && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <label className="text-sm font-medium text-gray-700">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg"
                />
                
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-70 transition flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Login"}
                </button>
              </motion.div>
            )}
          </form>
        )}

        {/* Social Login Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg flex items-center justify-center gap-3 transition"
        >
          <FaGoogle className="text-red-500" size={20} />
          <span>Sign in with Google</span>
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
          New to InterviewMate?{" "}
          <Link href="/authentication/register" className="text-blue-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email address to receive a secure reset link.
              </p>

              <form onSubmit={handlePasswordReset}>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 mt-1 mb-6 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}