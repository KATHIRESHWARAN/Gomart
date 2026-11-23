import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Real Firebase Web App Configuration for Go Mart
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAnGiKhSNlQpiUOwzXJbr3jzbXs14LhM2E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gomart-4615b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gomart-4615b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gomart-4615b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "823593793581",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:823593793581:web:346d06353641120a1fe0a4"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Check if developer is using real Firebase or local dev tokens
export const isLiveFirebaseConfigured = () => {
  const key = firebaseConfig.apiKey;
  return key && !key.includes('DemoAPIKey');
};

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
};

export default app;
