import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Waiting from "./pages/Waiting";
import MentorLayout from "./components/MentorLayout";

// We will create these pages next
const MentorPlaceholder = ({ title }) => (
  <MentorLayout>
    <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-slate-500 mt-2">Developing this module next...</p>
    </div>
  </MentorLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/waiting" element={<Waiting />} />
        
        {/* Mentor Routes */}
        <Route path="/mentor-dashboard" element={<MentorPlaceholder title="Admin Overview" />} />
        <Route path="/mentor/approvals" element={<MentorPlaceholder title="Student Approvals" />} />
        <Route path="/mentor/schedule" element={<MentorPlaceholder title="Study Schedules" />} />
        <Route path="/mentor/english" element={<MentorPlaceholder title="English Practice" />} />
        <Route path="/mentor/quant" element={<MentorPlaceholder title="Quant Practice" />} />
        <Route path="/mentor/analytics" element={<MentorPlaceholder title="Performance Analytics" />} />
        <Route path="/mentor/profile" element={<MentorPlaceholder title="My Profile" />} />

        {/* Student Dashboard Placeholder */}
        <Route path="/student-dashboard" element={<div className="p-10">Welcome Student!</div>} />
      </Routes>
    </Router>
  );
}

export default App;