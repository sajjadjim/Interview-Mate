"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "@/lib/firebase"; // 👈 make sure this points to your firebase.js
import { useAuth } from "@/context/AuthContext"; // 👈 from the AuthProvider we created
import { Loader2, LogIn } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "../../../../public/Password Authentication.json"; // your Lottie file

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const router = useRouter();
  const { login } = useAuth(); // 👈 global Firebase email/password login

  // ---------------- EMAIL LOGIN ----------------
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (isPhoneLogin) return; // safety, should not hit here in phone mode

    setLoading(true);
    setError("");

    try {
      await login(email, password); // 👈 uses AuthContext (signInWithEmailAndPassword inside)
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
      // onAuthStateChanged in AuthContext will sync user to DB
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RECAPTCHA SETUP (PHONE) ----------------
  const setUpRecaptcha = () => {
    if (typeof window === "undefined") return;

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible", // or "normal" if you want to show the widget
          callback: (response) => {
            console.log("reCAPTCHA verified:", response);
          },
        },
        auth
      );
    }
  };

  // ---------------- SEND OTP (PHONE) ----------------
  const handlePhoneSendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      if (!phone) {
        setError("Please enter your phone number.");
        setLoading(false);
        return;
      }

      setUpRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );

      window.confirmationResult = confirmationResult;
      setIsOtpSent(true);
    } catch (err) {
      console.error(err);
      setError("Phone number authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY OTP (PHONE) ----------------
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        setError("Please request an OTP first.");
        setLoading(false);
        return;
      }

      await confirmationResult.confirm(otp);
      // onAuthStateChanged in AuthContext will sync user to DB
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TOGGLE LOGIN METHOD ----------------
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
    <div className="flex flex-col md:flex-row min-h-screen justify-center items-center p-6 md:p-12">
      {/* Lottie Animation (Left Side) */}
      <div className="w-full md:w-1/2 h-full mb-6 md:mb-0">
        <Lottie
          animationData={animationData}
          loop={true}
          className="w-full h-full"
        />
      </div>

      {/* Login Form (Right Side) */}
      <motion.div
        className="w-full md:w-1/2 bg-white/60 backdrop-blur-lg p-8 rounded-xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Sign In to <span className="text-blue-600">InterviewMate</span>
        </h2>

        {/* Toggle for Email vs Phone Login */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={showEmailLogin}
            className={`py-2 px-4 rounded-md ${
              !isPhoneLogin
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={showPhoneLogin}
            className={`py-2 px-4 rounded-md ${
              isPhoneLogin
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Phone Login
          </button>
        </div>

        {/* Invisible reCAPTCHA container (required for phone auth) */}
        <div id="recaptcha-container" className="hidden" />

        {/* EMAIL LOGIN FORM */}
        {!isPhoneLogin && (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email Input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
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
                placeholder="Enter your password"
                className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </motion.div>

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
                  <LogIn size={18} />
                )}
                {loading ? "Logging in..." : "Login"}
              </button>
            </motion.div>
          </form>
        )}

        {/* PHONE LOGIN FLOW */}
        {isPhoneLogin && (
          <form
            onSubmit={isOtpSent ? handleOtpSubmit : (e) => e.preventDefault()}
            className="space-y-6"
          >
            {/* Phone Input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
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

            {/* Send OTP button */}
            {!isOtpSent && (
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={handlePhoneSendOtp}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <LogIn size={18} />
                  )}
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </motion.div>
            )}

            {/* OTP Input */}
            {isOtpSent && (
              <>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium text-gray-700"
                  >
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="Enter the OTP sent to your phone"
                    className="w-full px-4 py-3 mt-2 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </motion.div>

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

                {/* Verify OTP Button */}
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
                      <LogIn size={18} />
                    )}
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>
                </motion.div>
              </>
            )}
          </form>
        )}

        {/* Google Sign-In Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 mt-6 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <FaGoogle size={18} />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        </motion.div>

        {/* Register Link */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/authentication/register"
            className="text-blue-600 hover:underline"
          >
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
