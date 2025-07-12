# Script de despliegue automático para Firebase (PowerShell)
# Uso: .\scripts\deploy.ps1 [-Production]

param(
    [switch]$Production
)

Write-Host "🚀 Iniciando despliegue automático..." -ForegroundColor Green

# Función para imprimir mensajes
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar si Firebase CLI está instalado
try {
    $null = Get-Command firebase -ErrorAction Stop
} catch {
    Write-Error "Firebase CLI no está instalado. Instálalo con: npm install -g firebase-tools"
    exit 1
}

# Verificar si estás logueado en Firebase
try {
    firebase projects:list | Out-Null
} catch {
    Write-Error "No estás logueado en Firebase. Ejecuta: firebase login"
    exit 1
}

Write-Status "Verificando dependencias..."
npm ci

Write-Status "Ejecutando type check..."
npm run typecheck

Write-Status "Ejecutando linting..."
npm run lint

Write-Status "Construyendo aplicación..."
npm run build

# Verificar si el build fue exitoso
if (-not (Test-Path ".next")) {
    Write-Error "El build falló. Revisa los errores arriba."
    exit 1
}

Write-Status "Desplegando a Firebase..."

# Si se pasa -Production, desplegar a producción
if ($Production) {
    Write-Warning "Desplegando a PRODUCCIÓN..."
    firebase deploy --only hosting
} else {
    Write-Status "Desplegando a staging..."
    firebase deploy --only hosting --project staging
}

Write-Status "✅ Despliegue completado exitosamente!"
Write-Status "Tu aplicación está disponible en: https://websapmaxdigital.web.app" 