import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Now this import works!

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-slate-400 animate-pulse">VERIFYING ACCESS...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Update this with YOUR actual Google email
  const isMentor = user.email === "nishant53195@gmail.com"; 
  
  if (adminOnly && !isMentor) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};