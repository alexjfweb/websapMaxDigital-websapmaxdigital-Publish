# WebSapMax - Aplicación SaaS para Restaurantes

Este es un proyecto completo de aplicación SaaS (Software as a Service) para restaurantes, construido con Next.js, Firebase, Tailwind CSS y ShadCN UI. La aplicación cuenta con múltiples roles (SuperAdmin, Admin, Empleado), un sistema de suscripción basado en planes, y un completo panel de gestión para restaurantes.

**Estado del Proyecto:** 🚀 **¡Listo para Producción!**

## 🌟 Características Principales

*   **Autenticación y Roles**: Sistema de registro e inicio de sesión con roles (SuperAdmin, Admin, Empleado).
*   **Modelo de Suscripción SaaS**:
    *   Landing page pública con planes de suscripción.
    *   Flujo de registro que vincula una empresa a un plan seleccionado.
    *   Pasarelas de pago integradas (Stripe, Mercado Pago) y pagos manuales.
    *   Página de gestión de suscripción para los administradores.
    *   **Control de acceso a funcionalidades basado en el plan (Feature Gating)**.
    *   **Validación de límites** (mesas, empleados, reservas) según el plan contratado.
*   **Panel de Administración (Restaurantes)**:
    *   Dashboard con métricas clave.
    *   Gestión de Platos (CRUD).
    *   Gestión de Empleados (Protegido por plan).
    *   Gestión de Mesas y Reservas.
    *   Gestión de Pedidos.
    *   Personalización del menú (Protegido por plan).
*   **Panel de Superadministración**:
    *   Gestión centralizada de Empresas, Usuarios y Planes.
    *   Paneles de analítica, auditoría y mantenimiento.
*   **Menú Público y Carrito**:
    *   Página de menú público y dinámico por restaurante.
    *   Carrito de compras funcional con envío de pedidos a través de WhatsApp.
*   **Base de Datos con Firestore**: Uso de Firestore para una gestión de datos escalable y en tiempo real.
*   **Despliegue Automatizado**: Configuración de GitHub Actions para despliegue continuo en Firebase Hosting.

## 🚀 Empezando

Para comenzar a trabajar con el proyecto, sigue estos pasos:

### 1. Instalación de Dependencias

Primero, instala todas las dependencias necesarias usando `npm`:

```bash
npm install
```

### 2. Configuración del Entorno (MUY IMPORTANTE)

La configuración de Firebase y otras claves sensibles se gestiona a través de variables de entorno.

1.  Crea un archivo llamado `.env.local` en la raíz del proyecto.
2.  Copia el contenido del archivo `.env.example` (si no existe, usa la plantilla de la [guía de reconstrucción](docs/RECREATION_GUIDE.md)) en tu nuevo archivo `.env.local`.
3.  Reemplaza los valores de ejemplo con tus propias claves de Firebase.

### 3. Ejecutar el Servidor de Desarrollo

Una vez configuradas las variables de entorno, puedes iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:9003](http://localhost:9003) en tu navegador para ver la aplicación.

### 4. Sincronización Inicial de la Base de Datos

La aplicación está diseñada para **auto-inicializarse**. La primera vez que visites la página de inicio, se crearán automáticamente los planes de suscripción y la configuración de la landing page por defecto en tu base de datos de Firestore.

Si necesitas forzar una resincronización, puedes usar el siguiente script:

```bash
npm run db:sync
```
