// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import StudentLayout from "@/components/StudentLayout";
import { Zap, ArrowRight, Target, Radio, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Ticker State
  const [notices, setNotices] = useState([]);

  // 1. Fetch User Data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => setUserData(snap.data()));
    return () => unsub();
  }, []);

  // 2. The Universal LED Ticker Engine
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !userData) return;

    const today = new Date().toISOString().split('T')[0];

    // A. Fetch Custom Mentor Broadcasts
    const unsubNotices = onSnapshot(collection(db, "notices"), (snap) => {
      const fetched = snap.docs.map(d => d.data())
        .filter(n => n.createdAt && n.createdAt.startsWith(today)); // Only show today's broadcasts

      const customNotices = fetched.filter(n => {
        if (n.audience === "all") return true;
        if (n.audience === "student" && n.studentId === user.uid) return true;
        if (n.audience === "exam_year") {
           // Check if user's targets match the broadcast target
           const userExamYears = userData.targetExams?.map(exam => `${exam}-${userData.targetYears?.[exam]}`) || [];
           return userExamYears.includes(`${n.exam}-${n.year}`);
        }
        return false;
      }).map(n => ({ text: `MENTOR ALERT: ${n.text}`, color: "text-amber-400", path: "#" }));

      // B. Fetch Automated English Tests
      const qEng = query(collection(db, "english_tests"), where("date", "==", today));
      const unsubEng = onSnapshot(qEng, (eSnap) => {
         const engNotices = eSnap.docs.map(d => ({
           text: `New English ${d.data().type} Challenge is LIVE!`,
           path: "/student/english",
           color: "text-blue-400"
         }));

         // C. Fetch Automated Quant Tests
         const unsubQuant = onSnapshot(collection(db, "quant_tests"), (qSnap) => {
           const qNotices = qSnap.docs.map(d => d.data())
             .filter(d => d.createdAt && d.createdAt.startsWith(today))
             .map(d => ({
               text: `New Quant Drill: ${d.chapter} - ${d.title}`,
               path: "/student/quant",
               color: "text-emerald-400"
             }));

           // Combine all alerts into the ticker pool
           setNotices([...customNotices, ...engNotices, ...qNotices]);
         });
         return () => unsubQuant();
      });
      return () => unsubEng();
    });

    return () => unsubNotices();
  }, [userData]);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* --- STATIC LED NOTICE BOARD --- */}
        {notices.length > 0 && (
          <div className="relative overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 p-1 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 opacity-70"></div>
            
            <div className="relative z-10 flex flex-col w-full py-2">
              <div className="px-4 pb-2 mb-2 border-b border-white/5 flex items-center gap-2">
                <Radio size={14} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Updates</span>
              </div>

              {notices.map((notice, idx) => (
                <div 
                  key={idx}
                  onClick={() => notice.path !== "#" && navigate(notice.path)}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${notice.path !== "#" ? "cursor-pointer hover:bg-white/5 group" : ""}`}
                >
                  {/* Pulsing Red Dot for each list item */}
                  <div className="flex items-center justify-center shrink-0">
                     <div className="h-2 w-2 bg-red-500 rounded-full animate-ping absolute"></div>
                     <div className="h-2 w-2 bg-red-500 rounded-full relative"></div>
                  </div>
                  
                  <div className={`flex-1 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide truncate ${notice.color}`}>
                    {notice.text}
                  </div>

                  {notice.path !== "#" && (
                    <div className="shrink-0 text-slate-500 group-hover:text-white transition-colors">
                       <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPACT HERO SECTION */}
        <div className="bg-slate-900 dark:bg-blue-950 rounded-[2rem] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/30 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black mb-1 text-white tracking-tight flex items-center gap-2">
                Welcome, {userData?.name?.split(" ")[0]}! <Sparkles className="text-yellow-400" size={24}/>
              </h1>
              <p className="text-blue-200/80 font-medium text-sm lg:text-base">
                Your road to selection starts with today's tasks.
              </p>
            </div>
            
            {/* Target Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 self-start sm:self-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <Target size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 leading-none mb-1">Target</p>
                <p className="text-sm font-bold">{userData?.targetExams?.[0]} {Object.values(userData?.targetYears || {})[0]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => navigate("/student/tasks")}
            className="group bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 transition-all shadow-sm flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <Zap size={20} fill="currentColor" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Daily Tasks</h3>
              <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[200px]">
                Complete your Quant, Reasoning, and English goals.
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest pt-4">
              Start Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center min-h-[180px]">
             <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Exams</span>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">{userData?.targetExams?.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Cycle</span>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">{Object.values(userData?.targetYears || {})[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                   <span className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md uppercase">Approved</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}