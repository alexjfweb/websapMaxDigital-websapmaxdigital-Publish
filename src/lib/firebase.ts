// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// Import getAnalytics if you plan to use it, though it's not strictly necessary for core app functionality yet.
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
  authDomain: "websapmax.firebaseapp.com",
  projectId: "websapmax",
  storageBucket: "websapmax.firebasestorage.app", // Corregido, usualmente es .appspot.com o .firebasestorage.app, el usuario proveyó .app
  messagingSenderId: "560613070255",
  appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
  measurementId: "G-DD5JWPV701"
};


let app: FirebaseApp;
if (!getApps().length) {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
} else {
  // Si ya hay una app inicializada, usarla
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
// const analytics = getAnalytics(app); // Puedes descomentar esto si vas a usar Analytics

export { app, auth, db };
