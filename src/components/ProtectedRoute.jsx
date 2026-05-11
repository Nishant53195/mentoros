import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Wait for Firebase to check the user

  // 1. If not logged in at all, go to Login
  if (!user) return <Navigate to="/login" replace />;

  // 2. If trying to enter Mentor side, check the Email
  const isMentor = user.email === 'nishant53195@gmail.com'; 
  
  if (adminOnly && !isMentor) {
    // If they aren't the admin, kick them back to the student side
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
};