// src/App.jsx
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Waiting from "./pages/Waiting";

// Mentor Pages
import Dashboard from "./pages/mentor/Dashboard";
import Approvals from "./pages/mentor/Approvals";
import Schedule from "./pages/mentor/Schedule";
import EnglishCreator from "./pages/mentor/EnglishCreator";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import DailyTasks from "./pages/student/DailyTasks";
import StudentLayout from "./components/StudentLayout";
import MentorLayout from "./components/MentorLayout";

import EnglishPractice from "./pages/student/EnglishPractice";

// Temporary Placeholder for unbuilt pages
const Placeholder = ({ title, Layout = StudentLayout }) => (
  <Layout>
    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
      <p className="text-slate-500 mt-2">This module is under development.</p>
    </div>
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Auth Flow */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />}/>
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/waiting" element={<ProtectedRoute><Waiting /></ProtectedRoute>} />
        
        {/* Mentor Routes */}
        <Route path="/mentor-dashboard" element={<ProtectedRoute adminOnly={true}><Dashboard /></ProtectedRoute>} />
        <Route path="/mentor/approvals" element={<ProtectedRoute adminOnly={true}><Approvals /></ProtectedRoute>} />
        <Route path="/mentor/schedule" element={<ProtectedRoute adminOnly={true}><Schedule /></ProtectedRoute>} />
        <Route path="/mentor/english" element={<ProtectedRoute adminOnly={true}><EnglishCreator /></ProtectedRoute>} />
        <Route path="/mentor/quant" element={<Placeholder title="Quant Practice" Layout={MentorLayout} />} />
        <Route path="/mentor/analytics" element={<Placeholder title="Analytics" Layout={MentorLayout} />} />
        <Route path="/mentor/profile" element={<Placeholder title="Profile" Layout={MentorLayout} />} />
        

        {/* Student Routes */}
        <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/tasks" element={<ProtectedRoute><DailyTasks /></ProtectedRoute>} />
        <Route path="/student/english" element={<ProtectedRoute><EnglishPractice /></ProtectedRoute>} />
        <Route path="/student/quant" element={<Placeholder title="Quant Topic Practice" />} />
        <Route path="/student/analytics" element={<Placeholder title="My Analytics" />} />
        <Route path="/student/profile" element={<Placeholder title="My Profile" />} />
      </Routes>
    </Router>
  );
}

export default App;