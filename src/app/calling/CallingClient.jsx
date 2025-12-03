"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Video,
  Clock,
  CalendarDays,
  User,
  AlertCircle,
  PhoneCall,
  PhoneOff,
  Shield,
  HelpCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";

// -------- Topic & demo questions --------
const TOPIC_OPTIONS = [
  { value: "it", label: "IT / Programming" },
  { value: "engineering", label: "Engineering" },
  { value: "commercial", label: "Commercial / Business" },
  { value: "educational", label: "Educational" },
  { value: "other", label: "Non-tech / General" },
];

const QUESTION_BANK = {
  it: [
    {
      q: "Explain the difference between REST and GraphQL.",
      a: "REST exposes multiple endpoints for each resource, while GraphQL exposes a single endpoint where the client specifies exactly what data it needs using a schema and queries.",
    },
    {
      q: "What is an API, and why do we use it in web applications?",
      a: "An API is an interface that allows different software systems to communicate. In web apps, we use APIs to let frontend and backend exchange data or to connect with third-party services.",
    },
    {
      q: "What is the difference between GET and POST HTTP methods?",
      a: "GET is used to fetch data and should not change server state. POST is used to create or send data that may change state on the server (like creating records).",
    },
    {
      q: "How would you explain time complexity to a non-technical person?",
      a: "Time complexity describes how the time taken by an algorithm increases when the amount of data grows, like how long a line gets at a shop when more customers come.",
    },
    {
      q: "What is the purpose of using Git in a team?",
      a: "Git is used for version control, so team members can track changes, work on branches, and safely merge their code without overwriting each other.",
    },
    {
      q: "What is responsive design and why is it important?",
      a: "Responsive design means the website layout automatically adjusts for different screen sizes (mobile, tablet, desktop) so users get a good experience everywhere.",
    },
    {
      q: "What is a database index?",
      a: "An index is a special data structure that speeds up data retrieval operations, similar to an index in a book to quickly find pages.",
    },
    {
      q: "Explain the concept of authentication vs authorization.",
      a: "Authentication checks who the user is (login). Authorization checks what that user is allowed to do (permissions).",
    },
    {
      q: "What is an environment variable and why do we use it?",
      a: "Environment variables store configuration values (like API keys, DB URLs) outside the code to keep them secure and easily changeable between environments.",
    },
    {
      q: "How would you explain cloud deployment to a non-technical person?",
      a: "Instead of running the app on your own computer, you run it on someone else’s powerful computer (cloud server) that is always online and accessible over the internet.",
    },
  ],
  engineering: [
    {
      q: "Tell me about a project where you solved a practical problem.",
      a: "Listen for clear explanation of problem, approach, tools used, and final result.",
    },
    {
      q: "How do you balance theory and practical work in engineering?",
      a: "Good answer connects classroom theory with lab/field experience and continuous learning.",
    },
    {
      q: "Describe a time you worked in a team to complete a technical task.",
      a: "Look for communication, responsibility sharing and conflict resolution.",
    },
    {
      q: "How do you make sure your designs are safe and reliable?",
      a: "Expect mention of standards, testing, peer review and proper documentation.",
    },
  ],
  commercial: [
    {
      q: "How would you handle an unhappy client or customer?",
      a: "Listen for empathy, calm communication, and focus on solving the issue.",
    },
    {
      q: "How do you prioritize tasks when many things are urgent?",
      a: "Look for use of deadlines, impact, and clear communication with manager.",
    },
    {
      q: "Explain a time you reached or exceeded a target.",
      a: "Good answer should include clear target, steps taken, and measurable result.",
    },
    {
      q: "What does good teamwork mean in a commercial environment?",
      a: "Expect mention of communication, respect, and helping team achieve shared goals.",
    },
  ],
  educational: [
    {
      q: "How do you explain a difficult topic to a weak student?",
      a: "Listen for patience, breaking topics into small steps and using examples.",
    },
    {
      q: "How do you keep students engaged in a long session?",
      a: "Look for interactive methods, questions, activities or real-life examples.",
    },
    {
      q: "Tell me about a time you handled classroom discipline.",
      a: "Good answer shows fairness, calm handling and focus on learning.",
    },
    {
      q: "How do you measure whether students actually learned something?",
      a: "Expect mention of quizzes, assignments, feedback and observation.",
    },
  ],
  other: [
    {
      q: "Tell me about yourself in 2–3 sentences.",
      a: "Candidate should give a short summary: background, skills, and current goal.",
    },
    {
      q: "Why are you interested in this role?",
      a: "Look for connection between the job and their skills, interests, or future plan.",
    },
    {
      q: "Describe a time you faced a challenge and how you solved it.",
      a: "Good answers show ownership, problem-solving and learning.",
    },
    {
      q: "How do you handle stress or pressure?",
      a: "Listen for healthy coping methods and prioritization skills.",
    },
  ],
};

// -------- Helpers --------
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function sanitizeRoomName(name) {
  if (!name) return "InterviewMateRoom";
  const cleaned = name.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "InterviewMateRoom";
}

export default function CallingClient({
  scheduledDate,
  timeSlot,
  role,
  jobId,
  roomFromUrl,
}) {
  const [mounted, setMounted] = useState(false);

  // Call timer state
  const [joined, setJoined] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min

  // Room / role
  const baseRoom =
    roomFromUrl || (jobId ? `Interview_${jobId}` : "InterviewMateRoom");
  const [roomName, setRoomName] = useState(baseRoom);

  useEffect(() => setRoomName(baseRoom), [baseRoom]);
  useEffect(() => setMounted(true), []);

  const safeRole = useMemo(
    () => (role === "hr" ? "hr" : role === "candidate" ? "candidate" : "candidate"),
    [role]
  );

  const cleanedRoom = sanitizeRoomName(roomName);

  // Password protection
  const [unlocked, setUnlocked] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [verifyingPass, setVerifyingPass] = useState(false);

  // Question helper
  const [topic, setTopic] = useState("it");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  const selectedDemoQuestions =
    QUESTION_BANK[topic] && QUESTION_BANK[topic].length
      ? QUESTION_BANK[topic]
      : QUESTION_BANK.it;

  // Timer countdown
  useEffect(() => {
    if (!joined || callEnded) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCallEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [joined, callEnded]);

  // --- Password ---
  const handleUnlock = async () => {
    setPassError("");
    if (!passInput.trim()) {
      setPassError("Please enter the meeting password.");
      return;
    }
    try {
      setVerifyingPass(true);
      const res = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setUnlocked(false);
        setPassError("Incorrect password. Please try again.");
      } else {
        setUnlocked(true);
      }
    } catch (err) {
      console.error(err);
      setPassError("Could not verify password. Try again.");
    } finally {
      setVerifyingPass(false);
    }
  };

  // --- Join / Leave (just controlling iframe & timer) ---
  const handleJoin = () => {
    if (!roomName.trim() || !unlocked) return;
    setJoined(true);
    setCallEnded(false);
    setTimeLeft(30 * 60);
  };

  const handleLeave = () => {
    setJoined(false);
    setCallEnded(false);
    setTimeLeft(30 * 60);
  };

  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(
    cleanedRoom
  )}#config.prejoinPageEnabled=true`;

  // --- Question generator (no external AI needed) ---
  const handleGenerateAi = async () => {
    setAiLoading(true);
    setAiText("");
    try {
      const label =
        TOPIC_OPTIONS.find((t) => t.value === topic)?.label || topic;
      const res = await fetch("/api/ai-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: label, prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data?.text) {
        setAiText(data.text);
      } else {
        setAiText(
          "Question generator is not available right now. Please try again later."
        );
      }
    } catch (err) {
      console.error(err);
      setAiText("Question generator failed. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-1">
              Live Call • Interview Room
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              HR & Candidate Secure Video Interview
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Use this room to run a structured interview between HR and
              Candidate. Meeting is protected by a password. HR can also use
              ready-made questions and the built-in generator.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 w-full md:w-72 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Shield size={16} />
              </span>
            <div>
                <p className="font-semibold text-slate-900">
                  Password protected
                </p>
                <p className="text-[11px] text-slate-500">
                  Only people with the meeting password can start the call.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 bg-slate-50">
              <Clock size={14} className="text-blue-600" />
              <span className="font-mono text-sm">
                Time left:{" "}
                {joined ? formatTime(timeLeft) : "00:00 (join to start)"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Details + controls */}
      <section className="max-w-5xl mx-auto px-4 mb-4 grid gap-4 md:grid-cols-[1.2fr_1.4fr]">
        {/* Schedule + info */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Interview details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <CalendarDays size={14} />
              </span>
              <div>
                <p className="font-semibold text-slate-800">Scheduled date</p>
                <p className="text-slate-600">
                  {scheduledDate || "Not attached in link"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Clock size={14} />
              </span>
              <div>
                <p className="font-semibold text-slate-800">Time slot</p>
                <p className="text-slate-600">
                  {timeSlot || "Example: 9–10AM, 2–3PM, 9–10PM"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <User size={14} />
              </span>
              <div>
                <p className="font-semibold text-slate-800">Your role</p>
                <p className="text-slate-600 capitalize">
                  {safeRole === "hr" ? "HR" : "Candidate"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Video size={14} />
              </span>
              <div>
                <p className="font-semibold text-slate-800">Room ID</p>
                <p className="text-slate-600 break-all">
                  {cleanedRoom}{" "}
                  <span className="text-[10px] text-slate-400">
                    (share this with candidate)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Invite text to send by email */}
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] space-y-1">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <HelpCircle size={12} className="text-blue-600" />
              Invite text (copy & send to candidate)
            </p>
            <textarea
              readOnly
              rows={4}
              className="w-full bg-transparent text-[11px] text-slate-600 resize-none focus:outline-none"
              value={`InterviewMate Meeting
Room: ${cleanedRoom}
Date: ${scheduledDate || "To be confirmed"}
Time: ${timeSlot || "To be confirmed"}
Join link: /calling?room=${cleanedRoom}&role=candidate
Password: (meeting password you share separately)`}
            />
          </div>
        </div>

        {/* Password + room controls */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
          {/* Password block */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              Meeting password
            </p>
            <p className="text-[11px] text-slate-500 mb-1">
              Password is checked on the server (one global password). Share it
              securely with the candidate. Both must enter the same password to
              unlock the call.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="Enter meeting password"
              />
              <button
                type="button"
                onClick={handleUnlock}
                disabled={verifyingPass || !passInput.trim()}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:bg-blue-300"
              >
                {verifyingPass ? (
                  <>
                    <Clock size={14} className="animate-spin" /> Checking...
                  </>
                ) : (
                  "Unlock"
                )}
              </button>
            </div>
            {passError && (
              <p className="text-[11px] text-red-500 mt-1">{passError}</p>
            )}
            {unlocked && !passError && (
              <p className="text-[11px] text-emerald-600 mt-1">
                Password accepted. You can now join the call.
              </p>
            )}
          </div>

          {/* Room ID input + join/leave */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Room ID
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              placeholder="e.g. Interview_JOB-009_ayesha"
              disabled={joined}
            />
            <p className="text-[11px] text-slate-500">
              Only letters, numbers, <code>-</code> and <code>_</code> are used
              inside the Jitsi room URL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!joined ? (
              <button
                type="button"
                onClick={handleJoin}
                disabled={!roomName.trim() || !unlocked}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
              >
                <PhoneCall size={16} />
                Join call
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLeave}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                <PhoneOff size={16} />
                Leave call
              </button>
            )}

            <p className="text-[11px] text-slate-500">
              • Allow camera & microphone when your browser asks.
              <br />
              • HR should use{" "}
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                /calling?room={cleanedRoom}&role=hr
              </span>{" "}
              and candidate{" "}
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                /calling?room={cleanedRoom}&role=candidate
              </span>
              , with the same password.
            </p>
          </div>
        </div>
      </section>

      {/* Video area (Jitsi iframe) */}
      <section className="max-w-5xl mx-auto px-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 md:p-4">
          <p className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Video size={16} className="text-blue-600" />
            Live call
          </p>

          <div className="relative w-full rounded-xl overflow-hidden bg-slate-900/90">
            {mounted && joined && !callEnded ? (
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  src={jitsiUrl}
                  allow="camera; microphone; fullscreen; display-capture"
                  className="absolute inset-0 w-full h-full border-0"
                  title="Interview video call"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-200">
                {!joined && !callEnded && (
                  <>
                    <Video size={28} className="mb-2 text-slate-400" />
                    <p className="text-sm font-medium">
                      Unlock with password, then click &quot;Join call&quot;
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      When you join, a Jitsi video room will load here. The
                      other person should join with the same Room ID and
                      password.
                    </p>
                  </>
                )}
                {callEnded && (
                  <>
                    <Clock size={28} className="mb-2 text-amber-400" />
                    <p className="text-sm font-medium">
                      30 minutes finished for this session
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      This interview session has reached the 30-minute window.
                      You can leave the room or start another session if needed.
                    </p>
                  </>
                )}
              </div>
            )}

            {joined && callEnded && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center px-4">
                <Clock size={32} className="mb-2 text-amber-400" />
                <p className="text-sm font-semibold text-white">
                  Free 30-minute limit reached
                </p>
                <p className="text-[11px] text-slate-200 mt-1 max-w-sm">
                  This interview session has reached the free 30-minute window.
                  You can leave the room or start another session if needed.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Question helper (HR side) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <BookOpen size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Question helper for HR
                </p>
                <p className="text-[11px] text-slate-500">
                  See some demo questions with answers, or use the question
                  generator for more ideas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500">Topic:</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
              >
                {TOPIC_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.3fr_1.2fr] items-start">
            {/* Demo questions with answers */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs max-h-[260px] overflow-auto">
              <p className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <HelpCircle size={14} className="text-blue-600" />
                Demo questions & answers ({selectedDemoQuestions.length})
              </p>
              {selectedDemoQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b last:border-b-0 border-slate-200 pb-2 mb-2 last:mb-0 last:pb-0"
                >
                  <p className="font-semibold text-slate-900">
                    Q{idx + 1}. {item.q}
                  </p>
                  <p className="mt-1 text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Good answer:
                    </span>{" "}
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Question generator */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Sparkles size={14} className="text-fuchsia-500" />
                  Question generator
                </p>
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:opacity-95 disabled:bg-blue-300"
                >
                  <Sparkles size={12} />
                  {aiLoading ? "Generating..." : "Generate questions"}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                The generator will create 10 short questions for the selected
                topic. You can also give a short instruction.
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px] mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                placeholder="Optional: e.g. 'beginner level', 'more soft-skill questions', 'focus on problem solving'..."
              />

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-[220px] overflow-auto text-[11px] whitespace-pre-wrap">
                {aiText ? (
                  <pre className="text-[11px] text-slate-700 font-mono">
                    {aiText}
                  </pre>
                ) : (
                  <p className="text-slate-500">
                    No generated questions yet. Click{" "}
                    <span className="font-semibold">
                      &quot;Generate questions&quot;
                    </span>{" "}
                    to create a list for this topic.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
