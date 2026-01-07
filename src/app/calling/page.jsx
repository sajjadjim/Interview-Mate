"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { 
  Video, Clock, AlertTriangle, 
  FileText, Search, User, X, Send, 
  BookOpen, BrainCircuit, Globe, GripHorizontal, ChevronDown, ChevronUp,
  Info, ShieldAlert, CheckCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ==========================================
// 1. CONFIGURATION & STATIC DATA
// ==========================================

const ZEGO_APP_ID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID || 0);
const ZEGO_SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

const QUESTION_BANK = {
  "IT & Engineering": [
    { q: "What is the difference between REST and GraphQL?", a: "REST uses standard HTTP methods. GraphQL allows clients to request specific data structure." },
    { q: "Explain 'Hoisting' in JavaScript.", a: "Variable and function declarations are moved to the top of their scope." },
    { q: "Difference between TCP and UDP?", a: "TCP is reliable/connected. UDP is faster/connectionless but less reliable." },
  ],
  "Business & Commercial": [
    { q: "How do you handle a dissatisfied client?", a: "Listen, acknowledge, apologize, and propose a solution." },
    { q: "Marketing vs Branding?", a: "Marketing is tactical promotion. Branding is the strategic identity." },
  ],
  "Education": [
    { q: "Handling disruptive students?", a: "Non-verbal cues first, then private talk. No public shaming." },
    { q: "Teaching philosophy?", a: "Student-centered, adaptable, critical thinking focus." },
  ],
  "General Knowledge": [
    { q: "Capital of Bangladesh?", a: "Dhaka." },
    { q: "Founder of Microsoft?", a: "Bill Gates." },
  ],
  "HR / Soft Skills": [
    { q: "Describe a time you failed.", a: "Look for ownership, lack of blame, and lessons learned." },
    { q: "Where do you see yourself in 5 years?", a: "Look for ambition aligned with company growth." },
  ]
};

// ==========================================
// 2. DRAGGABLE WINDOW COMPONENT
// ==========================================

const DraggableWindow = ({ title, icon: Icon, onClose, children, initialPos = { x: 20, y: 100 } }) => {
  const [pos, setPos] = useState(initialPos);
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState(null);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setRel({ x: e.pageX - pos.x, y: e.pageY - pos.y });
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    setPos({ x: e.pageX - rel.x, y: e.pageY - rel.y });
    e.stopPropagation();
    e.preventDefault();
  }, [dragging, rel]);

  const onMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    } else {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, onMouseMove]);

  return (
    <div 
      className="fixed z-50 w-80 md:w-96 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      style={{ left: pos.x, top: pos.y }}
    >
      <div 
        onMouseDown={onMouseDown}
        className="bg-slate-100 border-b border-slate-200 p-3 flex justify-between items-center cursor-move select-none"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <GripHorizontal size={16} className="text-slate-400" />
          {Icon && <Icon size={16} className="text-blue-600" />}
          {title}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[60vh]">
        {children}
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN LOGIC COMPONENT
// ==========================================

function CallingContent() {
  // ------------------------------------------------------------------
  // PART A: HOOKS
  // ------------------------------------------------------------------
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  
  // State Hooks
  const [userRole, setUserRole] = useState(null);
  
  // Zego State
  const initialRoomId = searchParamsHook.get("roomId") || "692dc62f0d3daff50293457b"; 
  const initialDisplayName = searchParamsHook.get("name") || user?.displayName || "User";

  const [roomId, setRoomId] = useState(initialRoomId);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [joined, setJoined] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  
  const containerRef = useRef(null);
  const zegoInstanceRef = useRef(null);
  const hasZegoConfig = ZEGO_APP_ID && ZEGO_SERVER_SECRET;

  // Tools State
  const [activeTools, setActiveTools] = useState({
    search: false,
    ai: false,
    questions: false,
    feedback: false
  });

  const [showRules, setShowRules] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Question Bank State
  const [selectedTopic, setSelectedTopic] = useState("IT & Engineering");
  const [openQuestionId, setOpenQuestionId] = useState(null);

  // Feedback State
  const [candidateData, setCandidateData] = useState(null);
  const [feedbackStep, setFeedbackStep] = useState(1);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [questions, setQuestions] = useState([
    { id: 1, text: "Technical Knowledge", score: 2 },
    { id: 2, text: "Communication Skills", score: 2 },
    { id: 3, text: "Problem Solving", score: 2 },
    { id: 4, text: "Adaptability", score: 2 },
    { id: 5, text: "Confidence", score: 2 },
    { id: 6, text: "Professionalism", score: 2 },
  ]);

  // ------------------------------------------------------------------
  // PART B: EFFECTS
  // ------------------------------------------------------------------

  // 1. Protected Route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 2. Fetch User Role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.role) {
            setUserRole(data.role);
            if (data.role === 'hr') setShowRules(false);
        }
      } catch (e) { console.error(e); }
    };
    if (user) fetchUserRole();
  }, [user]);

  // 3. Timer
  useEffect(() => {
    if (!joined || callEnded) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCallEnded(true);
          if (zegoInstanceRef.current) zegoInstanceRef.current.destroy();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [joined, callEnded]);

  // ------------------------------------------------------------------
  // PART C: HANDLERS
  // ------------------------------------------------------------------

  const handleJoin = async () => {
    if (!containerRef.current || !hasZegoConfig) return;
    setJoined(true); setCallEnded(false);
    
    const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");
    const userID = user?.uid || `${Date.now()}`;
    const safeRoomId = roomId.replace(/[^a-zA-Z0-9_-]/g, "") || "InterviewRoom";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID, ZEGO_SERVER_SECRET, safeRoomId, userID, displayName, 1800
    );
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoInstanceRef.current = zp;

    zp.joinRoom({
      container: containerRef.current,
      maxUsers: 2,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      showPreJoinView: false, 
      showMyCameraToggleButton: userRole === 'hr', 
      showMyMicrophoneToggleButton: userRole === 'hr', 
      showAudioVideoSettingsButton: true,
      showRoomTimer: true,
      scenario: { 
        mode: ZegoUIKitPrebuilt.OneONoneCall, 
        config: { role: ZegoUIKitPrebuilt.Host } 
      },
      onLeaveRoom: () => { setJoined(false); setCallEnded(false); setTimeLeft(1800); }
    });
  };

  const handleLeave = () => {
    setJoined(false); setCallEnded(false); setTimeLeft(1800);
    if (zegoInstanceRef.current) zegoInstanceRef.current.destroy();
  };

  const toggleTool = (tool) => {
    setActiveTools(prev => ({ ...prev, [tool]: !prev[tool] }));
  };

  const handleGoogleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const width = 600; 
    const height = 800;
    const left = window.screen.width - width;
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, 
      'GoogleSearch', 
      `width=${width},height=${height},left=${left},top=0`
    );
  };

  const handleAskAi = async () => {
    if(!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      setAiResponse(data.data || { q: "Error", a: "Could not fetch." });
    } catch {
      setAiResponse({ q: "Error", a: "Network error." });
    } finally {
      setAiLoading(false);
    }
  };

  // --- FETCH CANDIDATE INFO ---
  const handleFetchCandidate = async () => {
    if(!roomId) return;
    setFetchLoading(true);
    try {
      const res = await fetch('/api/interview/fetch-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomId.trim() }) 
      });
      const data = await res.json();
      if (data.success) {
        setCandidateData(data.data);
        setFeedbackStep(2);
      } else {
        alert("Candidate not found! Check Room ID.");
      }
    } catch (e) {
      alert("Error fetching candidate.");
    } finally {
      setFetchLoading(false);
    }
  };

  // --- SUBMIT FEEDBACK TO DATABASE ---
  const handleSubmitFeedback = async () => {
    // 1. Safety Check
    if (!candidateData || !user) {
      alert("Missing candidate data or user login.");
      return;
    }
    
    setSubmitLoading(true);
    const totalScore = questions.reduce((a, b) => a + b.score, 0);

    // 2. Prepare Payload (Robust Naming Check)
    const payload = {
      applicationId: candidateData.applicationId || candidateData._id,
      roomId: roomId,
      // Fallback: check 'applicantName', then 'name', then default
      candidateName: candidateData.applicantName || candidateData.name || "Unknown Candidate",
      candidateEmail: candidateData.applicantEmail || candidateData.email,
      interviewerEmail: user.email,
      interviewerName: user.displayName || "HR Interviewer",
      score: totalScore,
      breakdown: questions, 
      date: new Date().toISOString()
    };

    console.log("Sending Payload:", payload);

    try {
      const res = await fetch('/api/reviews', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
            // Optional: Close window after success
            toggleTool('feedback'); 
        }, 2500);
      } else {
        alert(`Failed: ${result.message || result.error || "Unknown Error"}`);
      }
    } catch (error) {
      console.error("Error submitting marks:", error);
      alert("Network error. Could not save marks.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // PART D: RENDER
  // ------------------------------------------------------------------

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-4 px-4 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4 mb-4 z-10">
        <div className="flex items-center gap-4">
           <div>
              <h1 className="text-xl font-bold text-slate-900">Live Interview Room</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> Time Left: {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</p>
           </div>
           
           {userRole !== 'hr' && (
             <button onClick={() => setShowRules(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-bold transition-colors">
               <Info size={14} /> Rules
             </button>
           )}
        </div>

        {userRole === 'hr' && (
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => toggleTool('search')} className={`p-2 rounded-lg transition-all ${activeTools.search ? 'bg-blue-100 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`} title="Google Search"><Globe size={20} /></button>
            <button onClick={() => toggleTool('ai')} className={`p-2 rounded-lg transition-all ${activeTools.ai ? 'bg-violet-100 text-violet-600' : 'text-slate-600 hover:bg-slate-50'}`} title="Ask AI"><BrainCircuit size={20} /></button>
            <button onClick={() => toggleTool('questions')} className={`p-2 rounded-lg transition-all ${activeTools.questions ? 'bg-emerald-100 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`} title="Question Bank"><BookOpen size={20} /></button>
            <div className="w-px bg-slate-200 mx-1"></div>
            <button onClick={() => toggleTool('feedback')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTools.feedback ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><FileText size={16} /> Marking</button>
          </div>
        )}
      </div>

      {/* WARNING BANNER */}
      {userRole !== 'hr' && (
        <div className="w-full max-w-6xl mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="bg-red-50 border border-red-100 text-red-800 text-xs px-4 py-2 rounded-lg flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-2">
               <ShieldAlert size={16} className="text-red-600" />
               <span className="font-semibold">STRICT ENFORCEMENT:</span> Background MUST be a single solid color. Camera must remain ON at all times.
             </div>
          </div>
        </div>
      )}

      {/* VIDEO LAYOUT */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)]">
         <div className="lg:col-span-3 bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-slate-900">
            <div ref={containerRef} className="w-full h-full" />
            {!joined && !callEnded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <Video size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium text-slate-300">Ready to join?</p>
                </div>
            )}
         </div>

         <div className="lg:col-span-1 flex flex-col gap-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="space-y-3">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Room ID</label>
                      <input value={roomId} onChange={e => setRoomId(e.target.value)} disabled={joined} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                      <input value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={joined} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                   </div>
                   {!joined ? (
                      <button onClick={handleJoin} disabled={!hasZegoConfig} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-lg shadow-blue-200">Join Call</button>
                   ) : (
                      <button onClick={handleLeave} className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-lg text-sm transition-colors">End Call</button>
                   )}
                </div>
             </div>
             {!hasZegoConfig && (
                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200 flex items-start gap-2"><AlertTriangle size={14} className="mt-0.5" /> ZEGOCLOUD env vars missing.</div>
             )}
         </div>
      </div>

      {/* RULES MODAL */}
      {showRules && userRole !== 'hr' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
               <div className="bg-red-600 p-6 text-white text-center">
                   <ShieldAlert size={48} className="mx-auto mb-3 opacity-90" />
                   <h2 className="text-2xl font-bold">Mandatory Interview Rules</h2>
                   <p className="text-red-100 text-sm mt-1">Please read carefully before joining.</p>
               </div>
               <div className="p-6 bg-slate-50 border-t border-slate-100">
                   <button onClick={() => setShowRules(false)} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all active:scale-95">I Understand & Agree</button>
               </div>
           </div>
        </div>
      )}

      {/* TOOLS WINDOWS */}
      {activeTools.search && <DraggableWindow title="Google Search" icon={Globe} onClose={() => toggleTool('search')} initialPos={{ x: 50, y: 150 }}><form onSubmit={handleGoogleSearch} className="flex gap-2"><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search topic..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" autoFocus /><button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Search size={18} /></button></form></DraggableWindow>}
      
      {activeTools.ai && <DraggableWindow title="Ask AI Assistant" icon={BrainCircuit} onClose={() => toggleTool('ai')} initialPos={{ x: 400, y: 150 }}><div className="flex gap-2 mb-4"><input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. React Hooks..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500" /><button onClick={handleAskAi} disabled={aiLoading} className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 disabled:opacity-50">{aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}</button></div>{aiResponse && <div className="bg-violet-50 rounded-lg p-3 text-sm border border-violet-100"><p className="font-bold text-violet-800 mb-1">Q: {aiResponse.q}</p><p className="text-slate-700">{aiResponse.a}</p></div>}</DraggableWindow>}
      
      {activeTools.questions && <DraggableWindow title="Question Bank" icon={BookOpen} onClose={() => toggleTool('questions')} initialPos={{ x: 50, y: 400 }}><div className="space-y-4"><div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Select Topic</label><div className="relative"><select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 block">{Object.keys(QUESTION_BANK).map((topic) => (<option key={topic} value={topic}>{topic}</option>))}</select><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"><ChevronDown size={16} /></div></div></div><div className="space-y-2">{QUESTION_BANK[selectedTopic].map((item, idx) => (<div key={idx} className="border border-slate-100 rounded-lg overflow-hidden"><button onClick={() => setOpenQuestionId(openQuestionId === idx ? null : idx)} className="w-full flex justify-between items-center p-3 text-left bg-white hover:bg-slate-50 transition-colors"><span className="text-xs font-semibold text-slate-700">{item.q}</span>{openQuestionId === idx ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}</button>{openQuestionId === idx && (<div className="p-3 bg-emerald-50 text-xs text-slate-600 border-t border-slate-100"><strong className="text-emerald-700 block mb-1">Best Answer:</strong>{item.a}</div>)}</div>))}</div></div></DraggableWindow>}
      
      {/* FEEDBACK & MARKING TOOL */}
      {activeTools.feedback && (
        <DraggableWindow title="Marking Sheet" icon={FileText} onClose={() => toggleTool('feedback')} initialPos={{ x: 800, y: 100 }}>
          {feedbackStep === 1 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-3">Fetching info for: <b>{roomId}</b></p>
              <button onClick={handleFetchCandidate} disabled={fetchLoading} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold w-full transition-all hover:bg-slate-900 disabled:opacity-50">
                {fetchLoading ? "Loading..." : "Load Candidate"}
              </button>
            </div>
          ) : submitSuccess ? (
             <div className="flex flex-col items-center justify-center py-6 text-emerald-600 animate-in fade-in zoom-in">
                 <CheckCircle size={48} className="mb-2" />
                 <p className="font-bold text-lg">Marks Submitted!</p>
                 <p className="text-xs text-slate-500">Leaderboard updated.</p>
             </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><User size={16}/></div>
                <div><p className="text-sm font-bold text-slate-900">{candidateData?.applicantName}</p><p className="text-xs text-slate-500">{candidateData?.applicantEmail}</p></div>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {questions.map((q) => (
                  <div key={q.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-700">{q.text}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setQuestions(prev => prev.map(qi => qi.id === q.id ? {...qi, score: s} : qi))} className={`w-6 h-6 rounded text-xs font-bold transition-all ${q.score === s ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-lg text-slate-800">
                  Total: {questions.reduce((a,b)=>a+b.score,0)} / 30
                </span>
                
                {/* SUBMIT BUTTON */}
                <button 
                  onClick={handleSubmitFeedback} 
                  disabled={submitLoading}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitLoading ? "Saving..." : "Submit Marks"}
                </button>
              </div>
            </div>
          )}
        </DraggableWindow>
      )}

    </main>
  );
}

// ==========================================
// 4. EXPORT WITH SUSPENSE
// ==========================================
export default function CallingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-slate-500">Loading call...</div>}>
      <CallingContent />
    </Suspense>
  );
}