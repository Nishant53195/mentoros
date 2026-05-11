// src/pages/mentor/Dashboard.jsx
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import MentorLayout from "@/components/MentorLayout";
import { Users, UserPlus, Activity, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  useEffect(() => {
    // Listen to the entire users collection to calculate stats
    const q = query(collection(db, "users"), where("role", "==", "student"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      setStats({
        total: docs.length,
        pending: docs.filter(d => d.status === "pending").length,
        approved: docs.filter(d => d.status === "approved").length
      });
    });

    return () => unsubscribe();
  }, []);

  const cards = [
    { 
      title: "Total Students", 
      value: stats.total, 
      icon: Users, 
      color: "bg-blue-500", 
      description: "Total registered accounts" 
    },
    { 
      title: "Pending Approvals", 
      value: stats.pending, 
      icon: UserPlus, 
      color: "bg-amber-500", 
      description: "Waiting for access",
      pulse: stats.pending > 0 
    },
    { 
      title: "Active Mentees", 
      value: stats.approved, 
      icon: CheckCircle, 
      color: "bg-green-500", 
      description: "Currently have access" 
    },
    { 
      title: "Daily Activity", 
      value: "0", 
      icon: Activity, 
      color: "bg-purple-500", 
      description: "Tasks completed today" 
    },
  ];

  return (
    <MentorLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h2>
          <p className="text-slate-500">Welcome back, Nishant. Here is what's happening with your students.</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none`}>
                  <card.icon size={24} />
                </div>
                {card.pulse && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS OR RECENT ACTIVITY Placeholder */}
        <div className="bg-slate-100 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <p className="text-slate-500 font-medium italic">
            "The journey of a thousand miles begins with a single step." 
            <br />
            More analytics and recent activity logs will appear here soon.
          </p>
        </div>
      </div>
    </MentorLayout>
  );
}