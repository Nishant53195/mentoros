import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpenText, 
  Calculator, 
  LineChart, 
  UserCircle,
  Menu,
  LogOut,
  Zap
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/student-dashboard", icon: LayoutDashboard },
  { name: "Daily Task", path: "/student/tasks", icon: ClipboardList },
  { name: "English Practice", path: "/student/english", icon: BookOpenText },
  { name: "Quant Practice", path: "/student/quant", icon: Calculator },
  { name: "Analytics", path: "/student/analytics", icon: LineChart },
  { name: "Profile", path: "/student/profile", icon: UserCircle },
];

export default function StudentLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate("/"); return; }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        if (data.status !== "approved") navigate("/waiting");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSignOut = () => auth.signOut().then(() => navigate("/"));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap size={18} className="text-white fill-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">Progressify</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={22} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={22} />
            {!isCollapsed && <span className="font-bold text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-50">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center p-2 rounded-lg ${
              location.pathname === item.path ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1 font-bold">{item.name.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
           <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
             {navItems.find(item => item.path === location.pathname)?.name || "Dashboard"}
           </h1>
           <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{userData?.name}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{userData?.targetExams?.[0]}</p>
             </div>
             <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-blue-600">
               {userData?.name?.charAt(0)}
             </div>
           </div>
        </header>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}