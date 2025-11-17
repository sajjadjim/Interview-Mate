// This must be a Client Component for animations
"use client";

import { motion } from 'framer-motion';
// We'll use more business-focused icons for this page
import { 
  FaRegClock, 
  FaUsers, 
  FaChartLine, 
  FaCheckCircle, 
  FaLaptopCode, 
  FaCalendarAlt 
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

export default function OutsourcePage() {
  return (
    <div className="bg-white text-gray-800">

      {/* === 1. Hero Section === */}
      <section className="text-center py-24 px-6 bg-gray-900 text-white">
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Focus on Building. We'll Handle the Vetting.
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Outsource your technical interviews to our network of vetted experts. 
          Hire faster, with confidence.
        </motion.p>
        <motion.a
          href="/contact-sales"
          className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg 
                     hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Book a Demo
        </motion.a>
      </section>

      {/* === 2. The "Problem" Section (Pain Points) === */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Hiring is Hard. Technical Screening is Harder.
        </h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-16">
          Your best engineers are a critical resource. Don't let them become full-time interviewers.
        </p>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Pain Point 1: Wasted Time */}
          <motion.div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200" variants={fadeInUp}>
            <FaRegClock className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Engineer Time is Costly</h3>
            <p className="text-gray-700">
              Your best engineers spend 10+ hours a week conducting interviews instead of shipping product.
            </p>
          </motion.div>
          
          {/* Pain Point 2: Inconsistent */}
          <motion.div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200" variants={fadeInUp}>
            <FaUsers className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Inconsistent Feedback</h3>
            <p className="text-gray-700">
              Unstructured interviews lead to bias and inconsistent evaluations. Great candidates slip through the cracks.
            </p>
          </motion.div>

          {/* Pain Point 3: Slow Pipeline */}
          <motion.div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200" variants={fadeInUp}>
            <FaChartLine className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Slows Your Pipeline</h3>
            <p className="text-gray-700">
              Top talent is off the market in 10 days. Your slow, multi-stage screening process is losing them.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* === 3. "How It Works" Section (The Solution) === */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          A Simple, Powerful Solution
        </h2>
        
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Step 1 */}
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex-shrink-0 bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">1</div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Submit Your Candidate</h3>
              <p className="text-lg text-gray-700">
                Just send us the candidate's details and the job description. We handle all the scheduling and coordination.
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex-shrink-0 bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">2</div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Expert-Led Technical Interview</h3>
              <p className="text-lg text-gray-700">
                Our vetted industry experts conduct an in-depth, structured interview based on your role's specific requirements.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex-shrink-0 bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">3</div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Receive a Detailed Report</h3>
              <p className="text-lg text-gray-700">
                Get a comprehensive, actionable report in your inbox within hours. Make a data-driven "hire" / "no-hire" decision instantly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === 4. Key Features / Benefits === */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Everything You Need to Hire Smarter
        </h2>
        <motion.div 
          className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Feature 1 */}
          <motion.div className="flex items-start gap-4" variants={fadeInUp}>
            <FaCheckCircle className="text-3xl text-green-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-1">Elite Interviewer Network</h3>
              <p className="text-gray-700">
                Our interviewers are senior engineers and managers from top-tier companies, trained to be unbiased and effective.
              </p>
            </div>
          </motion.div>
          {/* Feature 2 */}
          <motion.div className="flex items-start gap-4" variants={fadeInUp}>
            <FaLaptopCode className="text-3xl text-green-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-1">Actionable, In-Depth Reports</h3>
              <p className="text-gray-700">
                Move beyond a simple "pass/fail". Get code playback, a detailed skill matrix, and a clear recommendation.
              </p>
            </div>
          </motion.div>
          {/* Feature 3 */}
          <motion.div className="flex items-start gap-4" variants={fadeInUp}>
            <FaCalendarAlt className="text-3xl text-green-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-1">Fast, Flexible Scheduling</h3>
              <p className="text-gray-700">
                We integrate with your calendar and can conduct interviews 24/7, often within 24 hours of your request.
              </p>
            </div>
          </motion.div>
          {/* Feature 4 */}
          <motion.div className="flex items-start gap-4" variants={fadeInUp}>
            <FaChartLine className="text-3xl text-green-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-1">Unbiased & Consistent</h3>
              <p className="text-gray-700">
                Every interview follows a structured, pre-defined rubric for the role, ensuring every candidate gets a fair and equal evaluation.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* === 5. Final Call to Action (CTA) === */}
      <section className="bg-blue-600 text-white py-24 px-6 text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Free Your Engineers. Supercharge Your Hiring.
        </motion.h2>
        <motion.p 
          className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          See how Interview Mate can integrate with your workflow and cut your time-to-hire in half.
        </motion.p>
        <motion.a
          href="/contact-sales"
          className="bg-white text-blue-600 font-bold py-4 px-10 rounded-lg shadow-2xl
                     hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Book Your Free Demo
        </motion.a>
      </section>
      
    </div>
  );
}