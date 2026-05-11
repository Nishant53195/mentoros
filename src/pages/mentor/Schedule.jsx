import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, onSnapshot, doc, writeBatch, query, where, deleteDoc } from "firebase/firestore";
import MentorLayout from "@/components/MentorLayout";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, CalendarDays } from "lucide-react";

const EXAM_TYPES = ["SSC", "Banking"];
const TARGET_YEARS = ["2026", "2027"];

export default function Schedule() {
  const [activeFilter, setActiveFilter] = useState("SSC 2026");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load existing data for the selected chip
  useEffect(() => {
    const [exam, year] = activeFilter.split(" ");
    const q = query(collection(db, "schedules"), where("exam", "==", exam), where("year", "==", year));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const existingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      existingData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setRows(existingData);
    });

    return () => unsubscribe();
  }, [activeFilter]);

  const addRow = () => {
    const newRow = {
      id: `temp-${Date.now()}`, // Temporary ID
      date: new Date().toISOString().split('T')[0],
      quant: "",
      reasoning: "",
      english: "",
      ga: ""
    };
    setRows([...rows, newRow]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const deleteRow = async (rowId, index) => {
    if (!rowId.startsWith('temp-')) {
      await deleteDoc(doc(db, "schedules", rowId));
    } else {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
    }
  };

  const saveAll = async () => {
    setLoading(true);
    const [exam, year] = activeFilter.split(" ");
    const batch = writeBatch(db);

    rows.forEach((row) => {
      // Use date as part of ID to ensure 1 schedule per day per group
      const docId = `${exam}-${year}-${row.date}`;
      const docRef = doc(db, "schedules", docId);
      batch.set(docRef, {
        ...row,
        id: docId,
        exam,
        year,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
    setLoading(false);
    alert("Schedule Updated Successfully!");
  };

  return (
    <MentorLayout>
      <div className="max-w-full space-y-6">
        {/* CHIP FILTERS */}
        <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          {EXAM_TYPES.flatMap(e => TARGET_YEARS.map(y => `${e} ${y}`)).map(chip => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === chip ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* EDITABLE TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 text-[10px] uppercase font-black text-slate-400 text-left w-40">Date</th>
                <th className="p-4 text-[10px] uppercase font-black text-slate-400 text-left">Quant</th>
                <th className="p-4 text-[10px] uppercase font-black text-slate-400 text-left">Reasoning</th>
                <th className="p-4 text-[10px] uppercase font-black text-slate-400 text-left">English</th>
                <th className="p-4 text-[10px] uppercase font-black text-slate-400 text-left">GK / GA</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, index) => (
                <tr key={row.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-2">
                    <input 
                      type="date" 
                      value={row.date} 
                      onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                      className="w-full p-2 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-lg text-sm font-bold dark:text-white"
                    />
                  </td>
                  {['quant', 'reasoning', 'english', 'ga'].map((field) => (
                    <td key={field} className="p-2">
                      <input 
                        type="text" 
                        value={row[field]} 
                        onChange={(e) => handleInputChange(index, field, e.target.value)}
                        placeholder="Topic..."
                        className="w-full p-2 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-lg text-sm dark:text-slate-300"
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <button onClick={() => deleteRow(row.id, index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/20 flex justify-between items-center">
            <Button onClick={addRow} variant="outline" className="flex gap-2 rounded-xl border-dashed border-2">
              <Plus size={18} /> Add Row
            </Button>
            <Button onClick={saveAll} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl flex gap-2">
              <Save size={18} /> {loading ? "Saving..." : "Update Schedule"}
            </Button>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}