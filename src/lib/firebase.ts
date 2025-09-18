// src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
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
    try {
        console.log("🔥 Inicializando Firebase por primera vez...");
        app = initializeApp(firebaseConfig);
        console.log("✅ Firebase inicializado correctamente.");
    } catch(e) {
        console.error("🚨 ERROR CRÍTICO AL INICIALIZAR FIREBASE:", e);
        // En un escenario real, aquí podrías notificar a un servicio de monitoreo.
        // Se crea una 'app' vacía para evitar que el resto del código falle, aunque no funcionará.
        app = {} as FirebaseApp;
    }
} else {
    // console.log("♻️ Reutilizando instancia de Firebase existente...");
    app = getApp();
}

// Exporta la instancia de la app para quien la necesite.
export const firebaseApp = app;

// Storage por defecto (para archivos generales)
export const storage = getStorage(app);

// Storage personalizado para imágenes del menú
export const menuImagesStorage = getStorage(app, "gs://websapmax-images");


// Exporta funciones para obtener los servicios específicos.
// Estas funciones ahora son seguras de llamar en cualquier parte de la app.
export function getDb(): Firestore {
  return getFirestore(app);
}

export function getFirebaseAuth(): Auth {
  return getAuth(app);
}
