// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Waiting from "./pages/Waiting";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/waiting" element={<Waiting />} />
        
        {/* We will build these in Phase 2 */}
        <Route path="/mentor-dashboard" element={<div className="p-10 text-2xl">Mentor Dashboard (Coming Soon)</div>} />
        <Route path="/student-dashboard" element={<div className="p-10 text-2xl">Student Dashboard (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;