
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

// Patrón Singleton para una inicialización segura y única de Firebase.

let app: FirebaseApp;
let db: any; // Declarado como any para permitir la inicialización condicional
let auth: any; // Declarado como any para permitir la inicialización condicional

const configIsValid = isFirebaseConfigValid();

if (configIsValid) {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
} else {
    // Si la configuración no es válida, exportamos valores nulos o mocks para evitar que la app crashee,
    // pero las operaciones de Firebase fallarán y el error ya habrá sido logueado en la consola.
    console.error("Firebase no fue inicializado debido a configuración inválida.");
    app = null as any;
    db = null as any;
    auth = null as any;
}


// Exporta las instancias (posiblemente nulas si la config es inválida) para ser usadas en la aplicación.
export { app, db, auth };
