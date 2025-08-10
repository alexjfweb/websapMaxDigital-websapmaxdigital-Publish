# Scripts de Desarrollo y Mantenimiento

Este directorio contiene scripts útiles para poblar la base de datos con datos de ejemplo, realizar migraciones o llevar a cabo tareas de limpieza.

## Scripts Disponibles

### 1. `create-sample-dishes.js`

- **Propósito**: Crea un conjunto de platos de ejemplo (`Entradas`, `Platos Fuertes`, `Postres`, `Bebidas`) para una compañía específica en Firestore.
- **Utilidad**: Ideal para administradores de nuevos restaurantes que necesitan ver cómo funciona la gestión de platos sin tener que crearlos manualmente desde cero. Ayuda a visualizar rápidamente la interfaz de platos con datos reales.
- **Uso**:
    ```bash
    npm run seed:dishes
    ```
    *Nota: Este script se ejecuta con Node.js y cargará las variables de entorno de tu archivo `.env.local` automáticamente.*

### 2. `create-sample-plans.js`

- **Propósito**: Crea planes de suscripción de ejemplo (`Básico`, `Profesional`, `Empresarial`) que se muestran en la página principal.
- **Utilidad**: Permite al SuperAdmin poblar rápidamente la sección de planes de la landing page.
- **Uso**:
    1.  Navega a la página de gestión de planes de suscripción en el panel de SuperAdmin.
    2.  Abre la consola del navegador.
    3.  Este script se ejecuta automáticamente, pero puedes llamar a `window.createSamplePlans.createAllPlans()` para forzar la creación.

### 3. `cleanup-plans.js`

- **Propósito**: Elimina planes duplicados de la colección `landingPlans`, conservando solo el más reciente.
- **Utilidad**: Herramienta de mantenimiento para corregir inconsistencias en la base de datos que puedan surgir durante el desarrollo o por errores manuales.
- **Uso**:
    ```bash
    node scripts/cleanup-plans.js
    ```
    *Nota: Asegúrate de tener las variables de entorno de Firebase configuradas en tu terminal.*

### 4. `test-complete-system.js`

- **Propósito**: Ejecuta una suite completa de pruebas de extremo a extremo para el sistema de planes, incluyendo creación, actualización, reordenamiento y auditoría.
- **Utilidad**: Permite verificar rápidamente la integridad de todo el sistema de planes después de realizar cambios importantes.
- **Uso**:
    1.  Navega a la página de gestión de planes de suscripción.
    2.  Abre la consola del navegador.
    3.  Ejecuta `testSystem.runAllTests()`.
    4.  Para limpiar los datos de prueba, ejecuta `testSystem.cleanupTestData()`.

## Automatización (Cron Jobs)

La aplicación incluye un endpoint de API diseñado para ser llamado por un servicio de tareas programadas (como Vercel Cron Jobs, GitHub Actions Scheduler o un servicio externo como `cron-job.org`).

- **Endpoint**: `GET /api/cron`
- **Propósito**: Ejecuta tareas de mantenimiento críticas:
    1.  **Degradación de Suscripciones**: Busca pruebas o planes expirados y los cambia automáticamente al "Plan Gratis Lite".
    2.  **Limpieza de Datos**: Elimina datos no esenciales (pedidos, reservas) de las cuentas que se encuentran en el "Plan Gratis Lite".
- **Configuración Recomendada**: Programar una llamada a este endpoint cada 24 horas para mantener el sistema actualizado y limpio. Por seguridad, se recomienda proteger el endpoint con un token secreto.
