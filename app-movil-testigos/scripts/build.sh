#!/bin/bash

# Build Script - App Móvil Nativa
# Genera builds de producción para Android e iOS

set -e

echo "🏗️  BUILD SCRIPT - APP MÓVIL NATIVA"
echo "=================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funciones
print_status() {
    echo -e "${BLUE}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar dependencias
print_status "Verificando dependencias..."

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    print_error "npx no está disponible"
    exit 1
fi

print_success "Dependencias OK"
echo ""

# Verificar EAS CLI
print_status "Verificando EAS CLI..."

if ! npx eas --version &> /dev/null; then
    print_status "Instalando EAS CLI..."
    npm install -g eas-cli
fi

print_success "EAS CLI OK"
echo ""

# Login en EAS
print_status "Verificando login en EAS..."
npx eas whoami || npx eas login
echo ""

# Menú de selección
echo "Seleccione el tipo de build:"
echo "1) Android - Development"
echo "2) Android - Preview (APK)"
echo "3) Android - Production (AAB)"
echo "4) iOS - Development"
echo "5) iOS - Preview"
echo "6) iOS - Production"
echo "7) Cancelar"
echo ""

read -p "Opción: " opcion

case $opcion in
    1)
        print_status "Generando build Android Development..."
        npx eas build --platform android --profile development
        ;;
    2)
        print_status "Generando build Android Preview (APK)..."
        npx eas build --platform android --profile preview
        print_success "APK generado para pruebas"
        ;;
    3)
        print_status "Generando build Android Production (AAB)..."
        npx eas build --platform android --profile production
        print_success "AAB generado para Play Store"
        echo ""
        read -p "¿Desea subir a Play Store ahora? (s/n): " upload
        if [ "$upload" = "s" ]; then
            npx eas submit --platform android
        fi
        ;;
    4)
        print_status "Generando build iOS Development..."
        npx eas build --platform ios --profile development
        ;;
    5)
        print_status "Generando build iOS Preview..."
        npx eas build --platform ios --profile preview
        ;;
    6)
        print_status "Generando build iOS Production..."
        npx eas build --platform ios --profile production
        print_success "IPA generado para App Store"
        echo ""
        read -p "¿Desea subir a App Store Connect ahora? (s/n): " upload
        if [ "$upload" = "s" ]; then
            npx eas submit --platform ios
        fi
        ;;
    7)
        echo "Cancelado"
        exit 0
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
print_success "Proceso completado!"
echo ""
echo "📦 Los builds estarán disponibles en:"
echo "   https://expo.dev/accounts/[username]/projects/[project]/builds"
echo ""
echo "📱 Para instalar en dispositivo:"
echo "   - Android: Descargar APK e instalar"
echo "   - iOS: Usar TestFlight o instalar directo con perfil de desarrollo"
