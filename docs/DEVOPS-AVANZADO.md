# DevOps Avanzado - CI/CD, Monitoreo y Alertas

**Semanas 16-18** | Agosto-Septiembre 2026

---

## 🎯 Objetivos

1. **CI/CD Pipelines:** Automatización completa de build, test y deploy
2. **Monitoreo:** Observabilidad total con Prometheus + Grafana
3. **Alertas:** Notificaciones proactivas vía Slack y Email
4. **Logs:** Centralización con Loki
5. **Seguridad:** Scans automáticos de vulnerabilidades

---

## 🔄 CI/CD Pipelines

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub Actions                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Backend    │    │ WebSocket    │    │  Frontend    │
│   (Laravel)  │    │  (NestJS)    │    │   (React)    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
              ┌───────────────────────────┐
              │      Staging Server       │
              │   (api-staging, ws-stg)   │
              └───────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────┐
              │     Production Server     │
              │     (api, ws, app)        │
              └───────────────────────────┘
```

### Workflows Configurados

#### 1. Backend Core CI/CD
**Archivo:** `.github/workflows/backend-core.yml`

**Jobs:**
- **Test:** PHPUnit con PostgreSQL y Redis
- **Code Quality:** PHP_CodeSniffer + PHPStan
- **Build:** Optimización para producción
- **Deploy Staging:** Despliegue automático
- **Deploy Production:** Requiere aprobación manual

**Triggers:**
```yaml
on:
  push:
    branches: [main, develop]
    paths: ['backend-core/**']
  pull_request:
    branches: [main, develop]
```

#### 2. Backend Día D (WebSocket) CI/CD
**Archivo:** `.github/workflows/backend-dia-d.yml`

**Jobs:**
- **Test:** Jest con cobertura mínima 70%
- **Build:** Compilación TypeScript
- **Deploy:** Staging → Production

#### 3. Frontend Web CI/CD
**Archivo:** `.github/workflows/frontend-web.yml`

**Jobs:**
- **Test:** Vitest + Playwright E2E
- **Build:** Vite production build
- **Deploy:** Static files to Nginx

#### 4. Security & Quality
**Archivo:** `.github/workflows/security.yml`

**Jobs:**
- **Security Audit:** Trivy vulnerability scanner
- **Secret Detection:** TruffleHog
- **Dependency Check:** npm audit / composer audit
- **SonarCloud:** Code analysis
- **Lint:** All projects

### Secrets Requeridos

Configurar en GitHub → Settings → Secrets:

```
SSH_PRIVATE_KEY          # Clave SSH para deploy
STAGING_HOST             # IP servidor staging
STAGING_USER             # Usuario SSH staging
PRODUCTION_HOST          # IP servidor production
PRODUCTION_USER          # Usuario SSH production
SLACK_WEBHOOK            # URL webhook Slack
SONAR_TOKEN              # Token SonarCloud
SMTP_PASSWORD            # Password email alerts
```

### Estrategia de Deploy

#### Staging (Automático)
```
Push a main → Test → Build → Deploy Staging → Health Check
```

#### Production (Semi-Automático)
```
Deploy Staging exitoso → Aprobación manual → Deploy Production → Health Check
```

**Environments de GitHub:**
- `staging`: Deploy automático
- `production`: Requiere reviewer approval

---

## 📊 Monitoreo con Prometheus + Grafana

### Stack de Monitoreo

```
┌────────────────────────────────────────────────────────────┐
│                    Grafana (Visualización)                  │
│                    https://grafana.plataformaelectoral.com  │
└────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌────────────────────────────────────────────────────────────┐
│  Prometheus (Metrics)  │  Loki (Logs)  │  Alertmanager     │
│  Port: 9090            │  Port: 3100   │  Port: 9093       │
└────────────────────────────────────────────────────────────┘
                              ▲
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Exporters   │    │  Exporters   │    │  Exporters   │
│  Node        │    │  PostgreSQL  │    │  Redis       │
│  cAdvisor    │    │  Nginx       │    │  Blackbox    │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Componentes

#### 1. Prometheus
**Rol:** Colección y almacenamiento de métricas
- Retención: 15 días
- Scraping: Cada 15-30 segundos
- Almacenamiento: ~10GB para 15 días

**Endpoints monitoreados:**
- Backend Core: `/metrics`
- WebSocket Server: `/metrics`
- PostgreSQL: via postgres_exporter
- Redis: via redis_exporter
- Nginx: via nginx_exporter
- Sistema: via node_exporter
- Contenedores: via cAdvisor

#### 2. Grafana
**Rol:** Visualización y dashboards
- URL: https://grafana.plataformaelectoral.com
- Auth: Admin + OAuth (opcional)
- Dashboards: Preconfigurados

**Dashboards incluidos:**
1. **Overview:** Estado general de todos los servicios
2. **API Performance:** Requests, latencia, errores
3. **Database:** PostgreSQL queries, conexiones, rendimiento
4. **Infrastructure:** CPU, memoria, disco, red
5. **WebSocket:** Conexiones activas, mensajes/segundo

#### 3. Alertmanager
**Rol:** Enrutamiento de alertas
- Agrupación de alertas similares
- Enrutamiento por severidad y equipo
- Silenciamiento de alertas conocidas

**Canales de notificación:**
- Slack: #alerts, #critical-alerts
- Email: devops@, backend@, database@
- Webhook: Integraciones adicionales

#### 4. Loki
**Rol:** Agregación de logs
- Centraliza logs de todos los servicios
- Query language: LogQL
- Integrado con Grafana

### Métricas Clave

#### Application Metrics
```yaml
# Request rate
rate(http_requests_total[5m])

# Error rate  
rate(http_requests_total{status=~"5.."}[5m])

# Response time (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Active connections
websocket_connections_total
```

#### Infrastructure Metrics
```yaml
# CPU usage
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk usage
(node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1

# Load average
node_load1
```

#### Database Metrics
```yaml
# Connection count
pg_stat_activity_count

# Query duration
pg_stat_statements_mean_time

# Cache hit ratio
pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)

# Replication lag
pg_replication_lag
```

---

## 🚨 Alertas

### Reglas de Alertas

**Archivo:** `monitoring/prometheus/alert-rules.yml`

#### Critical Alerts (Respuesta inmediata)

```yaml
- alert: BackendCoreDown
  expr: up{job="backend-core"} == 0
  for: 1m
  severity: critical
  
- alert: PostgreSQLDown
  expr: up{job="postgres"} == 0
  for: 1m
  severity: critical
  
- alert: WebSocketServerDown
  expr: up{job="backend-dia-d"} == 0
  for: 1m
  severity: critical
```

#### Warning Alerts (Atención en 1 hora)

```yaml
- alert: HighCPUUsage
  expr: cpu_usage > 85%
  for: 5m
  severity: warning
  
- alert: HighMemoryUsage
  expr: memory_usage > 85%
  for: 5m
  severity: warning
  
- alert: BackendCoreHighErrorRate
  expr: error_rate > 5%
  for: 2m
  severity: warning
```

#### Info Alerts (Monitoreo)

```yaml
- alert: HighRequestRate
  expr: request_rate > 1000/s
  severity: info
  
- alert: CertificateExpiringSoon
  expr: ssl_cert_expiry < 30 days
  severity: warning
```

### Enrutamiento de Alertas

```
┌─────────────────────────────────────────────────────────────┐
│                        Alertmanager                         │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Critical   │  │   Warning    │  │     Info     │
    │              │  │              │  │              │
    │  #critical   │  │   #alerts    │  │   #alerts    │
    │   Email      │  │   Email      │  │   Slack      │
    │   PagerDuty  │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
```

### Configuración de Notificaciones

**Slack:**
```yaml
slack_configs:
  - channel: '#critical-alerts'
    title: '🔴 CRITICAL: {{ .Annotations.summary }}'
    text: '{{ .Annotations.description }}'
```

**Email:**
```yaml
email_configs:
  - to: 'devops@plataformaelectoral.com'
    subject: 'Alert: {{ .GroupLabels.alertname }}'
```

---

## 📝 Logs Centralizados

### Arquitectura Loki

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Aplicación  │────▶│   Promtail   │────▶│     Loki     │
│   (Logs)     │     │  (Agente)    │     │  (Storage)   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │    Grafana   │
                                          │   (Queries)  │
                                          └──────────────┘
```

### Configuración

**Promtail:** Recolecta logs de:
- `/var/log/syslog`
- `/var/log/nginx/*.log`
- `/var/www/*/storage/logs/*.log`
- Docker containers

**Labels importantes:**
- `job`: Aplicación (backend, websocket, nginx)
- `level`: Nivel de log (debug, info, warning, error)
- `instance`: Servidor

### Queries Útiles (LogQL)

```bash
# Buscar errores
{job="backend"} |= "ERROR"

# Errores de base de datos
{job="backend"} |= "SQLSTATE"

# Requests lentos
{job="nginx"} |~ "(POST|PUT) /api/" 
  | pattern `<ip> - - [<timestamp>] "<method> <uri> <protocol>" <status> <bytes> "<referer>" "<user_agent>" <duration>`
  | duration > 2

# Authentication failures
{job="backend"} |= "Unauthorized" or {job="backend"} |= "Invalid credentials"

# Traceo de request específico
{job="backend"} |= "request_id=abc123"
```

---

## 🚀 Deploy del Stack de Monitoreo

### 1. Preparación

```bash
# Clonar repo
cd /opt
sudo git clone https://github.com/plataformaelectoral/preconteo.git monitoring

# Crear directorios de datos
sudo mkdir -p /opt/monitoring/data/{prometheus,grafana,alertmanager,loki}

# Configurar permisos
sudo chown -R 472:472 /opt/monitoring/data/grafana
sudo chown -R 65534:65534 /opt/monitoring/data/prometheus
```

### 2. Variables de Entorno

```bash
# Crear archivo .env
cat > /opt/monitoring/.env << 'EOF'
# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=SecureP@ssw0rd123!

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# Email
SMTP_PASSWORD=email_app_password

# Database
DB_PASSWORD=db_monitoring_password
REDIS_PASSWORD=redis_password
EOF

sudo chmod 600 /opt/monitoring/.env
```

### 3. Iniciar Stack

```bash
cd /opt/monitoring
sudo docker-compose up -d

# Verificar estado
sudo docker-compose ps
sudo docker-compose logs -f
```

### 4. Configurar Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/grafana
server {
    listen 443 ssl http2;
    server_name grafana.plataformaelectoral.com;

    ssl_certificate /etc/letsencrypt/live/grafana.plataformaelectoral.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grafana.plataformaelectoral.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Prometheus (protegido con auth básico)
server {
    listen 443 ssl http2;
    server_name prometheus.plataformaelectoral.com;

    auth_basic "Prometheus";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://localhost:9090;
    }
}
```

### 5. SSL Certificates

```bash
sudo certbot --nginx -d grafana.plataformaelectoral.com
sudo certbot --nginx -d prometheus.plataformaelectoral.com
```

---

## 📈 Dashboards de Grafana

### Dashboard 1: Overview
**URL:** https://grafana.plataformaelectoral.com/d/preconteo-overview

**Paneles:**
- Service Status (API, WebSocket, DB, Cache)
- Request Rate
- Response Time (p50, p95, p99)
- Error Rate
- CPU Usage
- Memory Usage

### Dashboard 2: API Performance
**URL:** https://grafana.plataformaelectoral.com/d/preconteo-api

**Paneles:**
- Requests per second by endpoint
- Response time percentiles
- Error rate by status code
- Top slowest endpoints
- Database query performance

### Dashboard 3: Infrastructure
**URL:** https://grafana.plataformaelectoral.com/d/preconteo-infra

**Paneles:**
- CPU usage by core
- Memory usage breakdown
- Disk I/O
- Network traffic
- Load average
- Process count

### Dashboard 4: WebSocket
**URL:** https://grafana.plataformaelectoral.com/d/preconteo-websocket

**Paneles:**
- Active connections
- Messages per second
- Connection duration
- Errors and disconnects
- Broadcast latency

---

## 🔧 Operación y Mantenimiento

### Tareas Diarias

```bash
# Verificar estado de servicios
sudo docker-compose ps

# Revisar logs
sudo docker-compose logs --tail=100

# Espacio en disco
df -h
sudo docker system df

# Limpiar logs antiguos
sudo docker system prune -f
```

### Tareas Semanales

```bash
# Backup de dashboards
sudo tar -czf grafana-backup-$(date +%Y%m%d).tar.gz /opt/monitoring/data/grafana

# Revisar alertas
# En Grafana: Alerting → Alert Rules

# Análisis de rendimiento
# Revisar tendencias de CPU, memoria, requests
```

### Troubleshooting

**Prometheus no scrapea:**
```bash
# Verificar targets
curl http://localhost:9090/api/v1/targets

# Verificar configuración
sudo docker-compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

**Grafana no muestra datos:**
```bash
# Verificar datasources
# En Grafana: Configuration → Data Sources → Test

# Verificar conexión a Prometheus
sudo docker-compose exec grafana wget -O- http://prometheus:9090/api/v1/status/targets
```

**Alertmanager no envía notificaciones:**
```bash
# Verificar configuración
sudo docker-compose logs alertmanager

# Probar webhook
curl -X POST http://localhost:9093/api/v1/alerts -d '[{"labels":{"alertname":"Test"}}]'
```

---

## 📊 Métricas de Éxito

### CI/CD
- ✅ Tiempo de build: < 10 minutos
- ✅ Tiempo de deploy: < 5 minutos
- ✅ Cobertura de tests: > 75%
- ✅ Deploys exitosos: > 99%

### Monitoreo
- ✅ Métricas recolectadas: 100% de servicios
- ✅ Retención de métricas: 15 días
- ✅ Dashboards actualizados: Siempre
- ✅ Alertas configuradas: 20+ reglas

### Alertas
- ✅ MTTR (Mean Time To Response): < 5 minutos
- ✅ Falsos positivos: < 10%
- ✅ Alertas críticas: Notificación inmediata
- ✅ Alertas resueltas: Acknowledge en < 1 hora

---

## 📚 Recursos Adicionales

### Documentación
- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/
- Loki: https://grafana.com/docs/loki/
- GitHub Actions: https://docs.github.com/en/actions

### Dashboards de la Comunidad
- Node Exporter: https://grafana.com/dashboards/1860
- PostgreSQL: https://grafana.com/dashboards/9628
- Redis: https://grafana.com/dashboards/763
- Nginx: https://grafana.com/dashboards/9614

---

## ✅ Checklist de Implementación

### CI/CD
- [ ] Workflows creados en `.github/workflows/`
- [ ] Secrets configurados en GitHub
- [ ] Environments configurados (staging/production)
- [ ] Tests automatizados pasando
- [ ] Deploy a staging funcionando
- [ ] Aprobación manual configurada para producción

### Monitoreo
- [ ] Docker Compose de monitoreo funcionando
- [ ] Prometheus recolectando métricas
- [ ] Grafana accesible vía HTTPS
- [ ] Dashboards importados
- [ ] Datasources configurados

### Alertas
- [ ] Alertmanager configurado
- [ ] Reglas de alertas creadas
- [ ] Slack webhook funcionando
- [ ] Email SMTP configurado
- [ ] Rutas de enrutamiento probadas

### Logs
- [ ] Loki funcionando
- [ ] Promtail recolectando logs
- [ ] Logs visibles en Grafana
- [ ] Queries de LogQL documentadas

---

**Documento creado:** Septiembre 2026  
**Versión:** 1.0  
**Mantenedor:** DevOps Team
