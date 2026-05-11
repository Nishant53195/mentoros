// src/pages/mentor/QuantCreator.jsx
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { doc, setDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import MentorLayout from "@/components/MentorLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, ChevronLeft, ChevronRight, 
  Check, Edit3, Settings2, FileText, CheckCircle, 
  User, Calculator, Clock, Folder
} from "lucide-react";
// LaTeX Renderer (Ensure you npm install react-katex katex)
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const CHAPTERS = [
  "Number System", "Percentage", "Ratio & Proportion", "Square roots", "Averages", 
  "Simple Interest", "Compound Interest", "Profit & Loss", "Partnership", "Mixture Alligation", 
  "Time & Work", "Time & Distance", "Algebra", "Permutation & Combination", "2D mensuration", 
  "3D mensuration", "Trigonometry", "Geometry", "Statistics", "Probability", 
  "Simplification & Approximation", "Number Series", "Data Interpretation", "Caselet DI", "Quadratic Equation"
];

// Helper to render text with inline math separated by $
const renderTextWithMath = (text) => {
  if (!text) return null;
  const parts = text.split('$');
  return parts.map((part, index) => {
    if (index % 2 !== 0) return <InlineMath key={index} math={part} />;
    return <span key={index}>{part}</span>;
  });
};

export default function QuantCreator() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // --- CREATE STATE ---
  const [chapter, setChapter] = useState(CHAPTERS[0]);
  const [title, setTitle] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
  ]);

  // --- DATA STATE ---
  const [savedTests, setSavedTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const unsubTests = onSnapshot(collection(db, "quant_tests"), (snapshot) => {
      setSavedTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSubs = onSnapshot(collection(db, "quant_submissions"), (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubTests(); unsubSubs(); };
  }, []);

  const saveTest = async () => {
    if (!title) return alert("Please enter a title/sub-topic.");
    const docId = `QUANT-${chapter.replace(/\s+/g, '-')}-${Date.now()}`; 
    try {
      await setDoc(doc(db, "quant_tests", docId), {
        chapter, 
        title, 
        questions,
        createdAt: new Date().toISOString()
      });
      alert(`Test saved under ${chapter}!`);
      setTitle("");
      setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);
    } catch (e) { console.error("Save Error:", e); }
  };

  const activeTestDetails = () => {
    const test = savedTests.find(t => t.id === selectedTestId);
    if (!test) return null;
    const testSubs = submissions.filter(s => s.testId === test.id);
    return { test, testSubs };
  };

  const details = activeTestDetails();

  return (
    <MentorLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* TOP NAVIGATION CHIPS */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-md">
            {["create", "manage"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedChapter(null); setSelectedTestId(null); setSelectedStudentId(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
                }`}
              >
                {tab === 'create' ? 'Create Topic Practice' : 'Manage'}
              </button>
            ))}
          </div>
        </div>

        {/* 1. CREATE SECTION */}
        {activeTab === "create" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex-1 space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase">Chapter</label>
                 <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold outline-none dark:text-white border-none">
                   {CHAPTERS.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div className="flex-1 space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase">Sub-Topic / Title</label>
                 <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Root Comparison Level 1" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold outline-none dark:text-white border-none" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                   <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)} className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm disabled:opacity-30"><ChevronLeft size={20} /></button>
                   <p className="text-lg font-black text-slate-900 dark:text-white">Q {currentIdx + 1} / {questions.length}</p>
                   <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(currentIdx + 1)} className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm disabled:opacity-30"><ChevronRight size={20} /></button>
                </div>
                <Button onClick={() => setQuestions([...questions, { questionText: "", options: ["","","",""], correctAnswer: 0, explanation: "" }])} className="bg-blue-600 text-white rounded-xl px-4 py-2 text-xs font-bold">+ Add Question</Button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Question Text (Use $ for inline LaTeX)</label>
                  <textarea 
                    value={questions[currentIdx].questionText} 
                    onChange={(e) => { const q = [...questions]; q[currentIdx].questionText = e.target.value; setQuestions(q); }} 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-slate-900 dark:text-white resize-none" 
                    placeholder="e.g. Find the roots of $x^2 - 5x + 6 = 0$"
                    rows={3}
                  />
                  {/* Live Math Preview */}
                  {questions[currentIdx].questionText && (
                     <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm font-bold text-blue-800 dark:text-blue-200">
                       <span className="text-[9px] uppercase text-blue-400 block mb-1">Preview</span>
                       {renderTextWithMath(questions[currentIdx].questionText)}
                     </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questions[currentIdx].options.map((opt, oIdx) => (
                    <div key={oIdx} className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all ${questions[currentIdx].correctAnswer === oIdx ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30'}`}>
                      <button onClick={() => { const q = [...questions]; q[currentIdx].correctAnswer = oIdx; setQuestions(q); }} className={`mt-2 w-6 h-6 shrink-0 rounded-full border-2 ${questions[currentIdx].correctAnswer === oIdx ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                        {questions[currentIdx].correctAnswer === oIdx && <Check size={12}/>}
                      </button>
                      <div className="w-full">
                        <textarea 
                          value={opt} 
                          onChange={(e) => { const q = [...questions]; q[currentIdx].options[oIdx] = e.target.value; setQuestions(q); }} 
                          className="bg-transparent border-none text-sm font-bold w-full outline-none dark:text-white resize-none py-1" 
                          placeholder={`Option ${String.fromCharCode(65+oIdx)}`}
                          rows={2}
                        />
                        {opt && <div className="text-xs mt-1 opacity-70">{renderTextWithMath(opt)}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Edit3 size={14}/> Detailed Explanation</label>
                  <textarea 
                    value={questions[currentIdx].explanation} 
                    onChange={(e) => { const q = [...questions]; q[currentIdx].explanation = e.target.value; setQuestions(q); }} 
                    className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border-none text-xs font-bold text-slate-700 dark:text-slate-300 resize-none shadow-sm" 
                    placeholder="Explain the shortcut or formula..."
                    rows={3}
                  />
                  {questions[currentIdx].explanation && (
                     <div className="mt-2 text-xs font-bold text-amber-800 dark:text-amber-200">
                       {renderTextWithMath(questions[currentIdx].explanation)}
                     </div>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={saveTest} className="w-full h-16 rounded-[2.5rem] bg-slate-900 dark:bg-blue-600 text-white font-black text-lg shadow-xl">Publish Universal Quant Test</Button>
          </div>
        )}

        {/* 2. MANAGE SECTION */}
        {activeTab === "manage" && !selectedChapter && !selectedTestId && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in">
             {CHAPTERS.map(chap => {
               const count = savedTests.filter(t => t.chapter === chap).length;
               if (count === 0) return null; // Only show active folders
               return (
                 <div key={chap} onClick={() => setSelectedChapter(chap)} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 cursor-pointer transition-all group flex flex-col items-center text-center">
                    <Folder className="text-blue-200 dark:text-blue-900 mb-3 group-hover:text-blue-500 transition-colors" size={40}/>
                    <h3 className="font-black text-sm text-slate-700 dark:text-slate-200 leading-tight">{chap}</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">{count} Sets</p>
                 </div>
               );
             })}
          </div>
        )}

        {/* 2A. CHAPTER DRILL-DOWN */}
        {activeTab === "manage" && selectedChapter && !selectedTestId && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setSelectedChapter(null)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm"><ChevronLeft size={20}/></button>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedChapter}</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {savedTests.filter(t => t.chapter === selectedChapter).map(test => (
                 <div key={test.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-lg text-slate-800 dark:text-slate-100">{test.title}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-1">{test.questions.length} Questions</p>
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={() => setSelectedTestId(test.id)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs h-9">Analysis</Button>
                       <button onClick={async () => { if(window.confirm("Delete?")) await deleteDoc(doc(db, "quant_tests", test.id)) }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* 3. TEST ANALYSIS SECTION */}
        {activeTab === "manage" && selectedTestId && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
               <button onClick={() => { setSelectedTestId(null); setSelectedStudentId(null); }} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm"><ChevronLeft size={20}/></button>
               <div>
                 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">{details.test.title}</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{details.test.chapter}</p>
               </div>
            </div>

            {/* Overall Question Stats */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
                <Settings2 size={18} className="text-blue-600" /> Question Performance
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <th className="p-4 rounded-l-xl">Q No.</th>
                      <th className="p-4">Correct %</th>
                      <th className="p-4">Skipped</th>
                      <th className="p-4 rounded-r-xl">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.test.questions.map((q, idx) => {
                      let correct = 0, skipped = 0, totalTime = 0, attempted = 0;
                      details.testSubs.forEach(sub => {
                        const qData = sub.perQuestionData?.[idx];
                        if (!qData) skipped++;
                        else {
                          attempted++;
                          if (qData.isCorrect) correct++;
                          totalTime += (qData.timeSpent || 0);
                        }
                      });
                      const acc = attempted > 0 ? Math.round((correct/attempted)*100) : 0;
                      const avgTime = attempted > 0 ? Math.round(totalTime/attempted) : 0;

                      return (
                        <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50">
                          <td className="p-4 font-black">Q{idx+1}</td>
                          <td className={`p-4 font-black ${acc > 70 ? 'text-emerald-500' : acc > 40 ? 'text-amber-500' : 'text-red-500'}`}>{acc}%</td>
                          <td className="p-4 text-slate-400 font-bold">{skipped}</td>
                          <td className="p-4 font-black text-blue-600">{avgTime}s</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Student Drill-down */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User size={18} className="text-blue-600" /> Student Deep Dive
                </h4>
                <select 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold border-none text-xs w-full sm:w-64 dark:text-white"
                  value={selectedStudentId || ""}
                >
                  <option value="">Select Student</option>
                  {details.testSubs.map(s => <option key={s.userId} value={s.userId}>{s.userName}</option>)}
                </select>
              </div>

              {selectedStudentId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {details.test.questions.map((q, idx) => {
                    const sub = details.testSubs.find(s => s.userId === selectedStudentId);
                    const qData = sub.perQuestionData?.[idx];
                    const isCorrect = qData?.isCorrect;
                    
                    return (
                      <div key={idx} className={`p-4 rounded-2xl border ${!qData ? 'bg-slate-50 border-slate-100' : isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                         <div className="flex justify-between items-center mb-3">
                           <span className="font-black text-xs">Q{idx+1}</span>
                           {qData && <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-full"><Clock size={10}/> {qData.timeSpent}s</span>}
                         </div>
                         {!qData ? (
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skipped</span>
                         ) : (
                           <div className="flex justify-between text-xs font-bold">
                             <span className={isCorrect ? 'text-emerald-600' : 'text-red-600'}>Picked: {String.fromCharCode(65 + qData.answer)}</span>
                             {!isCorrect && <span className="text-emerald-600">Ans: {String.fromCharCode(65 + q.correctAnswer)}</span>}
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </MentorLayout>
  );
}