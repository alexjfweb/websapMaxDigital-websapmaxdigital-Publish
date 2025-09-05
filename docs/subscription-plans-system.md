# Sistema de Gestión de Planes de Suscripción

## 📋 Resumen del Sistema

Este sistema implementa una gestión completa de planes de suscripción, desde su creación y visualización en la landing page hasta la validación de límites y permisos para cada usuario según su plan activo.

## 🏗️ Arquitectura de Componentes Clave

1.  **Servicio de Planes (`src/services/landing-plans-service.ts`)**:
    *   Gestiona el CRUD (Crear, Leer, Actualizar, Eliminar) completo para los planes.
    *   Sistema de auditoría para registrar todos los cambios.
    *   Validación estricta de datos (ej. slugs únicos).

2.  **Hook de Suscripción (`src/hooks/use-subscription.ts`)**:
    *   Componente central para obtener el plan **actual** de un usuario.
    *   Calcula los permisos derivados del plan (ej. `canManageEmployees`).
    *   Sincroniza la información de la compañía y su plan correspondiente.

3.  **Hook de Límites (`src/hooks/use-plan-limits.ts`)**:
    *   **Componente CRÍTICO para el modelo de negocio.**
    *   Calcula el uso actual de recursos (mesas, empleados, etc.).
    *   Compara el uso actual con los límites del plan del usuario.
    *   Devuelve un objeto `limits` que indica si se ha alcanzado el límite para cada recurso.

4.  **Componentes de UI de Bloqueo**:
    *   **`UpgradePlanCard`**: Tarjeta que se muestra cuando una funcionalidad completa está bloqueada por el plan.
    *   **`LimitReachedDialog`**: Modal que aparece cuando un usuario intenta crear un recurso (ej. una mesa) pero ya ha alcanzado el límite de su plan.

5.  **Flujo de Pago y Activación**:
    *   **`/admin/checkout`**: Página donde el usuario confirma la mejora de su plan.
    *   **`/api/payments/create-checkout-session`**: API segura que crea la sesión de pago con Stripe/MercadoPago, asegurando que se usa el `planId` (slug) correcto.
    *   **`/api/payments/webhook`**: API que recibe la confirmación del pago y actualiza el `planId` y `subscriptionStatus` de la compañía.

## 🗄️ Estructura de Datos (`landingPlans`)

```typescript
interface LandingPlan {
  id: string;          // ID de Firestore
  slug: string;        // Identificador único (ej. "plan-basico")
  name: string;        // Nombre del plan (ej. "Básico")
  description: string;
  price: number;
  currency: string;    // 'USD', 'COP', etc.
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive: boolean;   // Si el plan se puede contratar
  isPublic: boolean;   // Si se muestra en la landing
  isPopular: boolean;  // Si se destaca como popular
  order: number;       // Orden de visualización
  icon: string;        // Icono de Lucide
  color: string;       // Color del tema
  maxUsers: number;    // Límite de empleados (-1 = ilimitado)
  maxProjects: number; // Límite de mesas (-1 = ilimitado)
}
```

## 🚀 Flujo de Funcionalidades

### Superadmin
- ✅ **CRUD Completo**: Crear, editar, eliminar y reordenar planes desde el panel de superadmin.
- ✅ **Auditoría y Rollback**: Ver el historial de cambios de cada plan y revertir a una versión anterior.
- ✅ **Activación de Pagos**: Aprobar pagos manuales para activar suscripciones.

### Usuario Admin (Restaurante)
- ✅ **Visualización de Plan Actual**: Ver los detalles y límites de su suscripción activa.
- ✅ **Upgrade de Plan**: Flujo completo para seleccionar un plan superior y pagar.
- ✅ **Bloqueo de Funcionalidades**:
    - Si intenta acceder a una sección no permitida por su plan (ej. "Empleados" en el plan Básico), verá la tarjeta `UpgradePlanCard`.
    - Si intenta crear un recurso (ej. una mesa) y ha alcanzado el límite, verá el modal `LimitReachedDialog`.

## 🔧 Configuración y Despliegue

- La configuración inicial de los planes es **automática** al iniciar la aplicación por primera vez.
- Las reglas de Firestore están configuradas para permitir lectura pública de los planes marcados como `isPublic`.
- El sistema de límites (`use-plan-limits`) consulta en tiempo real el uso de recursos para aplicar las restricciones.
