#!/bin/bash

# Script de Generación de Keystore - Android
# Este script genera el keystore necesario para firmar la app de Android
# ⚠️ IMPORTANTE: Guardar el keystore y la contraseña en lugar seguro

set -e

echo "=========================================="
echo "  GENERACIÓN DE KEYSTORE ANDROID"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
KEYSTORE_NAME="preconteo-keystore.jks"
ALIAS="preconteo"
VALIDITY=10000  # días (aprox 27 años)
KEYSIZE=2048
KEYALG="RSA"

# Funciones
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar dependencias
print_info "Verificando dependencias..."

if ! command -v keytool &> /dev/null; then
    print_error "keytool no encontrado"
    echo "Por favor instala Java JDK:"
    echo "  macOS: brew install openjdk"
    echo "  Linux: sudo apt-get install default-jdk"
    echo "  Windows: Descargar desde oracle.com"
    exit 1
fi

print_success "keytool encontrado"

# Verificar directorio
CREDENTIALS_DIR="credentials"
if [ ! -d "$CREDENTIALS_DIR" ]; then
    print_info "Creando directorio credentials/..."
    mkdir -p "$CREDENTIALS_DIR"
fi

cd "$CREDENTIALS_DIR"

# Verificar si keystore ya existe
if [ -f "$KEYSTORE_NAME" ]; then
    print_warning "El keystore '$KEYSTORE_NAME' ya existe"
    read -p "¿Deseas sobrescribirlo? (s/N): " overwrite
    if [[ ! $overwrite =~ ^[Ss]$ ]]; then
        print_info "Operación cancelada"
        exit 0
    fi
    rm "$KEYSTORE_NAME"
    print_info "Keystore anterior eliminado"
fi

echo ""
print_info "Generando keystore..."
echo ""

# Solicitar información
print_info "Por favor ingresa la siguiente información:"
echo ""

# Contraseña del keystore
while true; do
    read -s -p "Contraseña del keystore (mínimo 6 caracteres): " STOREPASS
    echo ""
    if [ ${#STOREPASS} -lt 6 ]; then
        print_error "La contraseña debe tener al menos 6 caracteres"
        continue
    fi
    read -s -p "Confirmar contraseña: " STOREPASS_CONFIRM
    echo ""
    if [ "$STOREPASS" != "$STOREPASS_CONFIRM" ]; then
        print_error "Las contraseñas no coinciden"
        continue
    fi
    break
done

# Contraseña del alias (puede ser igual al keystore)
read -p "¿Usar la misma contraseña para el alias? (S/n): " same_pass
if [[ $same_pass =~ ^[Nn]$ ]]; then
    while true; do
        read -s -p "Contraseña del alias: " ALIASPASS
        echo ""
        if [ ${#ALIASPASS} -lt 6 ]; then
            print_error "La contraseña debe tener al menos 6 caracteres"
            continue
        fi
        break
    done
else
    ALIASPASS="$STOREPASS"
fi

echo ""
print_info "Información del certificado:"
echo ""

# Información del certificado
read -p "Nombre y apellido [Plataforma Electoral]: " NAME
NAME=${NAME:-"Plataforma Electoral"}

read -p "Unidad organizacional [Desarrollo]: " OU
OU=${OU:-"Desarrollo"}

read -p "Organización [Plataforma Electoral Colombia]: " O
O=${O:-"Plataforma Electoral Colombia"}

read -p "Ciudad [Bogotá]: " L
L=${L:-"Bogotá"}

read -p "Estado/Departamento [Cundinamarca]: " ST
ST=${ST:-"Cundinamarca"}

read -p "Código de país [CO]: " C
C=${C:-"CO"}

echo ""
print_info "Generando keystore con los siguientes datos:"
echo "  Nombre del archivo: $KEYSTORE_NAME"
echo "  Alias: $ALIAS"
echo "  Validez: $VALIDITY días"
echo "  Tamaño de clave: $KEYSIZE bits"
echo "  Nombre: $NAME"
echo "  Organización: $O"
echo "  Ubicación: $L, $ST, $C"
echo ""

read -p "¿Continuar? (s/N): " confirm
if [[ ! $confirm =~ ^[Ss]$ ]]; then
    print_info "Operación cancelada"
    exit 0
fi

# Generar keystore
keytool -genkey -v \
  -keystore "$KEYSTORE_NAME" \
  -alias "$ALIAS" \
  -keyalg "$KEYALG" \
  -keysize "$KEYSIZE" \
  -validity "$VALIDITY" \
  -storepass "$STOREPASS" \
  -keypass "$ALIASPASS" \
  -dname "CN=$NAME, OU=$OU, O=$O, L=$L, ST=$ST, C=$C" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    print_success "Keystore generado exitosamente!"
    echo ""
    print_info "Detalles del archivo:"
    ls -lh "$KEYSTORE_NAME"
    echo ""
    
    # Mostrar información del certificado
    print_info "Información del certificado:"
    keytool -list -v \
      -keystore "$KEYSTORE_NAME" \
      -storepass "$STOREPASS" \
      -alias "$ALIAS" 2>&1 | head -20
    
    echo ""
    print_warning "⚠️  IMPORTANTE - GUARDAR EN LUGAR SEGURO:"
    echo ""
    echo "  Archivo: $(pwd)/$KEYSTORE_NAME"
    echo "  Alias: $ALIAS"
    echo "  Contraseña del keystore: [GUARDAR]"
    echo "  Contraseña del alias: [GUARDAR]"
    echo ""
    print_warning "Si pierdes el keystore o las contraseñas, NO podrás actualizar la app en Google Play"
    echo ""
    
    # Crear archivo de backup de información
    BACKUP_FILE="keystore-info-backup.txt"
    cat > "$BACKUP_FILE" << EOF
=== BACKUP INFORMACIÓN KEYSTORE ===
Fecha de generación: $(date)
Nombre del archivo: $KEYSTORE_NAME
Alias: $ALIAS
Validez: $VALIDITY días
Tamaño de clave: $KEYSIZE bits

Información del certificado:
- Nombre: $NAME
- Unidad: $OU
- Organización: $O
- Ciudad: $L
- Estado: $ST
- País: $C

=== INSTRUCCIONES ===
1. Guardar este archivo en lugar seguro
2. NO incluir las contraseñas en este archivo
3. Las contraseñas deben guardarse en un password manager
4. Hacer backup del archivo $KEYSTORE_NAME

=== COMANDOS ÚTILES ===
Ver información:
  keytool -list -v -keystore $KEYSTORE_NAME -alias $ALIAS

Exportar certificado:
  keytool -export -keystore $KEYSTORE_NAME -alias $ALIAS -file certificado.crt

Cambiar contraseña:
  keytool -storepasswd -keystore $KEYSTORE_NAME
EOF

    print_info "Archivo de backup creado: $BACKUP_FILE"
    echo ""
    print_info "Próximos pasos:"
    echo "  1. Guardar $KEYSTORE_NAME en un lugar seguro"
    echo "  2. Guardar las contraseñas en un password manager"
    echo "  3. Subir el keystore a EAS con: npx eas credentials"
    echo "  4. Configurar en Google Play Console"
    echo ""
    
else
    print_error "Error al generar el keystore"
    exit 1
fi
