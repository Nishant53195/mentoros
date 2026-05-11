// src/pages/Onboarding.jsx
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [exams, setExams] = useState({ ssc: false, banking: false });
  
  // 1. New State: Track years separately
  const [targetYears, setTargetYears] = useState({ ssc: "2026", banking: "2026" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, [navigate]);

  const handleCheckboxChange = (exam) => {
    setExams((prev) => ({ ...prev, [exam]: !prev[exam] }));
  };

  const handleYearChange = (exam, year) => {
    setTargetYears((prev) => ({ ...prev, [exam]: year }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter your name.");
    if (!exams.ssc && !exams.banking) return alert("Please select at least one exam.");

    setLoading(true);
    try {
      const user = auth.currentUser;
      const selectedExams = [];
      const examYears = {}; // 2. New Logic: Map the years strictly to selected exams

      if (exams.ssc) {
        selectedExams.push("SSC");
        examYears.SSC = targetYears.ssc;
      }
      if (exams.banking) {
        selectedExams.push("Banking");
        examYears.Banking = targetYears.banking;
      }

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: name,
        targetExams: selectedExams,
        targetYears: examYears, // Saves as an object mapping exam to year
        role: "student",
        status: "pending",
        joinedAt: new Date().toISOString()
      });

      navigate("/waiting");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 dark:border-slate-800 transition-all">
        
        {/* Visual Anchor */}
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner border border-blue-100 dark:border-blue-800/50">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Complete Your Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tell us what you're preparing for so we can set up your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 dark:text-white transition-all shadow-sm"
              placeholder="e.g. Nishant Kumar"
            />
          </div>

          {/* Interactive Exam Selection Cards */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Your Target Exam(s)</label>
            <div className="flex gap-4">
              
              {/* SSC Card */}
              <div 
                onClick={() => handleCheckboxChange("ssc")}
                className={`flex-1 relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 group ${
                  exams.ssc 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-transparent'
                }`}
              >
                {exams.ssc && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                <span className={`text-lg font-bold tracking-wide ${exams.ssc ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-blue-500'}`}>
                  SSC
                </span>
              </div>

              {/* Banking Card */}
              <div 
                onClick={() => handleCheckboxChange("banking")}
                className={`flex-1 relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 group ${
                  exams.banking 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-transparent'
                }`}
              >
                {exams.banking && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                <span className={`text-lg font-bold tracking-wide ${exams.banking ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-blue-500'}`}>
                  Banking
                </span>
              </div>

            </div>
          </div>

          {/* 3. Dynamic Target Year Selection */}
          {(exams.ssc || exams.banking) && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 transition-all">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Set Target Years</label>
              <div className="flex gap-4">
                
                {/* SSC Year Dropdown */}
                {exams.ssc && (
                  <div className="flex-1 space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">SSC</span>
                    <div className="relative">
                      <select 
                        value={targetYears.ssc}
                        onChange={(e) => handleYearChange("ssc", e.target.value)}
                        className="w-full p-3 pl-4 pr-10 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm font-medium"
                      >
                        <option value="2026" className="text-slate-900 font-medium">2026</option>
                        <option value="2027" className="text-slate-900 font-medium">2027</option>
                        
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banking Year Dropdown */}
                {exams.banking && (
                  <div className="flex-1 space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Banking</span>
                    <div className="relative">
                      <select 
                        value={targetYears.banking}
                        onChange={(e) => handleYearChange("banking", e.target.value)}
                        className="w-full p-3 pl-4 pr-10 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm font-medium"
                      >
                        <option value="2026" className="text-slate-900 font-medium">2026</option>
                        <option value="2027" className="text-slate-900 font-medium">2027</option>
                       
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          <div className="pt-6">
            <Button type="submit" className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200" disabled={loading}>
              {loading ? "Saving Profile..." : "Submit Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}