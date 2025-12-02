"use client";

import { useEffect, useState } from "react";
import {
  Video,
  Clock,
  CalendarDays,
  User,
  AlertCircle,
  PhoneCall,
  PhoneOff,
} from "lucide-react";
// If you have AuthContext, you can import it; otherwise leave it out:
// import { useAuth } from "@/context/AuthContext";

// Helper to format countdown
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Helper to clean room name
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
  // const { user } = useAuth(); // if needed later

  const [mounted, setMounted] = useState(false);
  const [joined, setJoined] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min in seconds

  const initialRoom =
    roomFromUrl || (jobId ? `Interview_${jobId}` : "InterviewMateRoom");
  const [roomName, setRoomName] = useState(initialRoom);

  useEffect(() => {
    setMounted(true);
    setRoomName(initialRoom);
  }, [initialRoom]);

  // Countdown effect
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

  const handleJoin = () => {
    if (!roomName.trim()) return;
    setJoined(true);
    setCallEnded(false);
    setTimeLeft(30 * 60);
  };

  const handleLeave = () => {
    setJoined(false);
    setCallEnded(false);
    setTimeLeft(30 * 60);
  };

  const cleanedRoom = sanitizeRoomName(roomName);
  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(
    cleanedRoom
  )}#config.prejoinPageEnabled=true`;

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* Header / info */}
      <section className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-1">
              Live Call • Interview Room
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              HR & Candidate Video Interview
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Use this room to run a structured interview between HR and Candidate.
              Both just need to open the same room link at the scheduled time.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 w-full md:w-64 text-xs">
            <p className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
              <Clock size={14} className="text-blue-600" />
              Free call window
            </p>
            <p className="text-slate-600">
              This call is limited to{" "}
              <span className="font-semibold text-slate-900">30 minutes</span>. A
              timer will run after you join.
            </p>
          </div>
        </div>
      </section>

      {/* Details + controls */}
      <section className="max-w-5xl mx-auto px-4 mb-4 grid gap-4 md:grid-cols-[1.2fr_1.4fr]">
        {/* Schedule + room info */}
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
                  {scheduledDate || "No date attached (optional)"}
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
                  {role || "Candidate / HR / Company"}
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
                    (share with the other person)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Timer + warning */}
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 bg-slate-50">
              <Clock size={14} className="text-blue-600" />
              <span className="font-mono text-sm">
                Time left:{" "}
                {joined ? formatTime(timeLeft) : "00:00 (join to start)"}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-600">
              <AlertCircle size={13} />
              <span>
                After 30 minutes the call view will be locked on this page.
              </span>
            </div>
          </div>
        </div>

        {/* Room name + controls */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Join the interview call
          </p>
          <p className="text-[11px] text-slate-500 mb-1">
            Both HR and Candidate must use the same Room ID. You can generate it
            from job ID, application ID, or share it manually.
          </p>

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
              Only English letters, numbers, <code>-</code> and <code>_</code>{" "}
              will be used inside the call URL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!joined ? (
              <button
                type="button"
                onClick={handleJoin}
                disabled={!roomName.trim()}
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
              • Ask the other person to open{" "}
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                /calling?room={cleanedRoom}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Video area */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 md:p-4">
          <p className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Video size={16} className="text-blue-600" />
            Live call
          </p>

          <div className="relative w-full rounded-xl overflow-hidden bg-slate-900/90">
            {/* Only render iframe on client and when joined */}
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
                      Click &quot;Join call&quot; to start the interview
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      When you join, a Jitsi video room will load here. The other
                      person should join the same room ID.
                    </p>
                  </>
                )}
                {callEnded && (
                  <>
                    <Clock size={28} className="mb-2 text-amber-400" />
                    <p className="text-sm font-medium">
                      30 minutes finished for this session
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      For longer calls, you can restart a new session or
                      upgrade your plan in the future.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Overlay when time finished */}
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
    </main>
  );
}
