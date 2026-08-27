#!/bin/bash

# Script de testing para Plataforma Electoral Colombia

set -e

echo "🧪 Plataforma Electoral Colombia - Testing Suite"
echo "==============================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Backend Tests
echo "🔧 Testing Backend..."
cd backend-core

# PHPUnit tests (si existen)
if [ -f "vendor/bin/phpunit" ]; then
    echo "Running PHPUnit tests..."
    ./vendor/bin/phpunit --testdox
else
    echo -e "${YELLOW}⚠️  PHPUnit no encontrado${NC}"
fi

# Laravel Pint (code style)
if [ -f "vendor/bin/pint" ]; then
    echo ""
    echo "Checking code style..."
    ./vendor/bin/pint --test
else
    echo -e "${YELLOW}⚠️  Laravel Pint no encontrado${NC}"
fi

# Test integraciones
echo ""
echo "Testing integraciones de comunicación..."
php artisan test:integrations || echo -e "${YELLOW}⚠️  Algunas integraciones no están configuradas${NC}"

cd ..

# Frontend Tests
echo ""
echo "🎨 Testing Frontend..."
cd frontend-web

if [ -f "package.json" ]; then
    # TypeScript check
    echo "Checking TypeScript..."
    npm run type-check || npx tsc --noEmit || echo -e "${YELLOW}⚠️  TypeScript errors found${NC}"

    # ESLint
    echo ""
    echo "Running ESLint..."
    npm run lint || echo -e "${YELLOW}⚠️  ESLint warnings/errors found${NC}"

    # Build test
    echo ""
    echo "Testing build..."
    npm run build
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${YELLOW}⚠️  package.json no encontrado${NC}"
fi

cd ..

echo ""
echo "🎉 Testing completado!"
echo ""
