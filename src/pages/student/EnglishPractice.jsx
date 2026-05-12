// src/pages/student/EnglishPractice.jsx
import { useEffect, useState, useMemo } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot, setDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import StudentLayout from "@/components/StudentLayout";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, Trophy, Clock, History, LayoutDashboard, 
  ChevronLeft, ChevronRight, Bookmark, Send, BarChart3, TrendingUp,
  Target, Activity, Calendar, Medal, Crown 
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePreventLeave } from "../../hooks/UsePreventLeave"; // Hook imported here

export default function EnglishPractice() {
  const [activeChip, setActiveChip] = useState("today"); // today, attempted, analysis
  const [availableTests, setAvailableTests] = useState([]);
  const [test, setTest] = useState(null); // The test currently being taken
  const [submissions, setSubmissions] = useState([]);
  const [viewingResultId, setViewingResultId] = useState(null);
  const [showPassage, setShowPassage] = useState(false);
  
  // Exam Engine State
  const [isTesting, setIsTesting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  // ==========================================
  // PREVENT ACCIDENTAL LEAVE HOOK CALLED HERE
  // ==========================================
  usePreventLeave(isTesting);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch all universal tests for today
    const q = query(collection(db, "english_tests"), where("date", "==", today));
    const unsubTests = onSnapshot(q, (snap) => {
      setAvailableTests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // 2. Fetch User Submissions (History)
    const unsubSubs = onSnapshot(query(collection(db, "english_submissions"), where("userId", "==", user.uid)), (snap) => {
      const subs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(subs.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    return () => { unsubTests(); unsubSubs(); };
  }, []);

  const handleSubmit = async () => {
    if (!window.confirm("Submit your answers?")) return;
    const endTime = Date.now();
    const secondsUsed = Math.floor((endTime - startTime) / 1000); // Time in seconds
    let attempted = 0, correct = 0, incorrect = 0;
    
    test.questions.forEach((q, i) => {
      if (answers[i] !== undefined) {
        attempted++;
        if (answers[i] === q.correctAnswer) correct++;
        else incorrect++;
      }
    });

    const marks = (correct * 1) - (incorrect * 0.25);
    const result = { attempted, correct, incorrect, marks };
    const today = new Date().toISOString().split('T')[0];
    
    // Unique ID for submission: user-date-type
    const subId = `${auth.currentUser.uid}-${today}-${test.type}`;

    await setDoc(doc(db, "english_submissions", subId), {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || "Student",
      date: today,
      type: test.type,
      scorecard: result,
      answers,
      timeTaken: secondsUsed, // NEW FIELD
      timestamp: new Date().toISOString()
    });

    setIsTesting(false);
    setActiveChip("attempted");
  };

  // UI: THE EXAM SIMULATOR
  if (isTesting && test) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col font-sans animate-in slide-in-from-right duration-300">
        
        {/* 1. COMPACT HEADER */}
        <header className="h-14 bg-slate-900 text-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded">Q{currentQ + 1}</span>
            <button 
              onClick={() => setShowPassage(!showPassage)}
              className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg lg:hidden"
            >
              {showPassage ? "Close Passage" : "View Passage"}
            </button>
          </div>
          <div className="flex gap-2">
             <Button onClick={handleSubmit} className="h-8 text-[10px] font-black bg-red-600 hover:bg-red-700 border-none px-4">SUBMIT</Button>
          </div>
        </header>

        {/* 2. MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* PASSAGE: On mobile, it's an absolute overlay when toggled. On desktop, it's the left half. */}
          <div className={`
            ${showPassage ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} 
            absolute lg:relative inset-0 lg:w-1/2 bg-white dark:bg-slate-900 z-20 
            transition-transform duration-300 ease-in-out p-6 lg:p-10 
            overflow-y-auto border-r border-slate-200 dark:border-slate-800
          `}>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Comprehension</h3>
               <button onClick={() => setShowPassage(false)} className="lg:hidden text-blue-600 font-black text-xs uppercase">Close ×</button>
            </div>
            <p className="text-sm lg:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium">
              {test.passage}
            </p>
          </div>

          {/* QUESTION AREA: Takes full width on mobile, 1/3rd on desktop */}
          <div className="flex-1 lg:w-1/3 p-6 lg:p-10 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            <div className="max-w-2xl mx-auto">
              <h4 className="text-xs font-black italic underline mb-4 text-slate-400">Question:</h4>
              <p className="text-base lg:text-lg font-black text-slate-900 dark:text-white mb-8 leading-tight whitespace-pre-line">
                {test.questions[currentQ].questionText}
              </p>

              <div className="space-y-3 pb-24 lg:pb-0">
                {test.questions[currentQ].options.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (answers[currentQ] === i) {
                        // Uncheck if already selected
                        const newAnswers = { ...answers };
                        delete newAnswers[currentQ];
                        setAnswers(newAnswers);
                      } else {
                        // Check new answer
                        setAnswers({...answers, [currentQ]: i});
                      }
                    }}
                    className={`flex items-start gap-4 p-4 cursor-pointer border-2 rounded-2xl transition-all select-none ${
                      answers[currentQ] === i 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-500/5' 
                      : 'border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-200'
                    }`}
                  >
                    {/* Replaced native radio with custom div to prevent default radio stuck behavior */}
                    <div className={`w-5 h-5 mt-0.5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${answers[currentQ] === i ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                       {answers[currentQ] === i && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm lg:text-base font-bold text-slate-700 dark:text-slate-300 whitespace-pre-line leading-snug">
                      {opt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PALETTE: Hidden on mobile, shown on desktop side */}
          <div className="hidden lg:flex w-1/6 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Question Palette</p>
            <div className="grid grid-cols-4 gap-2">
              {test.questions.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentQ(i)} 
                  className={`h-9 w-9 rounded-lg text-[10px] font-black border transition-all ${
                    currentQ === i 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 scale-110 shadow-md' 
                    : answers[i] !== undefined 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. MOBILE BOTTOM NAVIGATION */}
        <footer className="lg:hidden h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
          <Button 
            variant="outline" 
            disabled={currentQ === 0} 
            onClick={() => setCurrentQ(currentQ - 1)}
            className="rounded-xl border-slate-200 dark:border-slate-800 font-bold"
          >
            <ChevronLeft size={20} />
          </Button>

          {/* Question Counter / Mini Palette Trigger */}
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</p>
            <p className="text-sm font-black">{currentQ + 1} / {test.questions.length}</p>
          </div>

          <Button 
            onClick={() => {
              if(currentQ < test.questions.length - 1) setCurrentQ(currentQ + 1);
            }}
            className="rounded-xl bg-blue-600 text-white shadow-lg"
          >
            {currentQ === test.questions.length - 1 ? 'End' : <ChevronRight size={20} />}
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CHIP NAVIGATION */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-lg">
            {["today", "attempted", "analysis"].map((chip) => (
              <button key={chip} onClick={() => { setActiveChip(chip); setViewingResultId(null); }} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeChip === chip ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                {chip === "today" ? "Today's Practice" : chip === "attempted" ? "Attempted" : "Analysis"}
              </button>
            ))}
          </div>
        </div>

        {/* 1. TODAY'S PRACTICE TAB */}
        {activeChip === "today" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {availableTests.map((t) => {
              const sub = submissions.find(s => s.date === t.date && s.type === t.type);
              const isDone = !!sub;

              return (
                <div key={t.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {isDone ? <CheckCircle2 size={24}/> : <Trophy size={24}/>}
                  </div>
                  <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">{t.type} Challenge</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">{t.questions.length} Questions</p>
                  
                  {isDone ? (
                    <div className="mt-auto w-full">
                       <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-4">Completed ✓</p>
                       <Button onClick={() => { setViewingResultId(sub.id); setActiveChip("attempted"); }} className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold h-10 rounded-xl">Review Solution</Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => { 
                        setTest(t); 
                        setAnswers({});
                        setCurrentQ(0);
                        setStartTime(Date.now()); // Capture start time
                        setIsTesting(true); 
                      }}
                      className="w-full bg-blue-600 text-white font-black h-12 rounded-2xl shadow-lg mt-auto hover:bg-blue-700 transition-all"
                    >
                      Start Practice
                    </Button>
                  )}
                </div>
              );
            })}
            {!loading && availableTests.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">No English tasks scheduled for today.</div>
            )}
          </div>
        )}

        {/* 2. ATTEMPTED PRACTICE TAB */}
        {activeChip === "attempted" && (
           <div className="space-y-6">
             {!viewingResultId ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5">
                 {submissions.slice(0, 5).map((sub) => {
                   const accuracy = sub.scorecard.attempted > 0 
                     ? Math.round((sub.scorecard.correct / sub.scorecard.attempted) * 100) 
                     : 0;
                   return (
                     <div key={sub.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 transition-all group">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {new Date(sub.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </h3>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded uppercase">{sub.type}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-8 pt-4 border-t border-slate-50 dark:border-slate-800">
                          <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Att.</p><p className="text-sm font-bold">{sub.scorecard.attempted}</p></div>
                          <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct</p><p className="text-sm font-bold text-emerald-500">{sub.scorecard.correct}</p></div>
                          <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Wrong</p><p className="text-sm font-bold text-red-500">{sub.scorecard.incorrect}</p></div>
                          <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Marks</p><p className="text-sm font-black text-blue-600">{sub.scorecard.marks.toFixed(2)}</p></div>
                          <div className="text-center col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Accuracy</p><p className={`text-sm font-black ${accuracy > 70 ? 'text-emerald-500' : accuracy > 40 ? 'text-amber-500' : 'text-red-500'}`}>{accuracy}%</p></div>
                        </div>
                        <Button onClick={() => setViewingResultId(sub.id)} className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold h-12 rounded-2xl shadow-xl">Review Solution</Button>
                     </div>
                   );
                 })}
                 {submissions.length === 0 && <div className="col-span-full py-20 text-center font-bold text-slate-400">No practice sessions completed yet.</div>}
               </div>
             ) : (
               <ResultView sub={submissions.find(s => s.id === viewingResultId)} onBack={() => setViewingResultId(null)} />
             )}
           </div>
        )}

        {/* 3. ANALYSIS TAB */}
        {activeChip === "analysis" && <AnalysisDashboard submissions={submissions} />}

      </div>
    </StudentLayout>
  );
}

// COMPONENT: SOLUTION REVIEW (SPLIT PANE)
function ResultView({ sub, onBack }) {
  const [testData, setTestData] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [showPassage, setShowPassage] = useState(false);
  
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "english_tests", `${sub.date}-${sub.type}`), (snap) => {
      if (snap.exists()) setTestData(snap.data());
    });
    return () => unsub();
  }, [sub.date, sub.type]);

  if (!testData) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Loading Solution...</div>;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col font-sans animate-in slide-in-from-bottom-5 duration-300">
      
      {/* 1. ADAPTIVE HEADER */}
      <header className="h-14 bg-slate-900 text-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div className="hidden sm:block h-4 w-[1px] bg-white/20 mx-1"></div>
          <button 
            onClick={() => setShowPassage(!showPassage)}
            className="text-[10px] font-black uppercase tracking-widest bg-blue-600 px-3 py-1.5 rounded-lg lg:hidden"
          >
            {showPassage ? "Close Text" : "View Passage"}
          </button>
          <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1.5 rounded-lg">
            Review: {testData.type}
          </span>
        </div>

        <div className="flex gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
           <div className="flex flex-col items-end">
              <span className="text-slate-500">Marks</span>
              <span className="text-blue-400 leading-none">{sub.scorecard.marks.toFixed(2)}</span>
           </div>
           <div className="flex flex-col items-end border-l border-white/10 pl-3">
              <span className="text-slate-500">Correct</span>
              <span className="text-emerald-400 leading-none">{sub.scorecard.correct}</span>
           </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* PASSAGE PANEL (Mobile Toggle / Desktop Left) */}
        <div className={`
          ${showPassage ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} 
          absolute lg:relative inset-0 lg:w-1/2 bg-white dark:bg-slate-900 z-20 
          transition-transform duration-300 ease-in-out p-6 lg:p-10 
          overflow-y-auto border-r border-slate-200 dark:border-slate-800
        `}>
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comprehension Passage</h3>
             <button onClick={() => setShowPassage(false)} className="lg:hidden text-blue-600 font-black text-xs uppercase">Close ×</button>
          </div>
          <p className="text-sm lg:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium">
            {testData.passage}
          </p>
        </div>

        {/* QUESTION ANALYSIS AREA */}
        <div className="flex-1 lg:w-1/3 p-6 lg:p-10 overflow-y-auto bg-slate-50 dark:bg-slate-950">
           <div className="max-w-2xl mx-auto space-y-8 pb-24 lg:pb-0">
             
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-black italic underline text-slate-400">Analysis Q{currentQ + 1}</h4>
                {sub.answers[currentQ] === testData.questions[currentQ].correctAnswer ? (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md uppercase">Correct ✓</span>
                ) : sub.answers[currentQ] === undefined ? (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-200 px-2 py-1 rounded-md uppercase">Not Attempted</span>
                ) : (
                  <span className="text-[9px] font-black text-red-600 bg-red-100 px-2 py-1 rounded-md uppercase">Wrong ✗</span>
                )}
             </div>

             <p className="text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight whitespace-pre-line">
               {testData.questions[currentQ].questionText}
             </p>

             <div className="space-y-3">
               {testData.questions[currentQ].options.map((opt, oIdx) => {
                 const isCorrect = oIdx === testData.questions[currentQ].correctAnswer;
                 const isStudentPick = oIdx === sub.answers[currentQ];
                 
                 return (
                   <div 
                     key={oIdx} 
                     className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${
                       isCorrect 
                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' 
                        : isStudentPick 
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800 text-red-700 dark:text-red-400' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                     }`}
                   >
                     <span className="shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black">
                        {String.fromCharCode(65 + oIdx)}
                     </span>
                     <span className="text-sm lg:text-base font-bold whitespace-pre-line leading-snug">
                       {opt}
                     </span>
                   </div>
                 );
               })}
             </div>

             {/* MENTOR EXPLANATION BOX */}
             <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800 shadow-inner">
                <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={14} /> Mentor's Logic
                </h5>
                <p className="text-xs font-bold leading-relaxed text-blue-800 dark:text-blue-300 italic whitespace-pre-line">
                  {testData.questions[currentQ].explanation}
                </p>
             </div>
           </div>
        </div>

        {/* SOLUTION PALETTE (Desktop Only) */}
        <div className="hidden lg:flex w-1/6 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Solution Palette</p>
          <div className="grid grid-cols-4 gap-2 mb-8">
             {testData.questions.map((q, i) => {
               const isCorrect = sub.answers[i] === q.correctAnswer;
               const isSkipped = sub.answers[i] === undefined;
               return (
                 <button
                   key={i}
                   onClick={() => setCurrentQ(i)}
                   className={`h-9 w-9 rounded-md text-[10px] font-black border-2 transition-all ${
                     currentQ === i 
                      ? 'border-slate-900 bg-white text-slate-900 scale-110 z-10' 
                      : isSkipped ? 'bg-slate-200 text-slate-500 border-transparent'
                      : isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-red-500 border-red-500 text-white'
                   }`}
                 >
                   {i + 1}
                 </button>
               );
             })}
          </div>
          <div className="mt-auto p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
             <LegendItem color="bg-emerald-500" label="Correct" />
             <LegendItem color="bg-red-500" label="Wrong" />
             <LegendItem color="bg-slate-200" label="Skipped" />
          </div>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <footer className="lg:hidden h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
        <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)} className="rounded-xl font-bold border-slate-200 dark:border-slate-800 h-10 w-12 p-0">
          <ChevronLeft size={20} />
        </Button>

        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Analysing</p>
          <p className="text-sm font-black">{currentQ + 1} / {testData.questions.length}</p>
        </div>

        <Button 
          variant="outline"
          disabled={currentQ === testData.questions.length - 1}
          onClick={() => setCurrentQ(currentQ + 1)}
          className="rounded-xl border-slate-200 dark:border-slate-800 h-10 w-12 p-0"
        >
          <ChevronRight size={20} />
        </Button>
      </footer>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-[9px] font-black uppercase">
      <div className={`w-2.5 h-2.5 rounded-sm ${color}`}></div>
      <span className="text-slate-400">{label}</span>
    </div>
  );
}

// COMPONENT: ANALYSIS DASHBOARD (DUAL GRAPHS)
function AnalysisDashboard({ submissions }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const types = ["RC", "Cloze"];
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's global leaderboard across all students
  useEffect(() => {
    setLoadingLeaderboard(true);
    // Query submissions for today's date, ordered by marks
    const q = query(
      collection(db, "english_submissions"), 
      where("date", "==", today),
      orderBy("scorecard.marks", "desc"),
      orderBy("timeTaken", "asc") // Tie-breaker!
    );

    const unsub = onSnapshot(q, (snap) => {
      const globalSubs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // If a student has multiple entries (RC and Cloze), they will show as separate rows
      setLeaderboard(globalSubs);
      setLoadingLeaderboard(false);
    });

    return () => unsub();
  }, [today]);

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-700">
      
      {/* --- SECTION 1: TODAY'S HALL OF FAME (LEADERBOARD) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
             <Crown className="text-yellow-500" size={28} /> Today's Hall of Fame
           </h3>
           <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-2xl">
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
                  const isCurrentUser = entry.userId === auth.currentUser.uid;
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
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black uppercase">
                            {entry.userName?.charAt(0)}
                          </div>
                          <span className={`text-sm font-bold ${isCurrentUser ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            {entry.userName} {isCurrentUser && "(You)"}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
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

      <div className="px-4"><hr className="border-slate-100 dark:border-slate-800" /></div>

      {/* --- SECTION 2: PERSONAL ANALYTICS (GRAPHS) --- */}
      <div className="px-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="text-blue-600" /> Personal Growth Curve
        </h3>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Historical Performance Tracking</p>
      </div>

      {types.map((type) => {
        const rawData = [...submissions].filter((s) => s.type === type).reverse();
        const data = rawData.map(s => ({
          ...s,
          displayAccuracy: s.scorecard.attempted > 0 ? Math.round((s.scorecard.correct / s.scorecard.attempted) * 100) : 0
        }));

        const avgMarks = data.length ? (data.reduce((acc, curr) => acc + curr.scorecard.marks, 0) / data.length).toFixed(1) : 0;
        const avgAcc = data.length ? (data.reduce((acc, curr) => acc + curr.displayAccuracy, 0) / data.length).toFixed(0) : 0;

        return (
          <div key={type} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BarChart3 className="text-blue-600 opacity-50" size={20} /> {type} Analysis
              </h3>
              <div className="flex gap-3">
                <div className="bg-white dark:bg-slate-900 px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Marks</p>
                  <p className="text-xl font-black text-blue-600">{avgMarks}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Acc.</p>
                  <p className="text-xl font-black text-emerald-500">{avgAcc}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 0 }}>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Marks Trend</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id={`colorMarks-${type}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" domain={[0, 'auto']} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="scorecard.marks" stroke="#2563eb" fillOpacity={1} fill={`url(#colorMarks-${type})`} strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Accuracy % Trend</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id={`colorAcc-${type}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="displayAccuracy" name="Accuracy %" stroke="#10b981" fillOpacity={1} fill={`url(#colorAcc-${type})`} strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}