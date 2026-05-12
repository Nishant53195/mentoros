import { useEffect } from 'react';

export function usePreventLeave(isPracticing) {
  useEffect(() => {
    if (!isPracticing) return;

    // LAYER 1: Prevent Tab Close or Refresh (Desktop/F5)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Standard requirement for modern browsers
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // LAYER 2: Trap Mobile Swipe-Back and Hardware Back Button
    // We push a "dummy" state into the browser history. 
    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      // When the user swipes back, it consumes our dummy state instead of leaving.
      // We immediately push another dummy state to trap them again.
      window.history.pushState(null, null, window.location.href);
      
      // Optional: Alert the user
      alert("Test in progress! Please use the 'Finish Session' button to exit.");
    };
    
    window.addEventListener('popstate', handlePopState);

    // Cleanup listeners when the test is over or component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isPracticing]);
}