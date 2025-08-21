
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

// Patrón Singleton para una inicialización segura y única de Firebase.
let app: FirebaseApp;
if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error("Firebase config is missing or incomplete. Cannot initialize Firebase. Check your .env.local file.");
        // En un escenario real, podríamos lanzar un error aquí para detener la ejecución.
        // Para este entorno, intentaremos continuar, pero es probable que falle.
    }
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

// Exporta las instancias únicas que se deben usar en toda la aplicación.
export { app, db, auth };
