
# Guía de Reconstrucción del Proyecto WebSapMax

Este documento proporciona un plano detallado para recrear la aplicación desde cero en un nuevo proyecto de Firebase y un nuevo espacio de trabajo.

## 1. Configuración del Proyecto de Firebase

1.  **Crea un nuevo proyecto** en la [Consola de Firebase](https://console.firebase.google.com/).
2.  **Habilita los siguientes servicios**:
    *   **Authentication**: Ve a la pestaña "Authentication" y haz clic en "Comenzar". Habilita el proveedor "Correo electrónico/Contraseña".
    *   **Firestore Database**: Ve a la pestaña "Firestore Database", haz clic en "Crear base de datos" y empieza en **modo de producción** (con reglas seguras).
    *   **Storage**: Ve a "Storage", haz clic en "Comenzar" y sigue los pasos. Asegúrate de configurar las reglas de Storage para permitir la lectura pública si vas a mostrar imágenes públicamente.
3.  **Registra una nueva aplicación web**:
    *   En la vista general de tu proyecto, haz clic en el ícono de web (`</>`).
    *   Dale un apodo a tu app y registra la aplicación.
    *   Firebase te proporcionará un objeto `firebaseConfig`. Copia estos valores.

## 2. Configuración del Entorno Local

1.  En la raíz de tu proyecto, crea un archivo llamado `.env.local`.
2.  Usa la siguiente plantilla para rellenar tu archivo `.env.local` con las credenciales del objeto `firebaseConfig` que obtuviste en el paso anterior.

```env
# Variables de configuración de Firebase (Cliente)
# Reemplaza los valores de ejemplo con tus credenciales reales de Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="BB7zCrAz2u0wJBGuhAAVuoSk6Hx3lYv8dTGweV8TD_7oHCYhj56iKGxfogwuLiMREVq3PMLRnOIQU8Fma4Gt2YA"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="1:your-sender-id:web:your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-your-measurement-id"

# Credenciales de la Cuenta de Servicio de Firebase (Servidor)
# Obtén este JSON desde la consola de Firebase -> Configuración del proyecto -> Cuentas de servicio
# Es crucial que este JSON esté en una sola línea.
FIREBASE_SERVICE_ACCOUNT="{\"type\": \"service_account\", ...}"
```
**Nota de Seguridad:** El archivo `.env.local` está incluido en `.gitignore` por defecto para asegurar que tus claves secretas nunca se suban a un repositorio público.

## 3. Esquema de la Base de Datos (Firestore)

A continuación se detallan las colecciones principales que necesitas en tu base de datos de Firestore.

*   **`users`**: Almacena la información de cada usuario registrado.
*   **`companies`**: Almacena los datos de cada restaurante o negocio.
*   **`landingPlans`**: Guarda los planes de suscripción que se muestran en la página de inicio.
*   **`landing_configs`**: Configuración de la landing page (documento único con ID `main`).
*   **`dishes`**: Menú de platos de un restaurante.
*   **Otras colecciones**: `orders`, `reservations`, `tables`, `supportTickets`, `payment_configs`, `menu_styles`, `globalAuditLogs`, `navigation_config`.

## 4. Reglas de Seguridad de Firestore

Usa estas reglas como punto de partida en tu `firestore.rules`. Estas reglas son un ejemplo básico y deben ser refinadas para un entorno de producción para asegurar la correcta granularidad de permisos.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- REGLAS PÚBLICAS (SOLO LECTURA) ---
    match /landing_configs/{docId} {
      allow read: if true;
      allow write: if request.auth != null; // Solo autenticados pueden escribir
    }

    match /landingPlans/{planId} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }

    // --- REGLAS PROTEGIDAS ---
    // Un usuario solo puede ver/editar su propio perfil.
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /companies/{companyId} {
      // El superadmin puede leer/escribir todo.
      // Un admin puede leer/escribir si el companyId coincide.
      allow read, write: if request.auth != null && (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin' || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId == companyId);
    }

    // Regla para subcolecciones de una compañía (ej. platos)
    match /dishes/{dishId} {
      allow read: if true; // Menú público
      allow write: if request.auth != null && request.resource.data.companyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId;
    }
    
    // Simplificado para el resto, refinar según sea necesario
    match /{path=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 5. Pasos Finales de Inicialización

1.  **Instala las dependencias**:
    ```bash
    npm install
    ```
2.  **Pobla los datos iniciales (Automático)**:
    *   La aplicación está diseñada para **auto-inicializarse**. Simplemente inicia el servidor de desarrollo (`npm run dev`).
    *   La primera vez que visites la página de inicio, se crearán automáticamente los planes de suscripción y la configuración de la landing por defecto.
    *   Si necesitas forzar una resincronización, usa: `npm run db:sync`.
3.  **Ejecuta la aplicación**:
    ```bash
    npm run dev
    ```

Con estos pasos, tendrás una réplica funcional de la aplicación en tu nuevo entorno de Firebase.
