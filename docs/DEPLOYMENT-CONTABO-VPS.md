# 🚀 Guía de Deployment - VPS Contabo
## Plataforma Electoral Colombia

**Proveedor:** Contabo VPS  
**Sistema Operativo:** Ubuntu 22.04 LTS  
**Fecha:** Mayo 2026  
**Estado:** En preparación

---

## 📋 Especificaciones Recomendadas VPS

### Plan VPS Contabo:
| Especificación | Valor |
|----------------|-------|
| **CPU** | 4 vCPU Cores |
| **RAM** | 8 GB |
| **Storage** | 200 GB SSD |
| **Bandwidth** | 32 TB/mes |
| **Precio** | ~$15-20 USD/mes |

### Alternativa (Mayor capacidad):
| Especificación | Valor |
|----------------|-------|
| **CPU** | 6 vCPU Cores |
| **RAM** | 16 GB |
| **Storage** | 400 GB NVMe |
| **Precio** | ~$30-40 USD/mes |

---

## 🔧 Stack Tecnológico en VPS

Todo se instala en el mismo servidor (monolito optimizado):

```
VPS Contabo
├── Nginx (Reverse Proxy + Static Files)
├── PHP 8.2-FPM (Laravel Backend)
├── Node.js 20 (NestJS Backend Día D)
├── PostgreSQL 15 + PostGIS (Base de datos)
├── Redis 7 (Cache + Queues + Sessions)
├── Supervisor (Queue Workers)
└── Storage local (o MinIO para S3-compatible)
```

---

## 📦 Paso a Paso - Instalación

### Paso 1: Preparar VPS

```bash
# Conectar por SSH
ssh root@IP_DEL_VPS

# Actualizar sistema
apt update && apt upgrade -y

# Instalar herramientas básicas
apt install -y curl wget git vim htop unzip software-properties-common

# Configurar timezone
 timedatectl set-timezone America/Bogota
```

### Paso 2: Instalar PostgreSQL + PostGIS

```bash
# Instalar PostgreSQL 15
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-15 postgresql-15-postgis-3 postgresql-client-15

# Habilitar servicio
systemctl enable postgresql
systemctl start postgresql

# Configurar PostGIS
sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS postgis;"
sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;"

# Crear usuario y BD
sudo -u postgres psql -c "CREATE USER electoral WITH PASSWORD 'password_seguro_123';"
sudo -u postgres psql -c "CREATE DATABASE plataforma_electoral OWNER electoral;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE plataforma_electoral TO electoral;"

# Configurar acceso remoto (opcional, con cuidado)
vim /etc/postgresql/15/main/postgresql.conf
# Descomentar y cambiar: listen_addresses = '*'

vim /etc/postgresql/15/main/pg_hba.conf
# Agregar: host all all 0.0.0.0/0 md5 (solo si es necesario)

systemctl restart postgresql
```

### Paso 3: Instalar Redis

```bash
apt install -y redis-server

# Configurar para producción
vim /etc/redis/redis.conf

# Cambiar:
# supervised systemd
# maxmemory 256mb
# maxmemory-policy allkeys-lru

systemctl enable redis-server
systemctl restart redis-server

# Verificar
redis-cli ping  # Debe responder PONG
```

### Paso 4: Instalar PHP 8.2

```bash
# Agregar repositorio PHP
add-apt-repository ppa:ondrej/php -y
apt update

# Instalar PHP y extensiones necesarias
apt install -y php8.2-fpm php8.2-cli php8.2-pgsql php8.2-redis \
    php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-bcmath \
    php8.2-gd php8.2-intl

# Instalar Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Configurar PHP-FPM para producción
vim /etc/php/8.2/fpm/php.ini

# Cambiar:
# memory_limit = 512M
# upload_max_filesize = 10M
# post_max_size = 10M
# max_execution_time = 60
# max_input_vars = 3000

systemctl restart php8.2-fpm
```

### Paso 5: Instalar Node.js 20

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar
node -v  # v20.x.x
npm -v   # 10.x.x

# Instalar PM2 para procesos Node.js
npm install -g pm2
```

### Paso 6: Instalar Nginx

```bash
apt install -y nginx

# Configurar firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

### Paso 7: Configurar Directorios

```bash
# Crear usuario deploy
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# Crear estructura de directorios
mkdir -p /var/www/plataforma-electoral
mkdir -p /var/www/plataforma-electoral/backend-core
mkdir -p /var/www/plataforma-electoral/backend-diad
mkdir -p /var/www/plataforma-electoral/frontend-web
mkdir -p /var/www/plataforma-electoral/storage/actas
mkdir -p /var/log/plataforma-electoral

# Permisos
chown -R deploy:deploy /var/www/plataforma-electoral
chown -R deploy:deploy /var/log/plataforma-electoral
```

---

## 🚀 Deployment del Código

### Paso 8: Clonar Repositorio

```bash
# Como usuario deploy
su - deploy
cd /var/www/plataforma-electoral

# Clonar proyecto (ajustar según tu repo)
git clone https://github.com/tu-usuario/plataforma-electoral.git .
```

### Paso 9: Configurar Backend Core (Laravel)

```bash
cd /var/www/plataforma-electoral/backend-core

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Copiar configuración
cp .env.example .env

# Generar APP_KEY
php artisan key:generate

# Configurar .env
vim .env

# Cambiar:
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=https://tudominio.com
# DB_HOST=127.0.0.1
# DB_DATABASE=plataforma_electoral
# DB_USERNAME=electoral
# DB_PASSWORD=password_seguro_123
# REDIS_HOST=127.0.0.1
# QUEUE_CONNECTION=redis
# SESSION_DRIVER=redis

# Ejecutar migraciones
php artisan migrate --force

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Seeders iniciales (solo primera vez)
php artisan db:seed --force
```

### Paso 10: Configurar Backend Día D (NestJS)

```bash
cd /var/www/plataforma-electoral/backend-diad

# Instalar dependencias
npm ci --only=production

# Configurar .env
vim .env

# Cambiar:
# NODE_ENV=production
# PORT=3000
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=electoral
# DB_PASSWORD=password_seguro_123
# DB_NAME=plataforma_electoral
# REDIS_HOST=localhost
# REDIS_PORT=6379

# Build
npm run build
```

### Paso 11: Configurar Frontend Web

```bash
cd /var/www/plataforma-electoral/frontend-web

# Instalar dependencias
npm ci --only=production

# Configurar .env
vim .env

# VITE_API_URL=https://tudominio.com/api

# Build
npm run build

# Mover build a directorio public
mv dist /var/www/plataforma-electoral/public-web
```

---

## ⚙️ Configuración Nginx

### Paso 12: Configurar Nginx

```bash
# Crear configuración
sudo vim /etc/nginx/sites-available/plataforma-electoral
```

**Configuración:**

```nginx
# Upstreams
upstream backend_core {
    server unix:/var/run/php/php8.2-fpm.sock;
}

upstream backend_diad {
    server 127.0.0.1:3000;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Main Server
server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # SSL (usar Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Logs
    access_log /var/log/nginx/plataforma-access.log;
    error_log /var/log/nginx/plataforma-error.log;

    # Frontend Web (React build)
    location / {
        root /var/www/plataforma-electoral/public-web;
        try_files $uri $uri/ /index.html;
        
        # Cache estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend Core (Laravel API)
    location /api {
        alias /var/www/plataforma-electoral/backend-core/public;
        try_files $uri $uri/ @backend_core;
        
        location ~ \.php$ {
            fastcgi_pass backend_core;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
        }
    }
    
    location @backend_core {
        rewrite /api/(.*)$ /api/index.php?$1 last;
    }

    # Backend Día D (NestJS WebSocket + API)
    location /ws {
        proxy_pass http://backend_diad;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /diad {
        proxy_pass http://backend_diad;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage (imágenes de actas)
    location /storage {
        alias /var/www/plataforma-electoral/storage/app/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PHP handling para Laravel
    location ~ \.php$ {
        fastcgi_pass backend_core;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Seguridad
    location ~ /\. {
        deny all;
    }
    
    location ~ /(\.env|composer\.(json|lock)|package\.json)$ {
        deny all;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/plataforma-electoral /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 SSL con Let's Encrypt

### Paso 13: Configurar SSL

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d tudominio.com -d www.tudominio.com

# Auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## 🔄 Procesos con Supervisor

### Paso 14: Configurar Queue Workers

```bash
apt install -y supervisor

# Configurar workers Laravel
vim /etc/supervisor/conf.d/laravel-workers.conf
```

**Configuración:**

```ini
[program:laravel-workers]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/plataforma-electoral/backend-core/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
directory=/var/www/plataforma-electoral/backend-core
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=deploy
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/plataforma-electoral/workers.log
stopwaitsecs=3600
```

```bash
# Configurar Backend Día D con PM2
cd /var/www/plataforma-electoral/backend-diad

# Crear ecosystem file
vim ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'backend-diad',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/plataforma-electoral/diad-error.log',
    out_file: '/var/log/plataforma-electoral/diad-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

```bash
# Iniciar procesos
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-workers:*

# Iniciar backend Día D
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

---

## 📊 Monitoreo Básico

### Paso 15: Setup Monitoreo

```bash
# Instalar herramientas
apt install -y htop iotop

# Opcional: Netdata para monitoreo web
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Ver logs en tiempo real
tail -f /var/log/nginx/plataforma-error.log
tail -f /var/log/plataforma-electoral/workers.log
tail -f /var/log/plataforma-electoral/diad-error.log
```

---

## 🔄 Comandos Útiles

### Deployment Updates:

```bash
# Actualizar backend core
cd /var/www/plataforma-electoral/backend-core
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo supervisorctl restart laravel-workers:*

# Actualizar backend Día D
cd /var/www/plataforma-electoral/backend-diad
git pull origin main
npm ci --only=production
npm run build
pm2 restart backend-diad

# Actualizar frontend
cd /var/www/plataforma-electoral/frontend-web
git pull origin main
npm ci --only=production
npm run build
rm -rf /var/www/plataforma-electoral/public-web/*
cp -r dist/* /var/www/plataforma-electoral/public-web/
```

### Backups:

```bash
# Backup PostgreSQL
sudo -u postgres pg_dump plataforma_electoral > backup_$(date +%Y%m%d).sql

# Backup archivos
tar -czf storage_backup_$(date +%Y%m%d).tar.gz /var/www/plataforma-electoral/storage
```

### Troubleshooting:

```bash
# Ver estado servicios
systemctl status nginx
systemctl status php8.2-fpm
systemctl status postgresql
systemctl status redis-server
systemctl status supervisor
pm2 status

# Reiniciar servicios
sudo systemctl restart nginx php8.2-fpm postgresql redis-server supervisor
pm2 restart all

# Verificar puertos
netstat -tlnp | grep -E ':(80|443|3000|5432|6379)'
```

---

## 💰 Costos Estimados

### VPS Contabo (Recomendado):
- **VPS 4 vCPU / 8 GB RAM / 200 GB SSD:** ~$15-20 USD/mes
- **Ancho de banda:** Incluido 32 TB
- **Backup storage:** ~$5 USD/mes (externo)
- **Dominio:** ~$10-15 USD/año
- **SSL:** Gratis (Let's Encrypt)

**Total mensual:** ~$20-25 USD

### Comparación AWS vs Contabo:
| Servicio | AWS | Contabo |
|----------|-----|---------|
| **VPS/Servidor** | $110/mes | $20/mes |
| **Base de datos** | RDS $50/mes | Incluido |
| **Cache** | ElastiCache $12/mes | Incluido |
| **Storage** | S3 variable | Incluido |
| **Setup** | Complejo | Simple |
| **Escalado** | Automático | Manual |

**Ahorro:** ~$150/mes (85% más económico)

---

## ⚠️ Consideraciones Contabo vs AWS

### Ventajas Contabo:
✅ Mucho más económico  
✅ Recursos dedicados (no compartidos)  
✅ Simple de administrar  
✅ Sin sorpresas de facturación  

### Desventajas Contabo:
❌ Sin auto-scaling automático  
❌ Sin alta disponibilidad multi-AZ  
❌ Backups manuales o configurar script  
❌ Si falla el VPS, todo cae (single point of failure)  

### Recomendación:
Para elecciones territoriales con ~100-500 mesas, **Contabo es perfecto**.
Para elecciones nacionales con 10,000+ mesas, considerar AWS.

---

## 📞 Checklist Pre-Deploy

- [ ] VPS contratado y accesible
- [ ] Dominio configurado apuntando a IP del VPS
- [ ] PostgreSQL instalado y funcionando
- [ ] Redis instalado y funcionando
- [ ] PHP 8.2 instalado con extensiones
- [ ] Node.js 20 instalado
- [ ] Nginx configurado
- [ ] SSL configurado con Let's Encrypt
- [ ] Código clonado y dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Seeders de prueba ejecutados
- [ ] Supervisor configurado
- [ ] PM2 configurado
- [ ] Monitoreo básico funcionando
- [ ] Backups configurados
- [ ] Prueba de carga básica realizada

---

**Documento creado:** 7 Mayo 2026  
**Última actualización:** 7 Mayo 2026  
**VPS Target:** Contabo VPS 4vCPU/8GB  
**OS:** Ubuntu 22.04 LTS
