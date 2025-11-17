import Footer from "./components/Footer";
import "./globals.css";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="flex-grow bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Practice Interviews. Get Hired Faster.
          </h1>
          <p className="text-lg mb-6">
            InterviewMate helps you prepare for real-world job interviews with mock sessions, feedback, and direct employer connections.
          </p>
          <a
            href="/authentication/login"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Mock Interviews</h3>
          <p>Participate in category-specific mock interviews with internal trainers and real HRs.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Feedback & Grading</h3>
          <p>Receive structured feedback to improve your performance over time.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Job Opportunities</h3>
          <p>Apply directly to job postings from verified companies and get shortlisted faster.</p>
        </div>
      </section>
    </div>
  );
}
