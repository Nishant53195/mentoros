// src/pages/mentor/Approvals.jsx
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, onSnapshot, doc, updateDoc, query } from "firebase/firestore";
import MentorLayout from "@/components/MentorLayout";
import { Button } from "@/components/ui/button";
import { UserCheck, UserMinus, Mail, GraduationCap } from "lucide-react";

export default function Approvals() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "student") {
          studentList.push({ id: doc.id, ...data });
        }
      });
      setStudents(studentList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    try {
      const userRef = doc(db, "users", studentId);
      await updateDoc(userRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <MentorLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Approvals</h2>
            <p className="text-slate-500 text-sm">Manage student access permissions.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div 
                key={student.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col relative"
              >
                {/* Status Badge - Top Right */}
                <div className="absolute top-4 right-4">
                   <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    student.status === 'approved' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}>
                    {student.status}
                  </span>
                </div>

                {/* 1. NAME & EMAIL */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-16">
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Mail size={12} />
                    <span className="text-xs font-medium truncate">{student.email}</span>
                  </div>
                </div>

                {/* 2. EXAMS (Condensed Rows) */}
                <div className="space-y-1.5 mb-5">
                  {student.targetYears ? (
                    Object.entries(student.targetYears).map(([exam, year]) => (
                      <div key={exam} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-blue-500" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">{exam}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{year}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Missing data</span>
                  )}
                </div>

                {/* 3. BUTTON (Slimmer) */}
                <div className="mt-auto">
                  {student.status === "approved" ? (
                    <Button 
                      onClick={() => toggleStatus(student.id, student.status)}
                      variant="outline"
                      className="w-full h-10 rounded-lg border-red-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900/30 text-xs font-bold"
                    >
                      Block Access
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => toggleStatus(student.id, student.status)}
                      className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-100 dark:shadow-none"
                    >
                      Approve Student
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
}