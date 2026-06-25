import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChFK9CGuoiBnCkiVmVjr4r9-zo-5W0-yY",
  authDomain: "netphlixx.firebaseapp.com",
  projectId: "netphlixx",
  storageBucket: "netphlixx.firebasestorage.app",
  messagingSenderId: "30379861400",
  appId: "1:30379861400:web:0902833be5e9df399eb7ed",
  measurementId: "G-KZ8F4RD3TF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
