// This must be a Client Component to use state and effects
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// ✨ NEW: Import from 'react-icons/fa' (Font Awesome 5)
import { 
  FaLaptopCode,         // Replaced FaComputer
  FaUserMd,             // Replaced FaUserDoctor
  FaCogs,               // Replaced FaGears
  FaChalkboardTeacher,  // Same
  FaUserTie,            // Same
  FaLandmark,           // Replaced FaBuildingColumns
  FaArrowLeft           // Same
} from 'react-icons/fa'; // ✨ CHANGED from 'fa6'

// --- (Mock Data) ---
const categories = [
  { 
    name: 'IT & Software', 
    slug: 'it',
    icon: <FaLaptopCode />, // ✨ UPDATED
    jobCount: 72 
  },
  { 
    name: 'Medical & Health', 
    slug: 'medical',
    icon: <FaUserMd />,     // ✨ UPDATED
    jobCount: 45 
  },
  { 
    name: 'Technical & Engineering', 
    slug: 'technical',
    icon: <FaCogs />,       // ✨ UPDATED
    jobCount: 58 
  },
  { 
    name: 'Teaching & Education', 
    slug: 'teaching',
    icon: <FaChalkboardTeacher />, 
    jobCount: 31 
  },
  { 
    name: 'Professional Services', 
    slug: 'professional',
    icon: <FaUserTie />, 
    jobCount: 88 
  },
  { 
    name: 'Banking & Finance', 
    slug: 'finance',
    icon: <FaLandmark />,   // ✨ UPDATED
    jobCount: 62 
  },
];

// This is a MOCK function to simulate fetching data
// Replace this with your actual API call to Node.js
const fetchJobsFromAPI = async (categorySlug) => {
  console.log(`Fetching jobs for category: ${categorySlug}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 750));
  
  // Returning mock data for the demo
  return [
    { id: 1, title: 'Senior React Developer', company: 'TechCorp', location: 'Remote' },
    { id: 2, title: 'Node.js Backend Engineer', company: 'ServerSide Inc.', location: 'Dhaka' },
    { id: 3, title: 'DevOps Specialist', company: 'CloudBase', location: 'Remote' },
  ].filter(() => categorySlug === 'it'); // Only show for IT demo
};

// --- Animation Variants for Framer Motion ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// --- The Page Component ---
export default function JobsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setIsLoading(true);
    
    // Fetch jobs from your Node.js backend
    const fetchedJobs = await fetchJobsFromAPI(category.slug);
    
    setJobs(fetchedJobs);
    setIsLoading(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setJobs([]);
  };

  // === View 1: Show Job Categories ===
  const renderCategoryView = () => (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {categories.map((category) => (
        <motion.div
          key={category.slug}
          className="bg-white p-6 rounded-lg shadow-lg text-center cursor-pointer
                     transition-all duration-300 hover:shadow-xl hover:scale-105"
          onClick={() => handleCategoryClick(category)}
          variants={cardVariants}
        >
          <div className="text-blue-600 text-5xl mx-auto mb-4">
            {category.icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {category.name}
          </h3>
          <p className="text-gray-500">
            {category.jobCount} open positions
          </p>
        </motion.div>
      ))}
    </motion.div>
  );

  // === View 2: Show Job Listings for a Category ===
  const renderJobListView = () => (
    <div>
      {/* --- Back Button --- */}
      <button
        onClick={handleBackToCategories}
        className="flex items-center gap-2 text-blue-600 font-semibold mb-6
                   hover:text-blue-800 transition-colors"
      >
        <FaArrowLeft />
        Back to Categories
      </button>

      <h2 className="text-3xl font-bold mb-6">
        Showing jobs for: {selectedCategory.name}
      </h2>

      {/* --- Loading Spinner (Optional but recommended) --- */}
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-lg">Loading jobs...</p>
        </div>
      )}

      {/* --- Job List --- */}
      {!isLoading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              className="bg-white p-5 rounded-lg shadow-md border border-gray-200
                         flex flex-col sm:flex-row justify-between sm:items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h3 className="text-xl font-semibold text-blue-700">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-gray-500 text-sm mt-1">{job.location}</p>
              </div>
              <a
                href={`/jobs/${job.id}`} // Link to the specific job details page
                className="bg-blue-600 text-white font-semibold py-2 px-5 
                           rounded-lg shadow hover:bg-blue-700 transition-colors
                           mt-4 sm:mt-0"
              >
                View Details
              </a>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- No Jobs Found --- */}
      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-700">No Jobs Found</h3>
          <p className="text-gray-500 mt-2">
            There are currently no open positions for {selectedCategory.name}.
          </p>
        </div>
      )}
    </div>
  );

  // --- Main Render ---
  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* === 1. Hero Section === */}
      <section className="text-center py-20 px-6 bg-white shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Find Your Next Opportunity
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          Browse open positions across all industries and find your perfect fit.
        </p>
      </section>
      
      {/* === 2. Main Content (Categories or Job List) === */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        {selectedCategory ? renderJobListView() : renderCategoryView()}
      </section>

    </div>
  );
}