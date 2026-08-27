#!/bin/bash

# Build Android APK - Script automatizado
# Uso: ./build-android.sh [debug|release]

set -e

BUILD_TYPE=${1:-debug}
DATE=$(date +%Y%m%d)
VERSION="1.0.0"

# Leído por capacitor.config.ts para deshabilitar debugging/mixed-content en release
export CAPACITOR_BUILD_TYPE=$BUILD_TYPE

echo "📱 Building Android APK ($BUILD_TYPE)..."

# ==========================================
# Preparar
# ==========================================

echo "🔧 Preparando build..."
cd /var/www/pwa-testigos

# Limpiar builds anteriores
rm -rf android/app/build/outputs/apk/*

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Build web
echo "🌐 Building web assets..."
npm run build

# Agregar plataforma nativa si aún no existe (cap sync no la crea, solo la
# actualiza; sin este paso el build fallaba siempre en un checkout limpio)
if [ ! -d "android" ]; then
    echo "➕ Agregando plataforma Android (primera vez)..."
    npx cap add android
fi

# Sync con Capacitor
echo "🔄 Sync con Capacitor..."
npx cap sync android

# ==========================================
# Build APK
# ==========================================

cd android

if [ "$BUILD_TYPE" = "release" ]; then
    echo "🔐 Build RELEASE..."
    
    # Verificar keystore
    if [ ! -f "keystore.jks" ]; then
        echo "❌ Keystore no encontrado. Crear primero:"
        echo "   keytool -genkey -v -keystore keystore.jks -alias preconteo -keyalg RSA -keysize 2048 -validity 10000"
        exit 1
    fi
    
    # Build release
    ./gradlew assembleRelease
    
    # Firmar APK (si no está firmado automáticamente)
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
    SIGNED_APK="app/build/outputs/apk/release/preconteo-v${VERSION}-${DATE}.apk"
    
    if [ -f "$APK_PATH" ]; then
        echo "🔏 Firmando APK..."
        jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
            -keystore keystore.jks \
            "$APK_PATH" \
            preconteo
        
        # Optimizar con zipalign
        zipalign -v 4 "$APK_PATH" "$SIGNED_APK"
        
        echo "✅ APK firmado: $SIGNED_APK"
    fi
    
    # Verificar firma
    apksigner verify -v "$SIGNED_APK"
    
else
    echo "🐛 Build DEBUG..."
    ./gradlew assembleDebug
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    FINAL_APK="app/build/outputs/apk/debug/preconteo-v${VERSION}-debug-${DATE}.apk"
    
    cp "$APK_PATH" "$FINAL_APK"
    echo "✅ APK debug: $FINAL_APK"
fi

# ==========================================
# Copiar a directorio de distribución
# ==========================================

DIST_DIR="/var/www/dist/android"
mkdir -p "$DIST_DIR"

if [ "$BUILD_TYPE" = "release" ]; then
    # Solo el APK firmado y alineado; el "*-unsigned.apk" original NO debe
    # llegar al directorio de distribución (no es instalable/publicable).
    cp "$SIGNED_APK" "$DIST_DIR/"
else
    cp "$FINAL_APK" "$DIST_DIR/"
fi

echo ""
echo "=========================================="
echo "  ✅ Build completado!"
echo "=========================================="
echo ""
echo "APK generado en:"
echo "  $DIST_DIR/"
echo ""
echo "Instalación:"
echo "  adb install $DIST_DIR/*.apk"
echo ""

# Generar checksum
cd "$DIST_DIR"
md5sum *.apk > checksums.md5
sha256sum *.apk > checksums.sha256

echo "Checksums generados."
