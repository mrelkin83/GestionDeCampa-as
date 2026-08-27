# Guía de Deployment - Sistema de Preconteo

Esta guía describe el proceso de deployment del sistema de preconteo en un VPS Contabo (Ubuntu 22.04).

## Requisitos

- VPS con Ubuntu 22.04
- Mínimo 4GB RAM, 2 CPUs
- 50GB disco SSD
- Dominio configurado con DNS apuntando al VPS

## Estructura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS Contabo                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Nginx (Reverse Proxy)              │   │
│  │  - SSL/TLS (Let's Encrypt)                          │   │
│  │  - Rate limiting                                    │   │
│  └───────────┬─────────────────────┬───────────────────┘   │
│              │                     │                       │
│  ┌───────────▼────────┐  ┌────────▼─────────┐             │
│  │  Laravel (PHP 8.2) │  │  NestJS (Node)   │             │
│  │  - API REST        │  │  - WebSockets    │             │
│  │  - Jobs/Queues     │  │  - Real-time     │             │
│  │  Port: 8000        │  │  Port: 3001      │             │
│  └───────────┬────────┘  └────────┬─────────┘             │
│              │                    │                        │
│  ┌───────────▼────────────────────▼──────────┐            │
│  │              Redis (Cache + Queues)        │            │
│  │  Port: 6379                                │            │
│  └───────────┬───────────────────────────────┘            │
│              │                                             │
│  ┌───────────▼──────────────┐                             │
│  │   PostgreSQL 15 + PostGIS│                             │
│  │   Port: 5432             │                             │
│  └──────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

## Paso 1: Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias básicas
sudo apt install -y curl wget git unzip software-properties-common

# Configurar timezone
sudo timedatectl set-timezone America/Bogota
```

## Paso 2: Instalar PHP 8.2

```bash
# Agregar repositorio PHP
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Instalar PHP y extensiones
sudo apt install -y php8.2-fpm php8.2-cli php8.2-pgsql php8.2-redis \
    php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-curl php8.2-zip \
    php8.2-gd php8.2-intl php8.2-imagick

# Verificar instalación
php --version
```

## Paso 3: Instalar PostgreSQL + PostGIS

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql-15 postgresql-15-postgis-3

# Iniciar servicio
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER preconteo WITH PASSWORD 'tu_password_seguro';"
sudo -u postgres psql -c "CREATE DATABASE preconteo OWNER preconteo;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE preconteo TO preconteo;"

# Habilitar PostGIS
sudo -u postgres psql -d preconteo -c "CREATE EXTENSION postgis;"

# Configurar acceso remoto (opcional, solo si es necesario)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Descomentar y modificar: listen_addresses = 'localhost'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Agregar: host all all 127.0.0.1/32 md5

sudo systemctl restart postgresql
```

## Paso 4: Instalar Redis

```bash
sudo apt install -y redis-server

# Configurar Redis
sudo nano /etc/redis/redis.conf

# Modificar:
# supervised systemd
# maxmemory 256mb
# maxmemory-policy allkeys-lru

sudo systemctl enable redis
sudo systemctl restart redis

# Verificar
redis-cli ping  # Debe responder PONG
```

## Paso 5: Instalar Node.js

```bash
# Instalar Node.js 20
sudo apt install -y nodejs npm
sudo npm install -g n
sudo n 20

# Verificar
node --version  # v20.x.x
npm --version
```

## Paso 6: Instalar Nginx

```bash
sudo apt install -y nginx

# Remover default site
sudo rm /etc/nginx/sites-enabled/default

# Crear configuración
sudo nano /etc/nginx/sites-available/preconteo
```

Configuración Nginx:

```nginx
# API Laravel
server {
    listen 80;
    server_name api.tudominio.com;
    root /var/www/backend-core/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }
}

# WebSocket NestJS (proxy)
server {
    listen 80;
    server_name ws.tudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

```bash
# Habilitar sitios
sudo ln -s /etc/nginx/sites-available/preconteo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Paso 7: Deploy Backend Core (Laravel)

```bash
# Clonar repositorio
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/tu-repo/backend-core.git
sudo chown -R www-data:www-data backend-core

# Instalar dependencias
cd backend-core
sudo -u www-data composer install --no-dev --optimize-autoloader

# Configurar .env
sudo -u www-data cp .env.example .env
sudo -u www-data nano .env

# Configuraciones importantes:
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.tudominio.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=preconteo
DB_USERNAME=preconteo
DB_PASSWORD=tu_password_seguro

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Generar key
sudo -u www-data php artisan key:generate

# Optimizar
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
sudo -u www-data php artisan event:cache

# Ejecutar migraciones
sudo -u www-data php artisan migrate --force

# Crear storage link
sudo -u www-data php artisan storage:link

# Configurar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

## Paso 8: Deploy Backend Día D (NestJS)

```bash
cd /var/www
sudo git clone https://github.com/tu-repo/backend-diad.git
sudo chown -R www-data:www-data backend-diad

cd backend-diad

# Instalar dependencias
sudo -u www-data npm ci

# Configurar .env
sudo -u www-data cp .env.example .env
sudo -u www-data nano .env

# Build
sudo -u www-data npm run build

# Crear servicio systemd
sudo nano /etc/systemd/system/preconteo-ws.service
```

Servicio systemd:

```ini
[Unit]
Description=Preconteo WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/backend-diad
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable preconteo-ws
sudo systemctl start preconteo-ws

# Verificar estado
sudo systemctl status preconteo-ws
```

## Paso 9: Configurar Supervisor (Queues)

```bash
sudo apt install -y supervisor

# Copiar configuración de workers
sudo cp /var/www/backend-core/docs/supervisor-workers.conf \
        /etc/supervisor/conf.d/laravel-workers.conf

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-workers:*

# Verificar
sudo supervisorctl status
```

## Paso 10: SSL/TLS con Let's Encrypt

```bash
# Instalar certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d api.tudominio.com -d ws.tudominio.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Paso 11: Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Opcional: restringir PostgreSQL y Redis solo a localhost
# (ya configurado por defecto)

sudo ufw enable
```

## Paso 12: Monitoreo Básico

```bash
# Instalar htop, fail2ban
sudo apt install -y htop fail2ban

# Configurar fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Logs importantes
tail -f /var/www/backend-core/storage/logs/laravel.log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Comandos de Mantenimiento

```bash
# Actualizar código
cd /var/www/backend-core
sudo -u www-data git pull origin main
sudo -u www-data composer install --no-dev --optimize-autoloader
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan optimize

# Reiniciar servicios
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
sudo supervisorctl restart laravel-workers:*
sudo systemctl restart preconteo-ws

# Limpiar cache
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan route:clear
sudo -u www-data php artisan view:clear

# Verificar workers
sudo supervisorctl status
sudo php artisan queue:monitor redis:agregados,redis:imagenes,redis:notificaciones

# Logs de errores
sudo tail -f /var/www/backend-core/storage/logs/laravel.log
sudo tail -f /var/www/backend-core/storage/logs/worker-agregados.log
```

## Troubleshooting

### Error 502 Bad Gateway
```bash
# Verificar PHP-FPM
sudo systemctl status php8.2-fpm
sudo tail -f /var/log/php8.2-fpm.log
```

### WebSocket no conecta
```bash
# Verificar servicio NestJS
sudo systemctl status preconteo-ws
sudo journalctl -u preconteo-ws -f

# Verificar puerto
sudo netstat -tlnp | grep 3001
```

### Jobs no se procesan
```bash
# Verificar Redis
redis-cli ping

# Verificar workers
sudo supervisorctl status
sudo tail -f /var/www/backend-core/storage/logs/worker-*.log

# Reintentar failed jobs
sudo -u www-data php artisan queue:retry all
```

### Problemas de permisos
```bash
sudo chown -R www-data:www-data /var/www/backend-core
sudo chmod -R 775 /var/www/backend-core/storage
sudo chmod -R 775 /var/www/backend-core/bootstrap/cache
```

## Backup Automatizado

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-preconteo.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/preconteo"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
sudo -u postgres pg_dump preconteo > $BACKUP_DIR/db_$DATE.sql

# Backup archivos
sudo tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C /var/www backend-core/storage

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-preconteo.sh

# Agregar a crontab (diario a las 2 AM)
echo "0 2 * * * root /usr/local/bin/backup-preconteo.sh" | sudo tee -a /etc/crontab
```

## Checklist Post-Deployment

- [ ] API responde correctamente: `curl https://api.tudominio.com/api/preconteo/elecciones`
- [ ] WebSocket conecta: `wss://ws.tudominio.com/ws/preconteo`
- [ ] SSL válido: `https://api.tudominio.com`
- [ ] Jobs procesándose: `sudo supervisorctl status`
- [ ] Cache funcionando: `redis-cli monitor`
- [ ] Logs sin errores
- [ ] Backup configurado
- [ ] Firewall activo

## Soporte

En caso de problemas:

1. Revisar logs: `storage/logs/laravel.log`
2. Verificar servicios: `sudo systemctl status ...`
3. Revisar workers: `sudo supervisorctl status`
4. Contactar al equipo de desarrollo
