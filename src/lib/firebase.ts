
// src/lib/firebase.ts

// Esta es la versión simplificada del archivo de inicialización de Firebase.
// Ahora delegamos la lógica de inicialización "lazy" al nuevo archivo firebase-lazy.ts
// para asegurar que las instancias de Firebase estén disponibles cuando se necesiten,
// previniendo errores de inicialización.

// Exportamos las funciones 'getter' del módulo lazy, que será el punto de entrada
// estándar para acceder a los servicios de Firebase en toda la aplicación.
// Esto nos da un punto único y robusto de gestión de la conexión.

export { getFirebaseApp as app, getDb, getFirebaseAuth as auth } from './firebase-lazy';
