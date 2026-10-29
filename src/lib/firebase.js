import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for "IMC Website" (imc-website-2026)
const firebaseConfig = {
  projectId: 'imc-website-2026',
  appId: '1:243344090160:web:d14650fbc71537615279f5',
  storageBucket: 'imc-website-2026.firebasestorage.app',
  apiKey: 'AIzaSyAiaCV63wukbNALJzh1GMxjWZVnT2tKIi4',
  authDomain: 'imc-website-2026.firebaseapp.com',
  messagingSenderId: '243344090160'
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
