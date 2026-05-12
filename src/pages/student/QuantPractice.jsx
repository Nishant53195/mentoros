// src/pages/student/QuantPractice.jsx
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot, setDoc, collection, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/StudentLayout";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, ChevronRight, PlayCircle, RotateCcw, 
  History, Clock, CheckCircle2, XCircle, Folder
} from "lucide-react";
// LaTeX Renderer
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Added renderError to prevent LaTeX from failing silently
// The Ultimate Crash-Proof KaTeX Renderer
const renderMath = (text) => {
  if (!text) return null;
  const parts = text.split('$');
  
  return parts.map((part, index) => {
    // Odd indexes are math (because they are inside the $ signs)
    if (index % 2 !== 0) {
      try {
        // We ask KaTeX to generate the raw HTML safely
        const html = katex.renderToString(part, {
          throwOnError: false, // If there's a typo, it shows it safely instead of crashing
          displayMode: false,  // Forces it to stay inline with your text
          strict: false        // Forgives minor LaTeX spacing errors
        });
        
        // We inject the perfect HTML straight into React
        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
      } catch (err) {
        return <span key={index} className="text-red-500">{part}</span>;
      }
    }
    // Even indexes are normal text
    return <span key={index}>{part}</span>;
  });
};

export default function QuantPractice() {
  const navigate = useNavigate();
  const [availableTests, setAvailableTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Navigation State
  const [selectedChapter, setSelectedChapter] = useState(null);
  
  // Practice Engine State
  const [test, setTest] = useState(null);
  const [mode, setMode] = useState(null); // 'practice', 'reattempt', 'review'
  const [currentQ, setCurrentQ] = useState(0);
  const [perQuestionData, setPerQuestionData] = useState({}); // { 0: { timeSpent: 12, answer: 1, isCorrect: false }, ... }
  const [activeTimer, setActiveTimer] = useState(0);
  const [lastAttemptData, setLastAttemptData] = useState(null); // Used for reattempt mode
  const timerRef = useRef(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubTests = onSnapshot(collection(db, "quant_tests"), (snap) => {
      setAvailableTests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSubs = onSnapshot(query(collection(db, "quant_submissions")), (snap) => {
      // Filter locally for the user
      const userSubs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(s => s.userId === user.uid);
      setSubmissions(userSubs);
    });

    return () => { unsubTests(); unsubSubs(); };
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    // Only run timer if in active practice/reattempt mode AND the question hasn't been answered yet
    if ((mode === 'practice' || mode === 'reattempt') && test && !perQuestionData[currentQ]?.answer && perQuestionData[currentQ]?.answer !== 0) {
      // Load previous accumulated time for this specific question
      setActiveTimer(perQuestionData[currentQ]?.timeSpent || 0);
      
      timerRef.current = setInterval(() => {
        setActiveTimer(prev => {
          const newTime = prev + 1;
          // Silently update the master record so if they skip, time is saved
          setPerQuestionData(curr => ({
            ...curr,
            [currentQ]: { ...curr[currentQ], timeSpent: newTime }
          }));
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [currentQ, mode, test, perQuestionData[currentQ]?.answer]);

  // --- ANSWER HANDLING ---
  const handleAnswer = (optionIdx) => {
    if (perQuestionData[currentQ]?.answer !== undefined) return; // Prevent double clicking
    clearInterval(timerRef.current); // Stop timer immediately

    const isCorrect = optionIdx === test.questions[currentQ].correctAnswer;
    setPerQuestionData(prev => ({
      ...prev,
      [currentQ]: { timeSpent: activeTimer, answer: optionIdx, isCorrect }
    }));
  };

  // --- SUBMIT SESSION ---
  const submitSession = async () => {
    const user = auth.currentUser;
    // Calculate total marks (Correct = +1, Wrong = -0.25)
    let correct = 0, incorrect = 0;
    Object.values(perQuestionData).forEach(data => {
      if (data.answer !== undefined) {
        if (data.isCorrect) correct++;
        else incorrect++;
      }
    });

    const subId = `${user.uid}-${test.id}`;
    
    // In reattempt, we just overwrite the submission (or you could append to an attempts array)
    await setDoc(doc(db, "quant_submissions", subId), {
      userId: user.uid,
      userName: user.displayName || "Student",
      testId: test.id,
      chapter: test.chapter,
      perQuestionData,
      marks: (correct * 1) - (incorrect * 0.25),
      timestamp: new Date().toISOString()
    });

    setTest(null);
    setMode(null);
    navigate("/student-dashboard", { replace: true }); // Redirect as requested
  };

  // --- UI: ACTIVE PRACTICE ENGINE ---
  if (test && mode) {
    const q = test.questions[currentQ];
    const isAnswered = perQuestionData[currentQ]?.answer !== undefined;
    const isReviewMode = mode === 'review';
    
    // Reference data for reattempt/review
    const previousQData = lastAttemptData?.perQuestionData?.[currentQ];

    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col font-sans animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-sm">
           <div className="flex items-center gap-4">
             <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest">
               Q {currentQ + 1} / {test.questions.length}
             </span>
             <h2 className="hidden sm:block text-sm font-black text-slate-800 dark:text-slate-200 truncate max-w-xs">{test.title}</h2>
           </div>

           <div className="flex items-center gap-6">
             {/* Dynamic Timer Display */}
             {!isReviewMode && (
               <div className={`flex items-center gap-2 font-mono text-lg font-black ${isAnswered ? 'text-slate-400' : 'text-blue-600'}`}>
                 <Clock size={18} />
                 {Math.floor(activeTimer / 60).toString().padStart(2, '0')}:{(activeTimer % 60).toString().padStart(2, '0')}
               </div>
             )}
             <Button onClick={submitSession} className="h-9 bg-slate-900 dark:bg-slate-800 text-white font-bold px-6 rounded-xl shadow-lg hover:bg-slate-800">Finish Session</Button>
           </div>
        </header>

        {/* MAIN QUESTION AREA - Increased pb-48 for full scrollability */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
           <div className="w-full max-w-3xl space-y-6 pb-48">
             
             {/* Reattempt Comparison Banner */}
             {mode === 'reattempt' && isAnswered && previousQData && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl flex justify-between text-xs font-bold text-amber-800 dark:text-amber-400 mb-4">
                  <span>Last Attempt: {String.fromCharCode(65 + previousQData.answer)}</span>
                  <span>Previous Time: {previousQData.timeSpent}s</span>
                </div>
             )}

             {/* Smaller Question Text */}
             <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">
               {renderMath(q.questionText)}
             </h3>

             <div className="space-y-3">
               {q.options.map((opt, idx) => {
                 const isPicked = perQuestionData[currentQ]?.answer === idx;
                 const isCorrectAns = q.correctAnswer === idx;
                 
                 // Styling logic based on state
                 let boxStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-sm cursor-pointer";
                 let icon = <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-blue-500 group-hover:border-blue-500">{String.fromCharCode(65 + idx)}</span>;

                 if (isAnswered || isReviewMode) {
                   boxStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-default"; // Default inactive
                   icon = <span className="w-5 h-5 rounded-full border-2 border-slate-200 text-slate-300 flex items-center justify-center text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>;

                   // Override if this is the correct answer
                   if (isCorrectAns) {
                     boxStyle = "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-400 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20";
                     icon = <CheckCircle2 className="text-emerald-500" size={20} />;
                   }
                   // Override if this was picked and is wrong
                   else if (isPicked && !isCorrectAns) {
                     boxStyle = "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800";
                     icon = <XCircle className="text-red-500" size={20} />;
                   }
                 }

                 return (
                   <div 
                     key={idx} 
                     onClick={() => !isAnswered && !isReviewMode && handleAnswer(idx)}
                     className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex items-start gap-3 group ${boxStyle}`}
                   >
                     <div className="mt-0.5 shrink-0">{icon}</div>
                     {/* Smaller Option Text */}
                     <span className="text-sm font-bold text-slate-700 dark:text-slate-200 pt-0.5">{renderMath(opt)}</span>
                   </div>
                 );
               })}
             </div>

             {/* INSTANT EXPLANATION REVEAL WITH TIMER FIX */}
             {(isAnswered || isReviewMode) && q.explanation && (
               <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800/50 animate-in slide-in-from-bottom-4 mt-6">
                 <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                   <span>Mentor Explanation</span>
                   <span className="text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                     Time Taken: {perQuestionData[currentQ]?.timeSpent || activeTimer || 0}s
                   </span>
                 </h4>
                 <div className="text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-200">
                   {renderMath(q.explanation)}
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* BOTTOM NAVIGATION PALETTE */}
        <footer className="fixed bottom-0 w-full h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(q => q - 1)} className="rounded-xl font-bold border-slate-200 dark:border-slate-700 w-12 h-10 p-0"><ChevronLeft size={20}/></Button>
           
           {/* Mini Palette */}
           <div className="flex gap-2 overflow-x-auto px-4 max-w-[50vw]">
             {test.questions.map((_, i) => {
               const answered = perQuestionData[i]?.answer !== undefined;
               return (
                 <button 
                   key={i} 
                   onClick={() => setCurrentQ(i)}
                   className={`shrink-0 w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${
                     currentQ === i 
                     ? 'border-slate-900 bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-110' 
                     : answered 
                       ? perQuestionData[i].isCorrect ? 'bg-emerald-100 text-emerald-700 border-transparent' : 'bg-red-100 text-red-700 border-transparent'
                       : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                   }`}
                 >
                   {i+1}
                 </button>
               );
             })}
           </div>

           <Button disabled={currentQ === test.questions.length - 1} onClick={() => setCurrentQ(q => q + 1)} className="rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 w-12 h-10 p-0"><ChevronRight size={20}/></Button>
        </footer>
      </div>
    );
  }

  // --- UI: CHAPTER & TEST SELECTION ---
  const activeChapters = [...new Set(availableTests.map(t => t.chapter))];

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {!selectedChapter ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Quant Practice</h2>
              <p className="text-slate-500 font-medium">Select a chapter to begin speed drills.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in">
               {activeChapters.map(chap => {
                 const count = availableTests.filter(t => t.chapter === chap).length;
                 return (
                   <div key={chap} onClick={() => setSelectedChapter(chap)} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 cursor-pointer transition-all group flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Folder className="text-blue-600 dark:text-blue-400" size={24}/>
                      </div>
                      <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 leading-tight mb-2">{chap}</h3>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-lg uppercase">{count} Sets</span>
                   </div>
                 );
               })}
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setSelectedChapter(null)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:bg-slate-50"><ChevronLeft size={20}/></button>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedChapter}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {availableTests.filter(t => t.chapter === selectedChapter).map(test => {
                 // Check if user has attempted this test
                 const submission = submissions.find(s => s.testId === test.id);
                 const isCompleted = !!submission;

                 return (
                   <div key={test.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                           <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{test.title}</h3>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{test.questions.length} Questions</p>
                         </div>
                         {isCompleted && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Completed</span>}
                      </div>

                      <div className="mt-auto pt-6 space-y-3">
                        {!isCompleted ? (
                          <Button 
                            onClick={() => { setTest(test); setMode('practice'); setPerQuestionData({}); setCurrentQ(0); setLastAttemptData(null); }} 
                            className="w-full bg-blue-600 text-white font-black h-12 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                          >
                            <PlayCircle size={18}/> Start Practice
                          </Button>
                        ) : (
                          <>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Score</span>
                              <span className="text-base font-black text-blue-600">{submission.marks}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => { setTest(test); setMode('reattempt'); setPerQuestionData({}); setCurrentQ(0); setLastAttemptData(submission); }} 
                                className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 font-black h-12 rounded-xl flex items-center justify-center gap-2"
                              >
                                <RotateCcw size={16}/> Reattempt
                              </Button>
                              <Button 
                                onClick={() => { setTest(test); setMode('review'); setPerQuestionData(submission.perQuestionData); setCurrentQ(0); setLastAttemptData(null); }} 
                                className="flex-1 bg-slate-900 dark:bg-slate-700 text-white font-black h-12 rounded-xl shadow-md flex items-center justify-center gap-2"
                              >
                                <History size={16}/> Review
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}