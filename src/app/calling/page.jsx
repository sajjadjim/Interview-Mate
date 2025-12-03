"use client";

import { useEffect, useRef, useState } from "react";
import { Video, PhoneCall, PhoneOff, Clock, AlertTriangle } from "lucide-react";

// ----- JaaS configuration from environment -----
const JAAS_APP_ID =
  process.env.NEXT_PUBLIC_JAAS_APP_ID ||
  "vpaas-magic-cookie-7e7309deb9944c138f5b061a0355d4a1"; // fallback: your AppID
const JAAS_DOMAIN = "8x8.vc";
// For testing, paste JWT from JaaS sample page into .env.local
const JAAS_TEST_JWT = process.env.NEXT_PUBLIC_JAAS_TEST_JWT || "";

// ----- Helpers -----
function sanitizeRoomName(name) {
  if (!name) return "InterviewMateRoom";
  const cleaned = name.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "InterviewMateRoom";
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ----- Page component -----
export default function CallingPage() {
  const [roomName, setRoomName] = useState("SajjadJim 12345");
  const [joined, setJoined] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

  const jitsiApiRef = useRef(null);

  const cleanedRoom = sanitizeRoomName(roomName);
  const hasJwt = !!JAAS_TEST_JWT;

  // 30-minute timer
  useEffect(() => {
    if (!joined || callEnded) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCallEnded(true);
          if (jitsiApiRef.current) {
            jitsiApiRef.current.executeCommand("hangup");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [joined, callEnded]);

  // Load JaaS external_api.js and create meeting when joined
  useEffect(() => {
    if (!joined || callEnded) return;

    let scriptEl;

    function startConference() {
      if (!window.JitsiMeetExternalAPI) {
        console.error("JitsiMeetExternalAPI not available");
        return;
      }

      const parentNode = document.querySelector("#jaas-container");
      if (!parentNode) {
        console.error("No #jaas-container element found");
        return;
      }

      const options = {
        roomName: `${JAAS_APP_ID}/${cleanedRoom}`, // vpaas-magic-cookie.../yourRoom
        parentNode,
        width: "100%",
        height: "100%",
      };

      // IMPORTANT: if JWT is missing or expired, JaaS will show "Authentication failed"
      if (JAAS_TEST_JWT) {
        options.jwt = JAAS_TEST_JWT;
      }

      const api = new window.JitsiMeetExternalAPI(JAAS_DOMAIN, options);
      jitsiApiRef.current = api;

      api.addListener("videoConferenceLeft", () => {
        setJoined(false);
        setCallEnded(false);
        setTimeLeft(30 * 60);
      });
    }

    if (!window.JitsiMeetExternalAPI) {
      scriptEl = document.createElement("script");
      scriptEl.src = `https://8x8.vc/${JAAS_APP_ID}/external_api.js`;
      scriptEl.async = true;
      scriptEl.onload = startConference;
      document.body.appendChild(scriptEl);
    } else {
      startConference();
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      // keep script tag for reuse
    };
  }, [joined, callEnded, cleanedRoom]);

  const handleJoin = () => {
    setJoined(true);
    setCallEnded(false);
    setTimeLeft(30 * 60);
  };

  const handleLeave = () => {
    setJoined(false);
    setCallEnded(false);
    setTimeLeft(30 * 60);

    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("hangup");
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            Live call • Jitsi as a Service
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Interview call room (JaaS)
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            This page uses your Jitsi as a Service AppID, so there is no 5
            minute embed limit. A 30-minute timer is used for one interview
            session.
          </p>
        </header>

        {/* JWT warning */}
        {!hasJwt && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2">
            <AlertTriangle size={16} className="mt-0.5" />
            <p>
              <span className="font-semibold">No JaaS JWT configured.</span>{" "}
              Jitsi may show &quot;Authentication failed&quot; in the video
              area. Go to your JaaS sample app, copy the <code>jwt</code> value,
              and set it as{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">
                NEXT_PUBLIC_JAAS_TEST_JWT
              </code>{" "}
              in <code>.env.local</code>, then restart <code>npm run dev</code>.
            </p>
          </div>
        )}

        {/* Controls */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Room ID (letters / numbers / - / _)
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={joined}
            />
            <p className="text-[11px] text-slate-500">
              Full JaaS room:{" "}
              <span className="font-mono text-[11px]">
                {JAAS_APP_ID}/{cleanedRoom}
              </span>
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 bg-slate-50 mt-2">
              <Clock size={14} className="text-blue-600" />
              <span className="font-mono text-xs">
                Time left: {joined ? formatTime(timeLeft) : "00:00"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-3">
              {!joined ? (
                <button
                  onClick={handleJoin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
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
              <p className="text-[11px] text-slate-500">
                Share the same Room ID with the other person. Both open this
                page and click &quot;Join call&quot;.
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
            {/* JaaS injects iframe inside this div */}
            <div id="jaas-container" className="w-full h-[70vh]" />

            {(!joined || callEnded) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-200 px-4">
                {!joined && !callEnded && (
                  <>
                    <Video size={28} className="mb-2 text-slate-400" />
                    <p className="text-sm font-medium">
                      Click &quot;Join call&quot; to start the meeting
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      The JaaS video meeting will load here using your AppID.
                      Open this page in two browsers (HR and Candidate) with the
                      same Room ID to test.
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
                      The UI timer reached 30 minutes and we sent a hangup
                      command to Jitsi. You can start a new session if needed.
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
