import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserCheck, 
  CalendarDays, 
  BookOpen, 
  Calculator, 
  BarChart3, 
  UserCircle,
  Menu,
  ChevronLeft
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/mentor-os-dashboard-53195", icon: LayoutDashboard },
  { name: "Approvals", path: "/mentor/approvals", icon: UserCheck },
  { name: "Schedule", path: "/mentor/schedule", icon: CalendarDays },
  { name: "English", path: "/mentor/english", icon: BookOpen },
  { name: "Quant", path: "/mentor/quant", icon: Calculator },
  { name: "Analytics", path: "/mentor/analytics", icon: BarChart3 },
  { name: "Profile", path: "/mentor/profile", icon: UserCircle },
];

export default function MentorLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && <span className="font-bold text-xl text-blue-600">Progressify</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
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
              {!isCollapsed && <span className="font-semibold">{item.name}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVBAR */}
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
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 flex items-center px-8">
           <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
             {navItems.find(item => item.path === location.pathname)?.name || "Mentor Dashboard"}
           </h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}