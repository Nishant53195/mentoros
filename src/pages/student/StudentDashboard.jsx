// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, BookOpen, CheckCircle2 } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/");
      return;
    }

    // THE LIVE GUARD: Listen for status changes
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);

        // If Mentor blocks the student, kick them to the waiting page instantly
        if (data.status !== "approved" && data.role !== "mentor") {
          navigate("/waiting");
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = () => {
    auth.signOut().then(() => navigate("/"));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* SIMPLE STUDENT HEADER */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">MentorOS</span>
        </div>
        <Button variant="ghost" onClick={handleSignOut} className="text-slate-500 flex gap-2">
          <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-500/10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome back, {userData?.name}!</h1>
          <p className="text-blue-100 font-medium">Ready to crush your {userData?.targetExams?.join(" & ")} goals today?</p>
        </div>

        {/* Placeholder for Daily Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="text-blue-600" /> Daily Tasks
                </h2>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">May 11, 2026</span>
             </div>
             <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-400 italic">Your mentor is currently preparing today's schedule...</p>
             </div>
           </div>

           <div className="space-y-6">
             <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" /> Progress
                </h2>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="w-1/3 h-full bg-green-500"></div>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500">33% of weekly tasks completed</p>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}