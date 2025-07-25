// src/lib/firebase-config.ts

// NOTA IMPORTANTE: Esta configuración es segura para ser expuesta en el cliente.
// La seguridad se gestiona a través de las Reglas de Seguridad de Firebase (Firestore, Storage)
// y App Check, no por mantener estas claves en secreto.

export const firebaseConfig = {
  apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
  authDomain: "websapmaxdigital.firebaseapp.com",
  projectId: "websapmaxdigital",
  storageBucket: "websapmaxdigital.appspot.com",
  messagingSenderId: "17942151833",
  appId: "1:17942151833:web:715d39c5784013115456fd"
};

// Validación para asegurar que todos los campos están presentes
const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  throw new Error(`❌ Configuración de Firebase incompleta. Faltan los siguientes campos: ${missing.join(', ')}`);
}
