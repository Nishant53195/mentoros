// src/pages/Waiting.jsx
import { useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";

export default function Waiting() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/");
      return;
    }

    // 1. Set up a Real-time Listener for THIS specific student
    const userRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 2. If Mentor clicks "Approve", instantly redirect
        if (data.status === "approved") {
          navigate("/student-dashboard");
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  const handleSignOut = () => {
    auth.signOut().then(() => navigate("/"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 text-center">
        
        {/* Animated Icon */}
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl mx-auto mb-8 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-3xl border-4 border-blue-500/20 animate-ping"></div>
          <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400 relative z-10" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Wait for Approval
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
          Your profile has been submitted to your mentor. Once verified, your dashboard will unlock automatically.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Current Status
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">Pending Review</p>
          </div>

          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex gap-2 font-bold"
          >
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}