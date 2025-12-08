"use client";

import { useEffect, useState } from "react";
import "./globals.css";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import {
  Video,
  Sparkles,
  CalendarDays,
  Star,
  Send,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  X,
  Briefcase,
  GraduationCap,
  Users,
  Quote
} from "lucide-react";

export default function Home() {
  // --- State for Reviews ---
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the first visible card
  const [loadingReviews, setLoadingReviews] = useState(true);

  // --- State for Form & UI ---
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    contact: "",
    comment: "",
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // --- Fetch Reviews on Load ---
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews");
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, []);

  // --- Auto-Slide Logic ---
  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000); // Slide every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [reviews.length]);

  // --- Navigation Handlers ---
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  // --- Helper: Get 3 visible reviews (Responsive Loop) ---
  const getVisibleReviews = () => {
    if (reviews.length === 0) return [];
    const visibleItems = [];
    for (let i = 0; i < 3; i++) {
      // Modulo logic ensures we loop back to start if we reach end
      const index = (currentIndex + i) % reviews.length;
      visibleItems.push(reviews[index]);
    }
    return visibleItems;
  };

  const visibleReviews = getVisibleReviews();

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (stars) => {
    setFormData((prev) => ({ ...prev, rating: stars }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setSubmitMessage("Thank you! Your feedback has been submitted.");
        setFormData({ name: "", profession: "", contact: "", comment: "", rating: 5 });
        const newReview = await res.json();
        if(newReview.success) {
            setReviews(prev => [newReview.data, ...prev]);
        }
        setTimeout(() => {
            setShowReviewForm(false);
            setSubmitMessage("");
        }, 3000);
      } else {
        setSubmitMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      setSubmitMessage("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top navigation */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:justify-between md:py-20">
          <div className="max-w-xl space-y-6 text-center md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
              <Sparkles className="h-3 w-3" />
              Built for Bangladeshi job seekers & HR
            </p>

            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              Practice interviews.
              <br />
              <span className="text-yellow-300">Get hired faster.</span>
            </h1>

            <p className="text-sm leading-relaxed text-blue-100 md:text-base">
              InterviewMate connects candidates, trainers and HR professionals
              to run realistic mock interviews, share structured feedback, and
              apply directly to verified jobs in Bangladesh.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <a
                href="/authentication/login"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-50"
              >
                Get Started Free
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Learn how it works
              </a>
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl bg-white/95 p-5 text-slate-900 shadow-2xl ring-1 ring-slate-200/60 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your mock interview at a glance
            </p>
            <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">
                  Role: Junior Software Engineer
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  IT Sector
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                  <CalendarDays className="h-3 w-3" /> Tomorrow, 8 PM
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                  <Video className="h-3 w-3" /> Live video call
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature / Steps section */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
            How InterviewMate works
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((step, idx) => (
              <div key={step} className="flex flex-col rounded-2xl bg-slate-50 p-5 shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Step {step}
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {idx === 0 ? "Create Profile" : idx === 1 ? "Book Slot" : "Join & Learn"}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {idx === 0 
                    ? "Sign up as candidate, HR, or company. Add basic details." 
                    : idx === 1 
                    ? "Choose your topic and time slot that fits your schedule." 
                    : "Attend session, get feedback, and apply for jobs."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIAL SLIDER --- */}
      <section className="bg-slate-50 py-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold tex0t-slate-900 md:text-3xl">
            What people say about us
          </h2>
          <p className="mt-2 text-sm text-slate-600 mb-10">
            Real feedback from candidates and HRs who used InterviewMate.
          </p>

          <div className="relative">
            {loadingReviews ? (
              <div className="flex h-40 items-center justify-center text-slate-400">
                Loading reviews...
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ease-in-out">
                {visibleReviews.map((review, idx) => (
                  <div 
                    key={`${review._id}-${idx}`} 
                    className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-500"
                  >
                    <div>
                      {/* Rating Stars */}
                      <div className="mb-4 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <div className="relative">
                        <Quote className="absolute -left-2 -top-2 h-6 w-6 text-indigo-100 -scale-x-100 opacity-50" />
                        <p className="relative z-10 text-sm leading-relaxed text-slate-700 text-left line-clamp-4">
                          {review.comment}
                        </p>
                      </div>
                    </div>

                    {/* User Info with Default Avatar */}
                    <div className="mt-6 flex items-center gap-3 border-t border-slate-50 pt-4">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center border border-indigo-100">
                        <User className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {review.name}
                        </h4>
                        <p className="text-xs uppercase tracking-wide text-slate-500 line-clamp-1">
                          {review.profession}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-slate-500">
                No reviews yet. Be the first to rate us!
              </div>
            )}

            {/* Navigation Buttons (Optional manual control) */}
            {reviews.length > 3 && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={prevSlide}
                  className="rounded-full bg-white p-3 text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="rounded-full bg-white p-3 text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- REVIEW BUTTON & FORM SECTION --- */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          
          {/* 1. Animated Button (Visible when form is hidden) */}
          {!showReviewForm && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="mb-6 text-2xl font-bold text-slate-900">
                Have you used InterviewMate?
              </h3>
              <button
                onClick={() => setShowReviewForm(true)}
                className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-300 active:scale-95"
              >
                <MessageSquarePlus className="h-6 w-6 animate-pulse" />
                <span>Write a Review</span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:animate-shine group-hover:opacity-100" />
              </button>
              <p className="mt-4 text-sm text-slate-500">
                It only takes 2 minutes to share your experience!
              </p>
            </div>
          )}

          {/* 2. Review Form (Visible when button clicked) */}
          {showReviewForm && (
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl animate-in zoom-in-95 duration-500">
              <button 
                onClick={() => setShowReviewForm(false)}
                className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="bg-indigo-50 p-8 md:p-10">
                <h3 className="text-2xl font-bold text-indigo-900">
                  Share your opinion
                </h3>
                <p className="mt-2 text-sm text-indigo-600">
                  We value your feedback. Help us improve InterviewMate.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="e.g. Sajjad Hossain"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Profession
                      </label>
                      <input
                        type="text"
                        name="profession"
                        required
                        value={formData.profession}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Student / HR"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Email or Mobile <span className="font-normal text-slate-400">(Kept private)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="contact"
                        required
                        value={formData.contact}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="017... or email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Your Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(star)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= formData.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-white text-slate-300 stroke-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Your Message
                    </label>
                    <textarea
                      name="comment"
                      required
                      rows="3"
                      value={formData.comment}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Write your experience with InterviewMate..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit Feedback
                      </>
                    )}
                  </button>

                  {submitMessage && (
                    <p className="mt-4 text-center text-sm font-medium text-emerald-600 animate-in fade-in">
                      {submitMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}