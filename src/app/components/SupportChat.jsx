"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, ChevronRight, HelpCircle, Send } from "lucide-react";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase";

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Initial Greeting (Runs once when chat opens)
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const auth = getAuth(app);
      const user = auth.currentUser;
      const userName = user?.displayName ? user.displayName.split(" ")[0] : "there";

      setMessages([
        {
          id: 1,
          text: `Hi ${userName}! 👋 Welcome to InterviewMate. How can I help you today?`,
          sender: "bot",
        },
      ]);
      setHasGreeted(true);
    }
  }, [isOpen]);

  // --- UPDATED FAQ OPTIONS ---
  const faqOptions = [
    {
      id: "account-creation",
      question: "How do I create an account?",
      answer: "You can sign up in 3 ways:\n1. **Google**: One-click login (Recommended).\n2. **Email**: Use your Gmail or Yahoo address.\n3. **Phone**: Sign up using your mobile number via OTP.",
    },
    {
      id: "verification",
      question: "Why is my status 'Inactive'?",
      answer: "For HR and Companies, the default status is 'Inactive'. You must submit your profile verification documents. Once Admin reviews them, your status will change to 'Active'.",
    },
    {
      id: "job-post",
      question: "I cannot post a Job.",
      answer: "Only 'Active' Companies can post jobs. If you are a new Company, please complete your profile verification first to unlock this feature.",
    },
    {
      id: "apply-job",
      question: "How do I apply for jobs?",
      answer: "As a Candidate, you must first upload your CV/Resume in your profile settings. Once uploaded, you can browse 'Jobs' and click 'Apply'.",
    },
    {
      id: "mock-interview",
      question: "What is a Mock Interview?",
      answer: "Mock Interviews are practice sessions taken by expert HRs. You can schedule one from the 'Interviews' tab to practice before the real job interview.",
    },
  ];

  const handleOptionClick = (option) => {
    // 1. Add User's selection
    const userMsg = { id: Date.now(), text: option.question, sender: "user" };
    
    // 2. Add Bot's answer (with delay)
    const botMsg = { id: Date.now() + 1, text: option.answer, sender: "bot" };

    setMessages((prev) => [...prev, userMsg]);

    // Simulate "typing" delay
    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">InterviewMate Support</h3>
                <p className="text-xs text-blue-100 opacity-90">Automated Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-96 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 text-sm rounded-2xl shadow-sm whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Suggestion Chips (Only show if last message was from bot) */}
            {messages.length > 0 && messages[messages.length - 1].sender === "bot" && (
              <div className="flex flex-col gap-2 mt-6 animate-in fade-in duration-500">
                <p className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Common Topics</p>
                {faqOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className="text-left text-sm text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group shadow-sm"
                  >
                    {option.question}
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition" />
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Need human help? Email <a href="mailto:support@interviewmate.com" className="text-blue-600 font-medium hover:underline">support@interviewmate.com</a>
            </p>
          </div>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen ? "bg-gray-800 rotate-90" : "bg-blue-600 hover:bg-blue-700"
        } text-white flex items-center justify-center`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}