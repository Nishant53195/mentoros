import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB29Ol-h5oKM6JUiioxLx-wXiOSpF0_rdk",
  authDomain: "mentoros-a8154.firebaseapp.com",
  projectId: "mentoros-a8154",
  storageBucket: "mentoros-a8154.firebasestorage.app",
  messagingSenderId: "222773647592",
  appId: "1:222773647592:web:883e8d38d075b37a8d515d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();