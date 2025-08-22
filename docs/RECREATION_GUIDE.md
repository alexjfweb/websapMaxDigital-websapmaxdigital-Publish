
# Guía de Reconstrucción del Proyecto WebSapMax

Este documento proporciona un plano detallado para recrear la aplicación desde cero en un nuevo proyecto de Firebase y un nuevo espacio de trabajo.

## 1. Configuración del Proyecto de Firebase

1.  **Crea un nuevo proyecto** en la [Consola de Firebase](https://console.firebase.google.com/).
2.  **Habilita los siguientes servicios**:
    *   **Authentication**: Ve a la pestaña "Authentication" y haz clic en "Comenzar". Habilita el proveedor "Correo electrónico/Contraseña".
    *   **Firestore Database**: Ve a la pestaña "Firestore Database", haz clic en "Crear base de datos" y empieza en **modo de producción** (con reglas seguras).
    *   **Storage**: Ve a "Storage", haz clic en "Comenzar" y sigue los pasos.
3.  **Registra una nueva aplicación web**:
    *   En la vista general de tu proyecto, haz clic en el ícono de web (`</>`).
    *   Dale un apodo a tu app y registra la aplicación.
    *   Firebase te proporcionará un objeto `firebaseConfig`. Copia estos valores.

## 2. Configuración del Entorno Local

1.  En la raíz de tu proyecto, crea un archivo llamado `.env.local`.
2.  Copia el contenido del archivo `.env.example` en tu nuevo archivo `.env.local`.
3.  Rellena los valores de `.env.local` con las credenciales del objeto `firebaseConfig` que obtuviste en el paso anterior.

## 3. Esquema de la Base de Datos (Firestore)

A continuación se detallan las colecciones principales que necesitas en tu base de datos de Firestore.

*   **`users`**: Almacena la información de cada usuario registrado.
    *   `uid` (string): ID de Firebase Authentication.
    *   `email` (string): Correo electrónico del usuario.
    *   `role` (string): Puede ser `superadmin`, `admin`, o `employee`.
    *   `companyId` (string, opcional): ID de la empresa a la que pertenece (si es `admin` o `employee`).
    *   `firstName` (string): Nombre del usuario.
    *   `lastName` (string): Apellido del usuario.
    *   `status` (string): `active`, `inactive`.
    *   `registrationDate` (timestamp): Fecha de registro.

*   **`companies`**: Almacena los datos de cada restaurante o negocio.
    *   `name` (string): Nombre de la empresa.
    *   `ruc` (string): ID fiscal o RUC de la empresa.
    *   `email` (string): Correo de contacto principal.
    *   `planId` (string): ID del plan de suscripción actual (ej. `plan-basico`).
    *   `subscriptionStatus` (string): `trialing`, `active`, `past_due`, `canceled`.
    *   `status` (string): `active`, `inactive`, `pending`.
    *   `logoUrl` (string, opcional): URL del logo.
    *   `bannerUrl` (string, opcional): URL del banner del menú.

*   **`landingPlans`**: Guarda los planes de suscripción que se muestran en la página de inicio.
    *   `name` (string): Nombre del plan (ej. "Básico").
    *   `slug` (string): Identificador único en URL (ej. "plan-basico").
    *   `price` (number): Precio mensual.
    *   `features` (array de strings): Lista de características.
    *   `isActive` (boolean): Si el plan se puede contratar.
    *   `isPublic` (boolean): Si se muestra en la landing page.
    *   `order` (number): Orden de visualización.

*   **`landing_configs`**: Configuración de la landing page.
    *   Documento único con ID `main`.
    *   `heroTitle` (string): Título principal.
    *   `heroSubtitle` (string): Subtítulo.
    *   `sections` (array de objetos): Contenido dinámico de las secciones.

*   **`dishes`**: Menú de platos de un restaurante.
    *   `companyId` (string): A qué empresa pertenece el plato.
    *   `name` (string): Nombre del plato.
    *   `description` (string): Descripción.
    *   `price` (number): Precio.
    *   `category` (string): Categoría (ej. "Entradas").
    *   `imageUrl` (string): URL de la imagen del plato.

*   **Otras colecciones**: `orders`, `reservations`, `tables`, `supportTickets`, `payment_configs`, `menu_styles`, `globalAuditLogs`.

## 4. Reglas de Seguridad de Firestore

Usa estas reglas como punto de partida en tu `firestore.rules`.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- REGLAS PÚBLICAS (SOLO LECTURA) ---
    match /landing_configs/{docId} {
      allow read: if true;
      allow write: if request.auth != null; // Solo autenticados pueden escribir
    }

    match /landingPlans/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // --- REGLAS PROTEGIDAS ---
    // Un usuario solo puede ver/editar su propio perfil.
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Cualquier usuario autenticado puede interactuar con el resto de colecciones.
    // Puedes refinar estas reglas más adelante.
    match /companies/{companyId} { allow read, write: if request.auth != null; }
    match /dishes/{dishId} { allow read, write: if request.auth != null; }
    match /orders/{orderId} { allow read, write: if request.auth != null; }
    match /reservations/{reservationId} { allow read, write: if request.auth != null; }
    match /tables/{tableId} { allow read, write: if request.auth != null; }
    match /supportTickets/{ticketId} { allow read, write: if request.auth != null; }
    match /payment_configs/{paymentId} { allow read, write: if request.auth != null; }
    match /payment_methods/{methodId} { allow read, write: if request.auth != null; }
    match /menu_styles/{styleId} { allow read, write: if request.auth != null; }
    match /globalAuditLogs/{logId} { allow read, write: if request.auth != null; }

  }
}
```

## 5. Pasos Finales de Inicialización

1.  **Instala las dependencias**:
    ```bash
    npm install
    ```
2.  **Pobla los datos iniciales**:
    *   Para crear los planes de suscripción y la configuración de la landing por defecto, ejecuta el script de sincronización:
        ```bash
        npm run db:sync
        ```
    *   Este script leerá tu `.env.local` y se conectará a tu nuevo proyecto para crear los documentos necesarios.
3.  **Ejecuta la aplicación**:
    ```bash
    npm run dev
    ```

Con estos pasos, tendrás una réplica funcional de la aplicación en tu nuevo entorno de Firebase.
