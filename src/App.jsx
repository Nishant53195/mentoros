// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Waiting from "./pages/Waiting";

// Mentor Pages
import Dashboard from "./pages/mentor/Dashboard";
import Approvals from "./pages/mentor/Approvals";
import Schedule from "./pages/mentor/Schedule";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import DailyTasks from "./pages/student/DailyTasks";
import StudentLayout from "./components/StudentLayout";

// Temporary Placeholder for unbuilt pages
const Placeholder = ({ title }) => (
  <StudentLayout>
    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
      <p className="text-slate-500 mt-2">This module is under development.</p>
    </div>
  </StudentLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Auth Flow */}
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/waiting" element={<Waiting />} />
        
        {/* Mentor Routes */}
        <Route path="/mentor-dashboard" element={<Dashboard />} />
        <Route path="/mentor/approvals" element={<Approvals />} />
        <Route path="/mentor/schedule" element={<Schedule />} />
        <Route path="/mentor/english" element={<Placeholder title="English Practice" />} />
        <Route path="/mentor/quant" element={<Placeholder title="Quant Practice" />} />
        <Route path="/mentor/analytics" element={<Placeholder title="Analytics" />} />
        <Route path="/mentor/profile" element={<Placeholder title="Profile" />} />

        {/* Student Routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/tasks" element={<DailyTasks />} />
        <Route path="/student/english" element={<Placeholder title="Daily English Practice" />} />
        <Route path="/student/quant" element={<Placeholder title="Quant Topic Practice" />} />
        <Route path="/student/analytics" element={<Placeholder title="My Analytics" />} />
        <Route path="/student/profile" element={<Placeholder title="My Profile" />} />
      </Routes>
    </Router>
  );
}

export default App;