// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config'; // ✅ Conservamos esta línea

// Inicialización de Firebase con configuración centralizada
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  const config = getFirebaseConfig(); // ✅ Sigue leyendo desde firebase-config
  
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);

  console.log('✅ Firebase: Inicializado correctamente');
} catch (error) {
  console.error('❌ Firebase: Error durante la inicialización:', error);
  
  // Fallback extremo
  const fallbackConfig = {
    apiKey: 'fallback-key',
    authDomain: 'fallback.firebaseapp.com',
    projectId: 'fallback-project',
    storageBucket: 'fallback.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:fallback',
  };

  try {
    app = initializeApp(fallbackConfig, 'fallback');
    auth = getAuth(app);
    db = getFirestore(app);
    console.warn('⚠️ Firebase: Usando configuración de fallback');
  } catch (fallbackError) {
    console.error('❌ Firebase: Error fatal - no se pudo inicializar Firebase');
    throw new Error('Firebase no pudo inicializarse');
  }
}

export { app, auth, db };
