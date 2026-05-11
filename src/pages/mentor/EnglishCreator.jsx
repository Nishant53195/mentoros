// src/pages/mentor/EnglishCreator.jsx
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { doc, setDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import MentorLayout from "@/components/MentorLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Save, ChevronLeft, ChevronRight, 
  Check, Edit3, Calendar, BarChart3, Settings2, 
  FileText, CheckCircle, History, User, Target 
} from "lucide-react";

export default function EnglishCreator() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // --- UNIVERSAL STATE ---
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState("RC");
  const [passage, setPassage] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", "", ""], correctAnswer: 0, explanation: "" }
  ]);

  const [savedTests, setSavedTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const unsubTests = onSnapshot(collection(db, "english_tests"), (snapshot) => {
      const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      tests.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSavedTests(tests);
    });
    const unsubSubs = onSnapshot(collection(db, "english_submissions"), (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubTests(); unsubSubs(); };
  }, []);

  const saveTest = async () => {
  // New ID includes Type so they don't overwrite each other
  const docId = `${date}-${type}`; 
  try {
    await setDoc(doc(db, "english_tests", docId), {
      date, 
      type, 
      passage, 
      questions,
      createdAt: new Date().toISOString()
    });
    alert(`${type} Test Synced Successfully!`);
  } catch (e) { console.error("Save Error:", e); }
};

  const loadForEdit = (test) => {
    setDate(test.date);
    setType(test.type); 
    setPassage(test.passage); 
    setQuestions(test.questions);
    setCurrentIdx(0); 
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to get stats for a specific test
  const getActiveTestDetails = () => {
    const test = savedTests.find(t => t.id === selectedTestId);
    if (!test) return null;
    // Submissions are linked by date in the universal setup
    const testSubs = submissions.filter(s => s.date === test.date);
    return { test, testSubs };
  };

  const details = getActiveTestDetails();

  return (
    <MentorLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* TOP NAVIGATION CHIPS */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-md">
            {["create", "manage", "analysis"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedTestId(null); setSelectedStudentId(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 1. CREATE SECTION */}
        {activeTab === "create" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <Calendar className="text-blue-600" size={20} />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl font-bold border-none text-xs dark:text-white" />
              </div>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                {["RC", "Cloze"].map(t => (
                  <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${type === t ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{t}</button>
                ))}
              </div>
            </div>

            <textarea 
              value={passage} onChange={(e) => setPassage(e.target.value)}
              placeholder="Paste passage or Cloze text here..."
              className="w-full min-h-[250px] p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-base outline-none dark:text-white"
            />

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                   <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)} className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm disabled:opacity-30"><ChevronLeft size={20} /></button>
                   <p className="text-lg font-black text-slate-900 dark:text-white">{currentIdx + 1} / {questions.length}</p>
                   <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(currentIdx + 1)} className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm disabled:opacity-30"><ChevronRight size={20} /></button>
                </div>
                <Button onClick={() => setQuestions([...questions, { questionText: "", options: ["","","","",""], correctAnswer: 0, explanation: "" }])} className="bg-blue-600 text-white rounded-xl px-4 py-2 text-xs font-bold">+ Add Question</Button>
              </div>
              {/* UPDATED: Question Text as Textarea */}
<textarea 
  value={questions[currentIdx].questionText} 
  onChange={(e) => { const q = [...questions]; q[currentIdx].questionText = e.target.value; setQuestions(q); }} 
  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-slate-900 dark:text-white resize-none" 
  placeholder="Type your question here (multi-line supported)..."
  rows={3}
/>

<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {questions[currentIdx].options.map((opt, oIdx) => (
    <div key={oIdx} className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all ${questions[currentIdx].correctAnswer === oIdx ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30'}`}>
      <button 
        onClick={() => { const q = [...questions]; q[currentIdx].correctAnswer = oIdx; setQuestions(q); }} 
        className={`mt-2 w-6 h-6 shrink-0 rounded-full border-2 ${questions[currentIdx].correctAnswer === oIdx ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}
      >
        {questions[currentIdx].correctAnswer === oIdx && <Check size={12}/>}
      </button>
      
      {/* UPDATED: Options as Textarea */}
      <textarea 
        value={opt} 
        onChange={(e) => { const q = [...questions]; q[currentIdx].options[oIdx] = e.target.value; setQuestions(q); }} 
        className="bg-transparent border-none text-sm font-bold w-full outline-none dark:text-white resize-none py-1" 
        placeholder={`Option ${String.fromCharCode(65+oIdx)}`}
        rows={2}
      />
    </div>
  ))}
</div>
            </div>
            <Button onClick={saveTest} className="w-full h-16 rounded-[2.5rem] bg-slate-900 dark:bg-blue-600 text-white font-black text-lg shadow-xl">Push Universal Test</Button>
          </div>
        )}

        {/* 2. MANAGE SECTION */}
        {activeTab === "manage" && (
          <div className="space-y-10 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTests.map(test => (
                  <div key={test.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                       <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-lg">{test.type}</span>
                       <p className="text-xs font-bold text-slate-400">{test.date}</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 italic mb-6">"{test.passage}"</p>
                    <div className="flex gap-2">
                       <button onClick={() => loadForEdit(test)} className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all dark:text-white">Edit</button>
                       <button onClick={async () => { if(window.confirm("Delete?")) await deleteDoc(doc(db, "english_tests", test.id)) }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* 3. ANALYSIS SECTION (Overhauled) */}
        {activeTab === "analysis" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {!selectedTestId ? (
              /* LIST VIEW: Select a practice */
              <div className="space-y-12">
                {["RC", "Cloze"].map(sectionType => (
                  <div key={sectionType} className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 px-2 uppercase tracking-tight">
                      <FileText className="text-blue-600" /> {sectionType} Practices
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedTests.filter(t => t.type === sectionType).map(test => {
                        const subCount = submissions.filter(s => s.date === test.date).length;
                        return (
                          <div 
                            key={test.id} 
                            onClick={() => setSelectedTestId(test.id)}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 cursor-pointer transition-all group"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-xs font-black text-slate-400 group-hover:text-blue-600">{test.date}</p>
                              <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                                <CheckCircle size={12}/> {subCount} Subs
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic">"{test.passage}"</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* DRILL-DOWN VIEW */
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => { setSelectedTestId(null); setSelectedStudentId(null); }} className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50">
                    <ChevronLeft size={20} className="dark:text-white"/>
                  </button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Practice Insights</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{details?.test.date}</p>
                  </div>
                </div>

                {/* Section 1: All Students Overview */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Student Standings</h4>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <th className="p-5">Student</th>
                        <th className="p-5 text-center">Att.</th>
                        <th className="p-5 text-center">Correct</th>
                        <th className="p-5 text-center">Wrong</th>
                        <th className="p-5 text-right">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {details?.testSubs.sort((a,b) => b.scorecard.marks - a.scorecard.marks).map(sub => (
                        <tr key={sub.id} className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          <td className="p-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">{sub.userName?.charAt(0)}</div>
                            {sub.userName}
                          </td>
                          <td className="p-5 text-center text-slate-400">{sub.scorecard.attempted}</td>
                          <td className="p-5 text-center text-emerald-500">{sub.scorecard.correct}</td>
                          <td className="p-5 text-center text-red-500">{sub.scorecard.incorrect}</td>
                          <td className="p-5 text-right font-black text-slate-900 dark:text-white">{sub.scorecard.marks.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Question Accuracy % */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-8">
                    <Settings2 size={18} className="text-blue-600" /> Accuracy Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {details?.test.questions.map((q, idx) => {
                      const correctCount = details.testSubs.filter(s => s.answers[idx] === q.correctAnswer).length;
                      const accuracy = details.testSubs.length > 0 ? Math.round((correctCount / details.testSubs.length) * 100) : 0;
                      return (
                        <div key={idx} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400">Q. {idx + 1}</span>
                            <span className={`text-xs font-black ${accuracy > 70 ? 'text-emerald-500' : accuracy > 40 ? 'text-amber-500' : 'text-red-500'}`}>{accuracy}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${accuracy > 70 ? 'bg-emerald-500' : accuracy > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${accuracy}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Individual Review */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <History size={18} className="text-blue-600" /> Response Review
                    </h4>
                    <select 
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold border-none text-xs w-full sm:w-64 dark:text-white"
                      value={selectedStudentId || ""}
                    >
                      <option value="">Choose a Student</option>
                      {details?.testSubs.map(s => <option key={s.userId} value={s.userId}>{s.userName}</option>)}
                    </select>
                  </div>

                  {selectedStudentId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
                      {details?.test.questions.map((q, idx) => {
                        const sub = details.testSubs.find(s => s.userId === selectedStudentId);
                        const isCorrect = sub?.answers[idx] === q.correctAnswer;
                        const studentAns = sub?.answers[idx];
                        return (
                          <div key={idx} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-50/20 border-emerald-100' : 'bg-red-50/20 border-red-100'}`}>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-3 leading-tight">Q{idx+1}. {q.questionText}</p>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                               <div className="flex items-center gap-1.5">
                                 <span className="text-slate-400">Ans:</span>
                                 <span className={isCorrect ? 'text-emerald-600' : 'text-red-600'}>{studentAns !== undefined ? String.fromCharCode(65 + studentAns) : 'NA'}</span>
                               </div>
                               <div className="flex items-center gap-1.5">
                                 <span className="text-slate-400">Correct:</span>
                                 <span className="text-emerald-600">{String.fromCharCode(65 + q.correctAnswer)}</span>
                               </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MentorLayout>
  );
}