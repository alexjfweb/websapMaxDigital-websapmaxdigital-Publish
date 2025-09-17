// src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

// Variable para almacenar la instancia de la app de Firebase
let app: FirebaseApp;

// Verifica si la configuración de Firebase es válida al cargar el módulo
if (!isFirebaseConfigValid()) {
    console.error("❌ Configuración de Firebase inválida. La aplicación no puede iniciarse.");
    // Podríamos lanzar un error aquí para detener la ejecución, 
    // pero en el contexto del cliente es mejor manejarlo en los componentes.
}

// Inicialización Singleton: Se ejecuta solo una vez.
if (getApps().length === 0) {
    console.log("🔥 Inicializando Firebase por primera vez...");
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase inicializado correctamente.");
} else {
    // console.log("♻️ Reutilizando instancia de Firebase existente...");
    app = getApp();
}

// Exporta la instancia de la app para quien la necesite.
export const firebaseApp = app;

// Exporta funciones para obtener los servicios específicos.
// Estas funciones ahora son seguras de llamar en cualquier parte de la app.
export function getDb(): Firestore {
  return getFirestore(app);
}

export function getFirebaseAuth(): Auth {
  return getAuth(app);
}

// Para compatibilidad, exportamos una función getAppInstance.
export function getAppInstance(): FirebaseApp {
  return app;
}

// Para compatibilidad con el código anterior que esperaba una promesa,
// exportamos una función que devuelve una promesa resuelta.
export function initializeFirebase(): Promise<any> {
    return Promise.resolve({
        app: firebaseApp,
        db: getDb(),
        auth: getFirebaseAuth()
    });
}
