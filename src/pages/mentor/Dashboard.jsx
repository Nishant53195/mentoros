// src/pages/mentor/Dashboard.jsx
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import MentorLayout from "@/components/MentorLayout";
import { Users, UserPlus, CheckCircle, Target } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [matrixData, setMatrixData] = useState({ ssc: [], banking: [] });

  useEffect(() => {
    // 1. Stats Counter
    const unsubUsers = onSnapshot(query(collection(db, "users"), where("role", "==", "student")), (usersSnap) => {
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setStats({
        total: users.length,
        pending: users.filter(d => d.status === "pending").length,
        approved: users.filter(d => d.status === "approved").length
      });

      // 2. Real-time Matrix Engine
      const today = new Date().toISOString().split('T')[0];
      const unsubSchedules = onSnapshot(query(collection(db, "schedules"), where("date", "==", today)), (schedSnap) => {
        const schedules = schedSnap.docs.map(d => d.data());
        
        const unsubProgress = onSnapshot(query(collection(db, "progress"), where("date", "==", today)), (progSnap) => {
          const progress = progSnap.docs.map(d => d.data());
          
          const sscData = [];
          const bankingData = [];
          
          users.forEach(u => {
            if (u.status !== "approved") return;
            u.targetExams?.forEach(exam => {
              const year = u.targetYears?.[exam];
              const sched = schedules.find(s => s.exam === exam && s.year === year);
              const prog = progress.find(p => p.userId === u.id && p.exam === exam);
              
              const row = {
                name: u.name,
                year: year,
                tasks: {
                  Q: sched?.quant?.trim() ? (prog?.tasks?.quant ? 'done' : 'pending') : 'none',
                  R: sched?.reasoning?.trim() ? (prog?.tasks?.reasoning ? 'done' : 'pending') : 'none',
                  E: sched?.english?.trim() ? (prog?.tasks?.english ? 'done' : 'pending') : 'none',
                  G: sched?.ga?.trim() ? (prog?.tasks?.ga ? 'done' : 'pending') : 'none',
                }
              };
              if (exam === "SSC") sscData.push(row);
              if (exam === "Banking") bankingData.push(row);
            });
          });
          
          setMatrixData({ ssc: sscData, banking: bankingData });
        });
        return () => unsubProgress();
      });
      return () => unsubSchedules();
    });
    return () => unsubUsers();
  }, []);

  const cards = [
    { title: "Total Students", value: stats.total, icon: Users, color: "bg-blue-500", description: "Registered accounts" },
    { title: "Pending Approvals", value: stats.pending, icon: UserPlus, color: "bg-amber-500", description: "Waiting for access", pulse: stats.pending > 0 },
    { title: "Active Mentees", value: stats.approved, icon: CheckCircle, color: "bg-green-500", description: "Approved access" },
  ];

  return (
    <MentorLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h2>
          <p className="text-slate-500">Welcome back. Here is the live status of today's tasks.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-2xl text-white shadow-lg`}>
                  <card.icon size={24} />
                </div>
                {card.pulse && (
                  <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-xs text-slate-400 mt-2">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- LIVE MATRIX --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4 animate-in slide-in-from-bottom-5">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Target className="text-blue-600"/> SSC Live Tracking</h3>
            <MatrixTable data={matrixData.ssc} />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Target className="text-purple-600"/> Banking Live Tracking</h3>
            <MatrixTable data={matrixData.banking} />
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}

// Sub-component to keep it clean
const MatrixTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse min-w-[400px]">
      <thead className="bg-slate-50 dark:bg-slate-800/50">
        <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <th className="p-4 rounded-l-xl">Student</th>
          <th className="p-4">Target</th>
          <th className="p-4 text-center">Q</th>
          <th className="p-4 text-center">R</th>
          <th className="p-4 text-center">E</th>
          <th className="p-4 text-center rounded-r-xl">G</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.length === 0 ? (
          <tr><td colSpan="6" className="p-8 text-center text-slate-400 text-xs italic font-bold">No active schedules today.</td></tr>
        ) : data.map((row, i) => (
          <tr key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300">
            <td className="p-4 truncate max-w-[120px]">{row.name.split(" ")[0]}</td>
            <td className="p-4 text-slate-400">{row.year}</td>
            <TaskCell status={row.tasks.Q} />
            <TaskCell status={row.tasks.R} />
            <TaskCell status={row.tasks.E} />
            <TaskCell status={row.tasks.G} />
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TaskCell = ({ status }) => {
  if (status === 'none') return <td className="p-4 text-center text-slate-300 dark:text-slate-700">-</td>;
  if (status === 'done') return <td className="p-4 text-center text-emerald-500 font-black">✓</td>;
  return <td className="p-4 text-center text-red-500 font-black">✗</td>;
}