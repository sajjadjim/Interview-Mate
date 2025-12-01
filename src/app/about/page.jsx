// ✨ NEW: This must be a Client Component to use animations
"use client";

// ✨ NEW: Import the 'motion' component from framer-motion
import { motion } from "framer-motion";

// ✨ NEW: Define some reusable animation variants
// This variant will be for containers that stagger their children's animations
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Time delay between each child animating in
    },
  },
};

// This variant will be for items that fade in and move up
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

// This variant will slide in from the left
const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

// This variant will slide in from the right
const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};


export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800">
      
      {/* === 1. Hero Section === */}
      {/* ✨ NEW: Replaced <section> with <motion.section> and added variants */}
      <motion.section 
        className="text-center py-20 px-6 bg-gray-50"
        variants={staggerContainer} // Use the container variant
        initial="hidden"
        animate="visible" // Animate on page load
      >
        {/* ✨ NEW: Added variants to children */}
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-blue-600 mb-4"
          variants={fadeInUp} // Use the fade-in-up variant
        >
          About Interview Mate
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
          variants={fadeInUp} // Use the fade-in-up variant
        >
          Bridging the Gap Between Ambitious Talent and Innovative Companies.
        </motion.p>
      </motion.section>

      {/* === 2. Our Mission Section === */}
      {/* ✨ NEW: Using 'whileInView' to trigger animation on scroll */}
      <motion.section 
        className="py-16 px-6 max-w-5xl mx-auto"
        initial="hidden"
        whileInView="visible" // Triggers animation when section enters viewport
        viewport={{ once: true, amount: 0.3 }} // Animate once, when 30% is visible
        variants={staggerContainer} // Stagger the two children
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* ✨ NEW: Added slide-in-from-left animation */}
          <motion.div variants={slideInLeft}>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4">
              Landing your dream job is more than just a good resume. It’s about
              communication, confidence, and connection. We saw countless
              talented students struggling to showcase their skills in a
              high-pressure interview setting.
            </p>
            <p className="text-lg text-gray-700">
              On the other side, we saw companies searching for the right talent
              but buried in applications. **Interview Mate was born to fix
              this.** We create a direct, real-time bridge, helping students
              prove their skills and recruiters find the perfect fit.
            </p>
          </motion.div>
          {/* ✨ NEW: Added slide-in-from-right animation */}
          <motion.div variants={slideInRight}>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">[Image: Teamwork or Connection]<img alt="Teamwork or Connection" /></span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <hr className="max-w-5xl mx-auto" />

      {/* === 3. What We Do (For Students & HR) === */}
      <motion.section 
        className="py-16 px-6 bg-blue-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp} // The whole section fades in
      >
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">How We Help</h2>
          <p className="text-lg text-gray-700">
            We provide a dedicated platform for topic-specific, real-time
            interviewing that benefits everyone.
          </p>
        </div>

        {/* ✨ NEW: This grid will now stagger its children (the two cards) */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={staggerContainer} // Use stagger for the cards
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* ✨ NEW: Card 1 with fade-in-up animation */}
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-semibold text-blue-600 mb-3">
              For Students
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {/* ...list items... */}
              <li>
                **Practice Perfection:** Take demo interviews on your own time
                to build confidence.
              </li>
              <li>
                **Real-World Experience:** Participate in live, scheduled
                interviews with real company HRs.
              </li>
              <li>
                **Showcase Your Skills:** Prove your knowledge on the exact
                topics you excel in.
              </li>
              <li>
                **Get Discovered:** Connect directly with companies that are
                actively hiring.
              </li>
            </ul>
          </motion.div>

          {/* ✨ NEW: Card 2 with fade-in-up animation */}
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-semibold text-green-600 mb-3">
              For Company HR
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {/* ...list items... */}
              <li>
                **Discover Top Talent:** Move beyond resumes and see candidates
                in action.
              </li>
              <li>
                **Streamline Hiring:** Easily find and schedule candidates for
                topic-specific interviews.
              </li>
              <li>
                **Real-Time Evaluation:** Conduct live video interviews to
                assess skills and cultural fit instantly.
              </li>
              <li>
                **Build Your Talent Pipeline:** Connect with promising students
                before they even graduate.
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* === 4. Our Technology Section === */}
      <motion.section 
        className="py-16 px-6 max-w-5xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp} // Section fades in
      >
        <h2 className="text-3xl font-bold mb-4">Our Technology</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          We believe in a seamless experience. Our platform is built using
          modern, advanced technologies like **Next.js** to ensure it is
          fast, reliable, and secure. We focus on providing a crystal-clear,
          real-time video connection so you can focus on the conversation, not
          the connection quality.
        </p>
      </motion.section>

      {/* === 5. Call to Action (CTA) Section === */}
      <motion.section 
        className="bg-blue-600 text-white py-20 px-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp} // Section fades in
      >
        <h2 className="text-3xl font-bold mb-6">
          Ready to Take the Next Step?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Whether you're a student ready to launch your career or a recruiter
          looking for the next great hire, your journey starts here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          {/* ✨ NEW: Added hover animation to the button */}
          <motion.a
            href="/register/student"
            className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
            whileHover={{ scale: 1.05 }} // Scales up on hover
            whileTap={{ scale: 0.95 }} // Scales down on click
          >
            Sign Up as a Student
          </motion.a>
          
          {/* ✨ NEW: Added hover animation to the button */}
          <motion.a
            href="/register/company"
            className="bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
            whileHover={{ scale: 1.05 }} // Scales up on hover
            whileTap={{ scale: 0.95 }} // Scales down on click
          >
            Register as a Company
          </motion.a>
        </div>
      </motion.section>
    </div>
  );
}