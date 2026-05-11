// src/pages/Waiting.jsx
import { auth } from "@/firebase/config";
import { Button } from "@/components/ui/button";

export default function Waiting() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
        {/* A nice pulsing clock/wait icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Application Pending</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Your profile has been submitted successfully. Please wait for your mentor to review and accept your application. You will gain access to your dashboard once approved.
        </p>

        <Button 
          variant="outline" 
          onClick={() => auth.signOut().then(() => window.location.href = '/')}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}