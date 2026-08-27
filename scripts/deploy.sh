#!/bin/bash

# Script de Deploy - Sistema de Preconteo
# Uso: ./deploy.sh [entorno]
# Entornos: staging | production

set -e

ENV=${1:-staging}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/preconteo"

echo "🚀 Iniciando deploy a $ENV..."

# ==========================================
# Funciones
# ==========================================

backup_database() {
    echo "💾 Creando backup de base de datos..."
    mkdir -p $BACKUP_DIR
    sudo -u postgres pg_dump electoral_platform > $BACKUP_DIR/preconteo_$DATE.sql
    echo "✅ Backup creado: $BACKUP_DIR/preconteo_$DATE.sql"
}

deploy_backend() {
    echo "🔧 Deploy Backend Core (Laravel)..."
    cd /var/www/backend-core
    
    # Pull latest changes
    sudo -u www-data git pull origin main
    
    # Install dependencies
    sudo -u www-data composer install --no-dev --optimize-autoloader --no-interaction
    
    # Run migrations
    sudo -u www-data php artisan migrate --force --no-interaction
    
    # Optimize
    sudo -u www-data php artisan config:cache
    sudo -u www-data php artisan route:cache
    sudo -u www-data php artisan view:cache
    sudo -u www-data php artisan event:cache
    
    # Clear old caches
    sudo -u www-data php artisan cache:clear
    
    # Restart PHP-FPM
    sudo systemctl restart php8.2-fpm
    
    echo "✅ Backend Core deployado"
}

deploy_websocket() {
    echo "🔌 Deploy WebSocket Server (NestJS)..."
    cd /var/www/backend-diad
    
    # Pull latest changes
    sudo -u www-data git pull origin main
    
    # Install dependencies
    sudo -u www-data npm ci
    
    # Build
    sudo -u www-data npm run build
    
    # Restart service
    sudo systemctl restart preconteo-ws
    
    echo "✅ WebSocket Server deployado"
}

deploy_frontend() {
    echo "🎨 Deploy Frontend Web..."
    cd /var/www/frontend-web
    
    # Pull latest changes
    sudo -u www-data git pull origin main
    
    # Install dependencies
    sudo -u www-data npm ci
    
    # Build
    sudo -u www-data npm run build
    
    echo "✅ Frontend Web deployado"
}

deploy_pwa() {
    echo "📱 Deploy PWA Testigos..."
    cd /var/www/pwa-testigos
    
    # Pull latest changes
    sudo -u www-data git pull origin main
    
    # Install dependencies
    sudo -u www-data npm ci
    
    # Build
    sudo -u www-data npm run build
    
    echo "✅ PWA Testigos deployado"
}

restart_services() {
    echo "🔄 Reiniciando servicios..."
    
    # Nginx
    sudo nginx -t && sudo systemctl restart nginx
    
    # PHP-FPM
    sudo systemctl restart php8.2-fpm
    
    # WebSocket
    sudo systemctl restart preconteo-ws
    
    # Workers
    sudo supervisorctl restart laravel-workers:*
    
    echo "✅ Servicios reiniciados"
}

health_check() {
    echo "🏥 Verificando salud del sistema..."
    
    # Check API
    if curl -s -o /dev/null -w "%{http_code}" https://api.tudominio.com/api/health | grep -q "200"; then
        echo "✅ API saludable"
    else
        echo "❌ API no responde"
        exit 1
    fi
    
    # Check WebSocket
    if systemctl is-active --quiet preconteo-ws; then
        echo "✅ WebSocket activo"
    else
        echo "❌ WebSocket inactivo"
        exit 1
    fi
    
    # Check workers
    if sudo supervisorctl status | grep -q "RUNNING"; then
        echo "✅ Workers activos"
    else
        echo "⚠️  Algunos workers inactivos"
    fi
    
    echo "✅ Health check completado"
}

rollback() {
    echo "⚠️  Rollback solicitado..."
    echo "🔄 Restaurando backup más reciente..."
    
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/preconteo_*.sql | head -1)
    if [ -f "$LATEST_BACKUP" ]; then
        sudo -u postgres psql -d electoral_platform -f "$LATEST_BACKUP"
        echo "✅ Base de datos restaurada desde: $LATEST_BACKUP"
    else
        echo "❌ No se encontró backup"
        exit 1
    fi
    
    restart_services
}

# ==========================================
# Main
# ==========================================

case "$2" in
    --rollback)
        rollback
        exit 0
        ;;
esac

echo "=========================================="
echo "  Deploy Sistema Preconteo - $ENV"
echo "  Fecha: $DATE"
echo "=========================================="

# Backup
backup_database

# Deploy
deploy_backend
deploy_websocket
deploy_frontend
deploy_pwa

# Restart
restart_services

# Health check
health_check

echo ""
echo "=========================================="
echo "  ✅ Deploy completado exitosamente!"
echo "=========================================="
echo ""
echo "URLs:"
echo "  API:      https://api.tudominio.com"
echo "  Web:      https://app.tudominio.com"
echo "  WebSocket: wss://ws.tudominio.com"
echo "  PWA:      https://pwa.tudominio.com"
echo ""
echo "Para rollback ejecutar:"
echo "  ./deploy.sh $ENV --rollback"
