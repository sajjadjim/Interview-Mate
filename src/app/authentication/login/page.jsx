"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/app/lib/firebase";  // Firebase auth import
import { Loader2, LogIn } from "lucide-react";  // Icons from lucide-react
import { FaGoogle } from "react-icons/fa";  // Google icon from react-icons
import { motion } from "framer-motion";
import Link from "next/link";

// Import Phone Auth functions
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

import animationData from "../../../../public/Password Authentication.json"; // Your Lottie animation JSON file
import Lottie from "lottie-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // Phone number state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhoneLogin, setIsPhoneLogin] = useState(false); // Toggle for Phone Sign-In
  const [isOtpSent, setIsOtpSent] = useState(false); // To track if OTP was sent
  const [otp, setOtp] = useState(""); // OTP state
  const router = useRouter();

  // Handle email login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect after successful login
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignUp = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard"); // Redirect after successful Google login
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Phone Authentication Setup
  const handlePhoneSignUp = async () => {
    setLoading(true);
    setError("");
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      window.confirmationResult = confirmationResult;
      setIsOtpSent(true);
      setLoading(false);
    } catch (err) {
      setError("Phone number authentication failed. Please try again.");
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const confirmationResult = window.confirmationResult;

    try {
      await confirmationResult.confirm(otp);
      router.push("/dashboard"); // Redirect after successful phone authentication
    } catch (err) {
      setError("OTP verification failed. Please try again.");
      setLoading(false);
    }
  };

  // Set up reCAPTCHA
  const setUpRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
      size: "invisible",
      callback: (response) => {
        console.log("Recaptcha verified:", response);
      },
    }, auth);
  };

  // Toggle between Phone Login and Email Login
  const toggleLoginMethod = () => {
    setIsPhoneLogin(!isPhoneLogin);
    setIsOtpSent(false); // Reset OTP state if toggling
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen justify-center items-center p-6 md:p-12">
      {/* Lottie Animation (Left Side) */}
      <div className="w-full md:w-1/2 h-full mb-6 md:mb-0">
        <Lottie animationData={animationData} loop={true} className="w-full h-full" />
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

        {/* Toggle for Email, Phone, and Google Login */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => toggleLoginMethod()}
            className={`py-2 px-4 rounded-md ${!isPhoneLogin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Email Login
          </button>
          <button
            onClick={() => toggleLoginMethod()}
            className={`py-2 px-4 rounded-md ${isPhoneLogin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Phone Login
          </button>
        </div>

        {/* Form for Email or Phone login */}
        <form onSubmit={isPhoneLogin ? handleOtpSubmit : handleLogin} className="space-y-6">
          {!isPhoneLogin ? (
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
                  placeholder="Enter your password"
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

          {/* OTP Input for Phone */}
          {isOtpSent && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="otp" className="text-sm font-medium text-gray-700">Enter OTP</label>
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
                <LogIn size={18} />
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
          </motion.div>
        </form>

        {/* Google Sign-Up Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
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
          Don't have an account?{" "}
          <Link href="/authentication/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
