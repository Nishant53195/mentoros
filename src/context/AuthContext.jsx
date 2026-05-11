import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config.js"; // Ensure this points to your firebase config file
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener tracks if a user is logged in or out in real-time
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// This is the "hook" we'll use in other files
export const useAuth = () => useContext(AuthContext);