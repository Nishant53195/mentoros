import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config"; 
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // CRITICAL: This stops the auto-logout on refresh

  useEffect(() => {
    // Firebase looks at the browser's storage and "remembers" the user here
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Only stop loading once Firebase confirms the status
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* We don't render the App until we know if the user is 
         logged in or not. This prevents the "flash" of the login page.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);