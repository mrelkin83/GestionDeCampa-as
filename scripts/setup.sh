#!/bin/bash

# Script de setup inicial para Plataforma Electoral Colombia
# Ejecutar después de clonar el repositorio

set -e  # Exit on error

echo "🚀 Plataforma Electoral Colombia - Setup Inicial"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar requisitos
echo "📋 Verificando requisitos..."

# Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker instalado${NC}"

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose instalado${NC}"

echo ""
echo "🔧 Configurando entorno..."

# Copiar archivos de entorno si no existen
if [ ! -f "backend-core/.env" ]; then
    echo "📝 Creando archivo .env para backend-core..."
    cp backend-core/.env.example backend-core/.env
    echo -e "${YELLOW}⚠️  Recuerda configurar las variables de entorno en backend-core/.env${NC}"
fi

if [ ! -f "frontend-web/.env" ]; then
    echo "📝 Creando archivo .env para frontend-web..."
    cp frontend-web/.env.example frontend-web/.env 2>/dev/null || echo "VITE_API_URL=http://localhost:8000/api" > frontend-web/.env
    echo -e "${YELLOW}⚠️  Recuerda configurar las variables de entorno en frontend-web/.env${NC}"
fi

echo ""
echo "🐳 Iniciando contenedores Docker..."
docker-compose up -d postgres redis

echo ""
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

echo ""
echo "📦 Instalando dependencias del backend..."
cd backend-core
if command -v composer &> /dev/null; then
    composer install --no-interaction
else
    echo -e "${YELLOW}⚠️  Composer no encontrado, saltando instalación de dependencias PHP${NC}"
fi

echo ""
echo "🔑 Generando application key..."
php artisan key:generate || echo -e "${YELLOW}⚠️  No se pudo generar la key${NC}"

echo ""
echo "🗄️  Ejecutando migraciones..."
php artisan migrate --force || echo -e "${YELLOW}⚠️  Error en migraciones${NC}"

echo ""
echo "🌱 Ejecutando seeders..."
php artisan db:seed || echo -e "${YELLOW}⚠️  Error en seeders${NC}"

echo ""
echo "🔗 Creando storage link..."
php artisan storage:link || echo -e "${YELLOW}⚠️  Error creando storage link${NC}"

cd ..

echo ""
echo "📦 Instalando dependencias del frontend..."
cd frontend-web
if command -v npm &> /dev/null; then
    npm install
else
    echo -e "${YELLOW}⚠️  npm no encontrado, saltando instalación de dependencias frontend${NC}"
fi
cd ..

echo ""
echo "✅ Setup completado!"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Configurar variables de entorno:"
echo "   - backend-core/.env (Twilio, AWS SES, WhatsApp)"
echo "   - frontend-web/.env (API URL)"
echo ""
echo "2. Importar datos:"
echo "   cd backend-core"
echo "   php artisan import:censo archivo.xlsx --user_id=1"
echo ""
echo "3. Iniciar servicios:"
echo "   Backend:  cd backend-core && php artisan serve"
echo "   Frontend: cd frontend-web && npm run dev"
echo "   Workers:  cd backend-core && php artisan queue:work"
echo ""
echo "4. Acceder a:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/api/health"
echo ""
echo "🎉 ¡Listo para comenzar!"
