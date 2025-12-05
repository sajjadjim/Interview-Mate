"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Video, PhoneCall, PhoneOff, Clock, AlertTriangle } from "lucide-react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// ---- ZEGOCLOUD env config ----
const ZEGO_APP_ID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID || 0);
const ZEGO_SERVER_SECRET =
  process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ""; // for dev/test only

// ---- helpers ----
function sanitizeRoomId(name) {
  if (!name) return "InterviewMateRoom";
  const cleaned = name.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "InterviewMateRoom";
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function InterviewCallClient({
  initialRoomId = "InterviewMate_12345",
  initialDisplayName = "HR",
}) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [joined, setJoined] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

  const containerRef = useRef(null);
  const zegoInstanceRef = useRef(null);

  const cleanedRoomId = sanitizeRoomId(roomId);
  const hasZegoConfig = ZEGO_APP_ID && ZEGO_SERVER_SECRET;

  // 30-minute timer
  useEffect(() => {
    if (!joined || callEnded) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCallEnded(true);

          if (zegoInstanceRef.current) {
            try {
              zegoInstanceRef.current.hangUp?.();
              zegoInstanceRef.current.destroy();
            } catch (e) {
              console.error("Error ending Zego call:", e);
            } finally {
              zegoInstanceRef.current = null;
            }
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [joined, callEnded]);

  // Create & join ZEGOCLOUD room
  const joinZegoRoom = useCallback(() => {
    if (!containerRef.current) {
      console.error("No containerRef for ZEGOCLOUD");
      return;
    }
    if (!hasZegoConfig) {
      console.error("Missing ZEGO_APP_ID or ZEGO_SERVER_SECRET");
      return;
    }
    if (zegoInstanceRef.current) {
      // already joined
      return;
    }

    const userID = `${Date.now()}_${Math.floor(Math.random() * 1000)}`; // you can swap with Firebase uid
    const userName = displayName || "Interview User";
    const roomID = cleanedRoomId;

    // For dev/demo only. In production, generate this token from a secure backend.
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID,
      ZEGO_SERVER_SECRET,
      roomID,
      userID,
      userName,
      30 * 60 // token TTL in seconds
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoInstanceRef.current = zp;

    zp.joinRoom({
      container: containerRef.current,
      maxUsers: 2,
      showPreJoinView: true,
      showRoomTimer: true,
      showLeaveRoomConfirmDialog: true,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
        config: {
          role: ZegoUIKitPrebuilt.Host,
        },
      },
      onJoinRoom: () => {
        console.log("Joined ZEGOCLOUD room:", roomID);
      },
      onLeaveRoom: () => {
        setJoined(false);
        setCallEnded(false);
        setTimeLeft(30 * 60);
        if (zegoInstanceRef.current) {
          try {
            zegoInstanceRef.current.destroy();
          } catch (e) {
            console.error("Error destroying Zego instance:", e);
          } finally {
            zegoInstanceRef.current = null;
          }
        }
      },
    });
  }, [cleanedRoomId, displayName, hasZegoConfig]);

  const handleJoin = () => {
    setJoined(true);
    setCallEnded(false);
    setTimeLeft(30 * 60);
    joinZegoRoom();
  };

  const handleLeave = () => {
    setJoined(false);
    setCallEnded(false);
    setTimeLeft(30 * 60);
    if (zegoInstanceRef.current) {
      try {
        zegoInstanceRef.current.hangUp?.();
        zegoInstanceRef.current.destroy();
      } catch (e) {
        console.error("Error leaving Zego room:", e);
      } finally {
        zegoInstanceRef.current = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (zegoInstanceRef.current) {
        try {
          zegoInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying Zego on unmount:", e);
        } finally {
          zegoInstanceRef.current = null;
        }
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            Live call • ZEGOCLOUD
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Interview call room (HR ↔ Candidate)
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            1-to-1 interview room powered by ZEGOCLOUD. Share the same Room ID
            with the candidate or HR and both join this page.
          </p>
        </header>

        {/* Config warning */}
        {!hasZegoConfig && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2">
            <AlertTriangle size={16} className="mt-0.5" />
            <p>
              <span className="font-semibold">ZEGOCLOUD not configured.</span>{" "}
              Set <code>NEXT_PUBLIC_ZEGO_APP_ID</code> and{" "}
              <code>NEXT_PUBLIC_ZEGO_SERVER_SECRET</code> in{" "}
              <code>.env.local</code> and restart <code>npm run dev</code>.
            </p>
          </div>
        )}

        {/* Controls */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room ID */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Room ID (letters / numbers / - / _)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={joined}
              />
              <p className="text-[11px] text-slate-500">
                Share this Room ID with the other side (HR or candidate). Both
                must use the same Room ID.
              </p>
            </div>

            {/* Display name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Your display name
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={joined}
                placeholder="e.g. HR Sajjad / Candidate Jim"
              />
              <p className="text-[11px] text-slate-500">
                This name will be shown inside the ZEGOCLOUD call UI.
              </p>
            </div>
          </div>

          {/* Timer + buttons */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 bg-slate-50">
              <Clock size={14} className="text-blue-600" />
              <span className="font-mono text-xs">
                Time left: {joined ? formatTime(timeLeft) : "00:00"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!joined ? (
                <button
                  onClick={handleJoin}
                  disabled={!hasZegoConfig}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <PhoneCall size={16} />
                  Join call
                </button>
              ) : (
                <button
                  onClick={handleLeave}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                >
                  <PhoneOff size={16} />
                  Leave call
                </button>
              )}
              <p className="text-[11px] text-slate-500 max-w-xs">
                One session is limited to 30 minutes in this UI. After that, the
                call auto-ends.
              </p>
            </div>
          </div>
        </section>

        {/* Video area */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Video size={16} className="text-blue-600" />
            Live video
          </p>

          <div className="relative w-full rounded-xl overflow-hidden bg-slate-900/90">
            {/* ZEGOCLOUD injects the UI into this div */}
            <div
              ref={containerRef}
              className="w-full h-[70vh] flex items-center justify-center"
            />

            {(!joined || callEnded) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-200 px-4 pointer-events-none">
                {!joined && !callEnded && (
                  <>
                    <Video size={28} className="mb-2 text-slate-400" />
                    <p className="text-sm font-medium">
                      Click &quot;Join call&quot; to start the interview
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      HR and candidate open this page, use the same Room ID and
                      join. ZEGOCLOUD will render the 1-to-1 call UI here.
                    </p>
                  </>
                )}
                {callEnded && (
                  <>
                    <Clock size={28} className="mb-2 text-amber-400" />
                    <p className="text-sm font-medium">
                      30-minute interview session finished
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      The timer reached 30 minutes and we ended the call. You
                      can start a new session with the same or a new Room ID.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
