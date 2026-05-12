// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import StudentLayout from "@/components/StudentLayout";
import { ArrowRight, Target, Radio, Sparkles, Crown, Calendar, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Ticker State
  const [notices, setNotices] = useState([]);
  
  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // 1. Fetch User Data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => setUserData(snap.data()));
    return () => unsub();
  }, []);

  // 2. Fetch LED Ticker Data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !userData) return;

    const today = new Date().toISOString().split('T')[0];

    // A. Fetch Custom Mentor Broadcasts
    const unsubNotices = onSnapshot(collection(db, "notices"), (snap) => {
      const fetched = snap.docs.map(d => d.data())
        .filter(n => n.createdAt && n.createdAt.startsWith(today));

      const customNotices = fetched.filter(n => {
        if (n.audience === "all") return true;
        if (n.audience === "student" && n.studentId === user.uid) return true;
        if (n.audience === "exam_year") {
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

           setNotices([...customNotices, ...engNotices, ...qNotices]);
         });
         return () => unsubQuant();
      });
      return () => unsubEng();
    });

    return () => unsubNotices();
  }, [userData]);

  // 3. Fetch Hall of Fame (Leaderboard)
  useEffect(() => {
    setLoadingLeaderboard(true);
    const today = new Date().toISOString().split('T')[0];
    
    // Querying submissions for today's date, ordered by marks
    const q = query(
      collection(db, "english_submissions"), 
      where("date", "==", today),
      orderBy("scorecard.marks", "desc"),
      orderBy("timeTaken", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const globalSubs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(globalSubs);
      setLoadingLeaderboard(false);
    });

    return () => unsub();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* COMPACT WELCOME HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            Welcome back, {userData?.name?.split(" ")[0]} <Sparkles className="text-yellow-400" size={18}/>
          </h1>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <Target size={14} className="text-blue-500" />
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              {userData?.targetExams?.[0]} {Object.values(userData?.targetYears || {})[0]}
            </span>
          </div>
        </div>

        {/* STATIC LED NOTICE BOARD (MULTILINE) */}
        {notices.length > 0 && (
          <div className="relative overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 p-1 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
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
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${notice.path !== "#" ? "cursor-pointer hover:bg-white/5 group" : ""}`}
                >
                  <div className="flex items-center justify-center shrink-0 mt-1">
                     <div className="h-2 w-2 bg-red-500 rounded-full animate-ping absolute"></div>
                     <div className="h-2 w-2 bg-red-500 rounded-full relative"></div>
                  </div>
                  
                  {/* Removed truncate and set break-words for multiline */}
                  <div className={`flex-1 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide break-words leading-relaxed ${notice.color}`}>
                    {notice.text}
                  </div>

                  {notice.path !== "#" && (
                    <div className="shrink-0 text-slate-500 group-hover:text-white transition-colors mt-0.5">
                       <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TODAY'S HALL OF FAME (Moved from English Practice) */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               <Crown className="text-yellow-500" size={28} /> Today's Hall of Fame
             </h3>
             <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-2xl">
               <Calendar size={14} className="text-slate-400" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
               </p>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    <th className="p-6">Rank</th>
                    <th className="p-6">Student</th>
                    <th className="p-6">Task</th>
                    <th className="p-6 text-center">Correct</th>
                    <th className="p-6 text-right">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.userId === auth.currentUser?.uid;
                    return (
                      <tr key={entry.id} className={`${isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''} transition-colors`}>
                        <td className="p-6">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-xs">
                            {index === 0 ? <Medal className="text-yellow-500" size={22}/> : 
                             index === 1 ? <Medal className="text-slate-300" size={22}/> : 
                             index === 2 ? <Medal className="text-amber-600" size={22}/> : 
                             <span className="text-slate-400">{index + 1}</span>}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                              {entry.userName?.charAt(0)}
                            </div>
                            <span className={`text-sm font-bold truncate max-w-[120px] sm:max-w-xs ${isCurrentUser ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                              {entry.userName} {isCurrentUser && "(You)"}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded whitespace-nowrap">
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-6 text-center text-sm font-black text-emerald-500">
                          {entry.scorecard.correct}
                        </td>
                        <td className="p-6 text-right font-black text-slate-900 dark:text-white">
                          {entry.scorecard.marks.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && !loadingLeaderboard && (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-slate-400 font-bold italic">
                        No submissions recorded yet. Be the first to rank!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </StudentLayout>
  );
}