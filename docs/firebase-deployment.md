# Configuración de Despliegue Automático en Firebase

Este documento explica cómo configurar y usar el sistema de actualización automática en Firebase para tu proyecto.

## 🚀 Opciones de Despliegue Automático

### 1. GitHub Actions (Recomendado)

El archivo `.github/workflows/firebase-deploy.yml` se ejecuta automáticamente cuando:
- Haces push a las ramas `main` o `master`
- Creas un Pull Request a `main` o `master`

#### Configuración necesaria:

1. **Crear secretos en GitHub:**
   - Ve a tu repositorio → Settings → Secrets and variables → Actions
   - Agrega estos secretos:
     - `FIREBASE_PROJECT_ID`: ID de tu proyecto Firebase
     - `FIREBASE_SERVICE_ACCOUNT`: JSON de la cuenta de servicio

2. **Generar cuenta de servicio:**
   ```bash
   # En Firebase Console
   Project Settings → Service Accounts → Generate new private key
   ```

### 2. Scripts de Despliegue Local

#### PowerShell (Windows):
```powershell
# Despliegue a staging
.\scripts\deploy.ps1

# Despliegue a producción
.\scripts\deploy.ps1 -Production
```

#### Bash (Linux/Mac):
```bash
# Despliegue a staging
./scripts/deploy.sh

# Despliegue a producción
./scripts/deploy.sh --production
```

### 3. Scripts NPM

```bash
# Despliegue automático (incluye typecheck y lint)
npm run deploy

# Despliegue a staging
npm run deploy:staging

# Despliegue a producción
npm run deploy:production
```

## 🔧 Configuración Inicial

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Loguearse en Firebase
```bash
firebase login
```

### 3. Configurar proyecto
```bash
firebase use --add
```

### 4. Configurar targets (opcional)
```bash
# Para staging
firebase target:apply hosting staging websapmaxdigital-staging

# Para producción
firebase target:apply hosting production websapmaxdigital
```

## 📋 Flujo de Trabajo Recomendado

### Desarrollo:
1. Trabaja en una rama feature
2. Haz commits regulares
3. Ejecuta `npm run predeploy` para verificar código

### Staging:
1. Merge a rama `develop` o `staging`
2. GitHub Actions despliega automáticamente
3. Prueba en el entorno de staging

### Producción:
1. Merge a rama `main` o `master`
2. GitHub Actions despliega automáticamente a producción
3. Verifica que todo funcione correctamente

## 🔍 Monitoreo

### Verificar despliegues:
```bash
# Ver historial de despliegues
firebase hosting:releases:list

# Ver detalles de un despliegue específico
firebase hosting:releases:view [RELEASE_ID]
```

### Logs de GitHub Actions:
- Ve a tu repositorio → Actions
- Revisa los logs del workflow "Deploy to Firebase"

## 🛠️ Solución de Problemas

### Error: "Firebase CLI no está instalado"
```bash
npm install -g firebase-tools
```

### Error: "No estás logueado en Firebase"
```bash
firebase login
```

### Error: "Build falló"
1. Ejecuta `npm run typecheck` localmente
2. Ejecuta `npm run lint` localmente
3. Revisa errores de TypeScript o ESLint

### Error: "Permisos insuficientes"
1. Verifica que tu cuenta tenga permisos en el proyecto Firebase
2. Regenera la cuenta de servicio si es necesario

## 📝 Variables de Entorno

Crea un archivo `.env.local` para configuraciones locales:
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=websapmaxdigital
NEXT_PUBLIC_FIREBASE_API_KEY=BB7zCrAz2u0wJBGuhAAVuoSk6Hx3lYv8dTGweV8TD_7oHCYhj56iKGxfogwuLiMREVq3PMLRnOIQU8Fma4Gt2YA
```

## 🔒 Seguridad

- Nunca commits credenciales de Firebase
- Usa secretos de GitHub para credenciales
- Configura reglas de seguridad en Firebase
- Revisa logs de acceso regularmente

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de GitHub Actions
2. Verifica la configuración de Firebase
3. Consulta la documentación oficial de Firebase
4. Revisa este documento de configuración 