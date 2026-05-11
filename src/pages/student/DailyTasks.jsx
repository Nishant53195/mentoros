// src/pages/student/DailyTasks.jsx
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot, setDoc, query, collection, where } from "firebase/firestore";
import StudentLayout from "@/components/StudentLayout";
import { CheckCircle2, Circle, CalendarDays } from "lucide-react";

const SUBJECT_LABELS = {
  quant: "Quantitative",
  reasoning: "Reasoning",
  english: "English",
  ga: "General Awareness"
};

export default function DailyTasks() {
  const [userData, setUserData] = useState(null);
  const [activeExam, setActiveExam] = useState("");
  const [dailyTask, setDailyTask] = useState(null);
  const [completions, setCompletions] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      setUserData(data);
      if (!activeExam && data?.targetExams) setActiveExam(data.targetExams[0]);
    });
    return () => unsub();
  }, [activeExam]);

  useEffect(() => {
    if (!userData || !activeExam) return;
    const today = new Date().toISOString().split('T')[0];
    const year = userData.targetYears[activeExam];
    const user = auth.currentUser;

    const q = query(collection(db, "schedules"), where("exam", "==", activeExam), where("year", "==", year), where("date", "==", today));
    const unsubTask = onSnapshot(q, (snap) => setDailyTask(!snap.empty ? snap.docs[0].data() : null));

    const progressId = `${user.uid}-${activeExam}-${today}`;
    const unsubProgress = onSnapshot(doc(db, "progress", progressId), (snap) => setCompletions(snap.exists() ? snap.data().tasks : {}));

    return () => { unsubTask(); unsubProgress(); };
  }, [activeExam, userData]);

  const toggleTask = async (key) => {
    const today = new Date().toISOString().split('T')[0];
    const progressId = `${auth.currentUser.uid}-${activeExam}-${today}`;
    await setDoc(doc(db, "progress", progressId), {
      userId: auth.currentUser.uid,
      userName: userData.name,
      exam: activeExam,
      date: today,
      tasks: { ...completions, [key]: !completions[key] }
    }, { merge: true });
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Exam Switcher */}
        {userData?.targetExams?.length > 1 && (
          <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            {userData.targetExams.map(ex => (
              <button 
                key={ex} 
                onClick={() => setActiveExam(ex)} 
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeExam === ex ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <CalendarDays className="text-blue-600" /> Today's Routine
            </h2>
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                Target {userData?.targetYears?.[activeExam]}
              </p>
              <p className="text-xs font-bold text-slate-400">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>

          {dailyTask ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {['quant', 'reasoning', 'english', 'ga'].map(key => {
                const taskValue = dailyTask[key];
                const hasTask = taskValue && taskValue.trim() !== "";
                const isDone = completions[key];

                return (
                  <div 
                    key={key} 
                    onClick={hasTask ? () => toggleTask(key) : null} 
                    className={`p-6 rounded-[2rem] border flex flex-col justify-between transition-all min-h-[140px] ${
                      !hasTask 
                        ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 cursor-not-allowed' 
                        : isDone 
                          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40 cursor-pointer' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-blue-300 cursor-pointer shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      {/* FIX: Label stays black and bold regardless of task status */}
                      <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${
                        isDone ? 'text-green-600' : 'text-slate-900 dark:text-white'
                      }`}>
                        {SUBJECT_LABELS[key]}
                      </span>
                      
                      {hasTask && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isDone ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-200 dark:text-slate-600 border border-slate-100 dark:border-slate-700'
                        }`}>
                          {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>
                      )}
                    </div>

                    <p className={`text-base font-bold leading-tight ${
                      !hasTask ? 'text-slate-300 italic' : isDone ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {hasTask ? taskValue : "No task assigned"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-slate-300">
                  <CalendarDays size={32} />
               </div>
               <p className="text-slate-400 font-bold italic text-lg">Schedule not found.</p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}