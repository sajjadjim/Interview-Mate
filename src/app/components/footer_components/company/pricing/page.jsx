// This must be a Client Component for the toggle
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
// ✨ Make sure this import line is at the top of your file
import { 
  FaCheckCircle, 
  FaLaptopCode, 
  FaGears, // <-- This is the one you are missing
  FaUserTie, 
  FaArrowRight 
} from 'react-icons/fa';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function PricingPage() {
  // 'monthly' or 'yearly'
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Define your prices here
  const prices = {
    perInterview: {
      general: '৳130',
      technical: '৳150',
      it: '৳170',
    },
    pro: {
      weekly: '৳150',
      monthly: '৳500',
      yearly: '৳5000', // (This is ৳416/mo, a discount)
    },
    company: {
      perInterview: '৳2000'
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* === 1. Hero Section === */}
      <section className="text-center py-20 px-6 bg-white shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Find the Plan That's Right for You
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          Buy a single mock interview or subscribe for unlimited access to all our tools.
        </p>
      </section>
      
      {/* === 2. NEW: Pay-Per-Interview Section === */}
      <motion.section 
        className="py-16 px-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          Practice with a Live Expert
        </h2>
        <p className="text-lg text-gray-600 text-center mb-10">
          Book a single, 45-minute mock interview with a real industry professional.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="space-y-5">
            
            {/* --- IT Interview --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <FaLaptopCode className="text-3xl text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">IT & Software Interview</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-blue-700">{prices.perInterview.it}</span>
                <a href="/book/it" className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Book Now <FaArrowRight />
                </a>
              </div>
            </div>

            {/* --- Technical Interview --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                {/* <FaGears className="text-3xl text-gray-600" /> */}
                <h3 className="text-xl font-semibold text-gray-800">Technical & Engineering</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-900">{prices.perInterview.technical}</span>
                <a href="/book/technical" className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Book Now <FaArrowRight />
                </a>
              </div>
            </div>

            {/* --- General Interview --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <FaUserTie className="text-3xl text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-800">General & Behavioral</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-900">{prices.perInterview.general}</span>
                <a href="/book/general" className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Book Now <FaArrowRight />
                </a>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* === 3. Subscription Section === */}
      <section className="py-12 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-4">
          Or, Get Unlimited Access
        </h2>
        <p className="text-lg text-gray-600 text-center mb-10">
          Subscribe to unlock all features, including our AI interviewer.
        </p>

        {/* --- Billing Toggle --- */}
        <div className="flex justify-center mb-10">
          <div className="relative flex p-1 bg-gray-300 rounded-lg shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 py-2 px-6 rounded-md font-semibold transition-colors
                ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 py-2 px-11 pr-2 rounded-md text-md font-semibold transition-colors
                ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
            >
              Yearly (Save 17%)
            </button>
            <motion.div
              className="absolute top-1 bottom-1 left-1 bg-blue-600 rounded-lg shadow"
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              animate={{ x: billingCycle === 'monthly' ? 0 : '100%' }}
              style={{ width: '50%' }}
            />
          </div>
        </div>

        {/* --- Pricing Tiers --- */}
        <motion.div 
          className="px-6 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* --- Tier 1: Basic (Free) --- */}
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex flex-col"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, shadow: 'xl' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-semibold text-gray-800">Basic</h3>
              <p className="text-gray-500 mt-2">For students getting started</p>
              
              <div className="text-4xl font-bold text-gray-900 my-6">
                ৳0 <span className="text-lg font-normal text-gray-500">/ forever</span>
              </div>

              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Access to job board
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Free practice questions
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  1 free AI practice interview
                </li>
              </ul>
              
              <a
                href="/register/student"
                className="mt-auto w-full text-center bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg 
                           hover:bg-gray-300 transition-colors"
              >
                Sign Up for Free
              </a>
            </motion.div>

            {/* --- Tier 2: Pro (Paid) --- */}
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-2xl border-4 border-blue-600 flex flex-col relative"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white
                              font-semibold py-1 px-4 rounded-full text-sm">
                MOST POPULAR
              </div>

              <h3 className="text-2xl font-semibold text-blue-600">Student Pro</h3>
              <p className="text-gray-500 mt-2">Unlock your full potential</p>
              
              <div className="text-4xl font-bold text-gray-900 my-6">
                {billingCycle === 'monthly' ? prices.pro.monthly : prices.pro.yearly}
                <span className="text-lg font-normal text-gray-500">
                  {billingCycle === 'monthly' ? ' / month' : ' / year'}
                </span>
              </div>
              
              <p className="text-center text-gray-600 mb-6 font-medium">
                Also available: {prices.pro.weekly} / week
              </p>

              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-center gap-2 font-semibold">
                  <FaCheckCircle className="text-green-500" />
                  Unlimited AI Mock Interviews
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <FaCheckCircle className="text-green-500" />
                  All 500+ Practice Questions
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Access to live interview slots
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  AI-powered feedback
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Resume & Profile builder
                </li>
              </ul>
              
              <a
                href="/register/pro"
                className="mt-auto w-full text-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg 
                           shadow-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </a>
            </motion.div>

            {/* --- Tier 3: Company (B2B) --- */}
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex flex-col"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, shadow: 'xl' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-semibold text-gray-800">For Companies</h3>
              <p className="text-gray-500 mt-2">Outsource your tech screening</p>
              
              <div className="text-4xl font-bold text-gray-900 my-6">
                {prices.company.perInterview}
                <span className="text-lg font-normal text-gray-500"> / per interview</span>
              </div>
              <p className="text-center text-gray-600 mb-6 font-medium">
                Or custom enterprise plans
              </p>

              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Expert-led technical interviews
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Detailed candidate reports
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Access to student talent pool
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Company branding
                </li>
              </ul>
              
              <a
                href="/contact-sales"
                className="mt-auto w-full text-center bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg 
                           hover:bg-gray-900 transition-colors"
              >
                Contact Sales
              </a>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* === 4. FAQ Section === */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg">What's the difference between a "Live Expert" and an "AI" interview?</h3>
            <p className="text-gray-600 mt-2">
              A **Live Expert** interview is a scheduled, 45-minute video call with a real industry professional. An **AI Interview** is an automated, on-demand session where our AI asks you questions and provides instant feedback.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg">Can I cancel my subscription?</h3>
            <p className="text-gray-600 mt-2">
              Yes, you can cancel your monthly or yearly subscription at any time. You will retain access to Pro features until the end of your billing period.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg">What payments do you accept?</h3>
            <p className="text-gray-600 mt-2">
              We accept all major credit cards, as well as local payment methods like bKash and Nagad.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}