// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Importar Firestore

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // TODO: Reemplaza con tu API key real
  authDomain: "YOUR_AUTH_DOMAIN", // TODO: Reemplaza con tu auth domain real
  projectId: "YOUR_PROJECT_ID", // TODO: Reemplaza con tu project ID real
  storageBucket: "YOUR_STORAGE_BUCKET", // TODO: Reemplaza con tu storage bucket real
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // TODO: Reemplaza con tu messaging sender ID real
  appId: "YOUR_APP_ID", // TODO: Reemplaza con tu app ID real
};

// Inicializar Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app); // Inicializar y exportar Firestore

export { app, auth, db }; // Exportar db