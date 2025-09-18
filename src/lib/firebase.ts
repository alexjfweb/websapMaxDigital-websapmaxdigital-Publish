// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config'; // Importa desde el archivo de config del cliente

let app: FirebaseApp;

// Esta validación se ejecuta una sola vez al cargar la app
if (!isFirebaseConfigValid()) {
    console.error("❌ Configuración de Firebase del cliente inválida. La aplicación no puede iniciarse correctamente.");
    // En un entorno real, podrías querer mostrar un error en la UI aquí.
}

if (getApps().length === 0) {
    try {
        app = initializeApp(firebaseConfig);
    } catch(e) {
        console.error("🚨 ERROR CRÍTICO AL INICIALIZAR FIREBASE (CLIENTE):", e);
        // Fallback a un objeto vacío para evitar que la app crashee por completo.
        app = {} as FirebaseApp;
    }
} else {
    app = getApp();
}

export const firebaseApp = app;
export const storage = getStorage(app);

export function getDb(): Firestore {
  return getFirestore(app);
}

export function getFirebaseAuth(): Auth {
  return getAuth(app);
}
