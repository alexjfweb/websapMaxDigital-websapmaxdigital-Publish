#!/bin/bash

# Script de despliegue automático para Firebase
# Uso: ./scripts/deploy.sh [--production]

set -e

echo "🚀 Iniciando despliegue automático..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI no está instalado. Instálalo con: npm install -g firebase-tools"
    exit 1
fi

# Verificar si estás logueado en Firebase
if ! firebase projects:list &> /dev/null; then
    print_error "No estás logueado en Firebase. Ejecuta: firebase login"
    exit 1
fi

print_status "Verificando dependencias..."
npm ci

print_status "Ejecutando type check..."
npm run typecheck

print_status "Ejecutando linting..."
npm run lint

print_status "Construyendo aplicación..."
npm run build

# Verificar si el build fue exitoso
if [ ! -d ".next" ]; then
    print_error "El build falló. Revisa los errores arriba."
    exit 1
fi

print_status "Desplegando a Firebase..."

# Si se pasa --production, desplegar a producción
if [[ $1 == "--production" ]]; then
    print_warning "Desplegando a PRODUCCIÓN..."
    firebase deploy --only hosting
else
    print_status "Desplegando a staging..."
    firebase deploy --only hosting --project staging
fi

print_status "✅ Despliegue completado exitosamente!"
print_status "Tu aplicación está disponible en: https://websapmaxdigital.web.app" 