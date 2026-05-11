import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

// Firebase & Context Imports
import { auth, googleProvider, db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";

// UI Components
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Update this to your actual email
  const MENTOR_EMAIL = "nishant53195@gmail.com";

  // 1. AUTO-REDIRECT LOGIC (The "Persistence" Engine)
  useEffect(() => {
    if (!authLoading && user) {
      if (user.email === MENTOR_EMAIL) {
        navigate("/mentor-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  // 2. LOGIN HANDLER
  const handleGoogleLogin = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      if (loggedInUser.email === MENTOR_EMAIL) {
        navigate("/mentor-dashboard");
        return;
      }

      const userDocRef = doc(db, "users", loggedInUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        navigate("/onboarding");
      } else {
        const userData = userDocSnap.data();
        if (userData.status === "pending") {
          navigate("/waiting");
        } else {
          navigate("/student-dashboard");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. THE SPLASH SCREEN (Anti-Flicker Guard)
  // This shows if we are still checking the session or if we've already found a user
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-white text-xl font-bold tracking-[0.3em] animate-pulse uppercase">
            Progressify<span className="text-blue-500">OS</span>
          </h2>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans"
      >
        {/* LEFT SIDE - Brand Section */}
        <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-center p-12 shadow-2xl z-10">
          {/* Decorative Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
          
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto"
          >
            {/* Logo Wrapper */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] mb-10 flex items-center justify-center shadow-2xl shadow-blue-500/20 transform transition-transform hover:rotate-3 hover:scale-105">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h1 className="text-6xl font-black text-white tracking-tighter mb-6">
              Progressify<span className="text-blue-500">OS</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              The ultimate mission-control for SSC & Banking aspirants. 
              <span className="block mt-2 text-slate-500 text-base">Built for the next generation of Officers.</span>
            </p>
            
            <div className="mt-16 flex items-center gap-4 px-6 py-3 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-xl">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"></div>
              <span className="text-sm text-slate-300 font-semibold tracking-widest uppercase">System Core v2.0 Ready</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Login Card */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full max-w-[440px]"
          >
            {/* Mobile Title (Visible only on LG screens) */}
            <div className="lg:hidden text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Progressify<span className="text-blue-600">OS</span></h1>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-200/50 dark:border-slate-800 p-12 relative">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Welcome
                </h2>
                <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-lg">
                  Access your personalized prep dashboard.
                </p>
              </div>

              {/* Login Button */}
              <Button 
                onClick={handleGoogleLogin} 
                disabled={isProcessing}
                className="w-full h-16 text-lg font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-4 rounded-2xl shadow-sm group"
                variant="outline"
              >
                {isProcessing ? (
                  <div className="h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                <span>{isProcessing ? "Connecting..." : "Continue with Google"}</span>
              </Button>
              
              {/* Footer Links */}
              <div className="mt-12 text-center">
                <p className="text-sm text-slate-400 font-medium">
                  By continuing, you agree to the Progressify <br/>
                  <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}