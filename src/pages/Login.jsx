// src/pages/Login.jsx
import { auth, googleProvider, db } from "@/firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const MENTOR_EMAIL = "nishant53195@gmail.com";

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 1. Is it the Mentor?
      if (user.email === MENTOR_EMAIL) {
        navigate("/mentor-dashboard");
        return;
      }

      // 2. Is it a Student? Check if they already exist in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Brand new student -> Go to Onboarding
        navigate("/onboarding");
      } else {
        // Returning student -> Check status
        const userData = userDocSnap.data();
        if (userData.status === "pending") {
          navigate("/waiting");
        } else if (userData.status === "approved") {
          navigate("/student-dashboard");
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans">
      {/* LEFT SIDE - Brand & Graphic */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-center p-12 shadow-2xl z-10">
        {/* Decorative background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
          {/* Logo Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-8 flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          {/* Typography Fixed */}
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-6">
            Mentor<span className="text-blue-500">OS</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            Your personalized hub for cracking SSC & Banking exams. Track your progress, get expert mentoring, and achieve your goals.
          </p>
          
          {/* Subtle trust badge */}
          <div className="mt-12 flex items-center gap-3 px-5 py-2.5 bg-slate-900/50 rounded-full border border-slate-800 backdrop-blur-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-slate-300 font-medium tracking-wide">Platform Online & Ready</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile Title (Only shows on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Progressify<span className="text-blue-600">OS</span></h1>
          </div>

          {/* Elevated Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-200/60 dark:border-slate-800 p-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                Sign in to continue to your dashboard.
              </p>
            </div>

            {/* Upgraded Button */}
            <Button 
              onClick={handleGoogleLogin} 
              className="w-full h-14 text-base font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 flex items-center justify-center gap-3 rounded-xl shadow-sm hover:shadow"
              variant="outline"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}