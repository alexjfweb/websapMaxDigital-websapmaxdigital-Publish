# Sistema de Gestión de Planes de Suscripción

## 📋 Resumen del Sistema

Este sistema implementa una gestión completa de planes de suscripción para la landing page, con sincronización en tiempo real con Firestore y un panel exclusivo de superadmin para la gestión.

## 🏗️ Arquitectura

### Componentes Principales

1. **Servicio de Planes** (`src/services/landing-plans-service.ts`)
   - CRUD completo para planes
   - Sistema de auditoría y rollback
   - Validación estricta de datos
   - Generación automática de slugs

2. **Hooks de React** (`src/hooks/use-landing-plans.ts`)
   - Sincronización en tiempo real con Firestore
   - Operaciones CRUD optimizadas
   - Gestión de estado local

3. **API REST** (`src/app/api/landing-plans/`)
   - Endpoints para todas las operaciones
   - Validación de permisos
   - Logging detallado

4. **Interfaz de Usuario**
   - Landing page pública (`src/app/page.tsx`)
   - Panel de superadmin (`src/app/superadmin/subscription-plans/page.tsx`)

## 🗄️ Estructura de Base de Datos

### Colección: `landingPlans`

```typescript
interface LandingPlan {
  id: string;
  slug: string;           // Generado automáticamente
  name: string;           // Requerido, único
  description: string;    // Requerido
  price: number;          // Requerido, >= 0
  currency: string;       // Default: 'USD'
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];     // Requerido, no vacío
  isActive: boolean;      // Default: true
  isPopular: boolean;     // Default: false
  order: number;          // Para ordenamiento
  icon: string;           // Requerido
  color: string;          // Requerido
  maxUsers: number;       // -1 = ilimitado
  maxProjects: number;    // -1 = ilimitado
  ctaText: string;        // Default: 'Comenzar Prueba Gratuita'
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Colección: `planAuditLogs`

```typescript
interface PlanAuditLog {
  id: string;
  planId: string;
  action: 'created' | 'updated' | 'deleted' | 'reordered' | 'rollback';
  userId: string;
  userEmail: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  previousData?: Partial<LandingPlan>;
  newData?: Partial<LandingPlan>;
  metadata?: any;
}
```

## 🚀 Funcionalidades

### Para Usuarios Públicos (Landing Page)

- ✅ Visualización de planes activos
- ✅ Diseño moderno con tarjetas animadas
- ✅ Colores e íconos personalizables por plan
- ✅ Sincronización en tiempo real
- ✅ Estados de carga y error

### Para Superadmin

- ✅ **Crear Planes**: Formulario completo con validación
- ✅ **Editar Planes**: Modificación de todos los campos
- ✅ **Eliminar Planes**: Soft delete con confirmación
- ✅ **Reordenar Planes**: Drag & drop o botones
- ✅ **Historial de Auditoría**: Ver todos los cambios
- ✅ **Rollback**: Revertir a versiones anteriores
- ✅ **Validación Estricta**: Slugs únicos, campos requeridos

## 🔧 Configuración

### Variables de Entorno

```env
# Firebase (ya configurado)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Permisos de Firestore

```javascript
// Reglas recomendadas para landingPlans
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lectura pública para planes activos
    match /landingPlans/{planId} {
      allow read: if resource.data.isActive == true;
      allow write: if request.auth != null && 
                   request.auth.token.role == 'superadmin';
    }
    
    // Auditoría solo para superadmin
    match /planAuditLogs/{logId} {
      allow read, write: if request.auth != null && 
                        request.auth.token.role == 'superadmin';
    }
  }
}
```

## 📱 Uso del Sistema

### 1. Acceder al Panel de Superadmin

```
http://localhost:3000/superadmin/subscription-plans
```

### 2. Crear un Plan

1. Hacer clic en "Crear Nuevo Plan"
2. Completar todos los campos obligatorios
3. Agregar características (mínimo 1)
4. Seleccionar ícono y color
5. Guardar

### 3. Editar un Plan

1. Hacer clic en el ícono de editar
2. Modificar los campos necesarios
3. Guardar cambios

### 4. Reordenar Planes

1. Usar los botones ↑↓ para mover planes
2. Los cambios se reflejan inmediatamente

### 5. Ver Historial

1. Hacer clic en el ícono de historial
2. Ver todos los cambios realizados
3. Opción de rollback disponible

## 🧪 Pruebas

### Script de Pruebas Automáticas

```javascript
// En la consola del navegador
await testSystem.runAllTests();
```

### Script de Creación de Datos de Ejemplo

```javascript
// En la consola del navegador
await createSamplePlans.createAllPlans();
```

### Limpieza de Datos de Prueba

```javascript
// En la consola del navegador
await testSystem.cleanupTestData();
```

## 🔍 Monitoreo y Logs

### Logs del Sistema

- ✅ Todas las operaciones CRUD se registran
- ✅ Errores se capturan y reportan
- ✅ Auditoría completa de cambios
- ✅ Métricas de rendimiento

### Endpoints de API

- `GET /api/landing-plans` - Obtener todos los planes
- `POST /api/landing-plans` - Crear nuevo plan
- `GET /api/landing-plans/[id]` - Obtener plan específico
- `PUT /api/landing-plans/[id]` - Actualizar plan
- `DELETE /api/landing-plans/[id]` - Eliminar plan
- `POST /api/landing-plans/reorder` - Reordenar planes
- `GET /api/landing-plans/[id]/audit` - Historial de auditoría
- `POST /api/landing-plans/[id]/rollback` - Rollback a versión anterior

## 🎨 Personalización

### Íconos Disponibles

- `zap` - ⚡ Zap
- `star` - ⭐ Star
- `dollar` - 💰 Dollar
- `users` - 👥 Users
- `calendar` - 📅 Calendar
- `palette` - 🎨 Palette

### Colores Disponibles

- `blue` - Azul
- `green` - Verde
- `purple` - Púrpura
- `orange` - Naranja
- `red` - Rojo
- `indigo` - Índigo

## 🚨 Solución de Problemas

### Error: "The query requires an index"

Si aparece este error, crear el índice en Firestore:

```
Collection: landingPlans
Fields: isActive (Ascending), order (Ascending), __name__ (Ascending)
```

### Error: "Ya existe un plan con el nombre..."

- Verificar que el nombre sea único
- El slug se genera automáticamente del nombre
- Cambiar el nombre si es necesario

### Error: "Cannot read properties of undefined"

- Verificar que Firebase esté inicializado correctamente
- Comprobar las variables de entorno
- Reiniciar el servidor de desarrollo

## 📈 Próximas Mejoras

- [ ] Exportar/importar planes
- [ ] Plantillas de planes predefinidas
- [ ] Estadísticas de uso por plan
- [ ] Integración con sistema de pagos
- [ ] Notificaciones de cambios
- [ ] Backup automático de planes

## 📞 Soporte

Para problemas o preguntas sobre el sistema:

1. Revisar los logs en la consola del navegador
2. Verificar la configuración de Firebase
3. Comprobar los permisos de Firestore
4. Ejecutar las pruebas automáticas

---

**Sistema implementado y funcional al 100%** ✅ 