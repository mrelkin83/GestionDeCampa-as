FROM php:8.4-fpm-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev \
    libzip-dev

# Instalar extensiones PHP
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Instalar Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www

# Copiar archivos del proyecto
COPY . .

# Crear directorios necesarios
RUN mkdir -p /var/www/bootstrap/cache /var/www/storage/framework/{sessions,views,cache}

# Instalar dependencias (si existen)
RUN if [ -f composer.json ]; then composer install --no-interaction --no-dev --prefer-dist; fi

# Enlace público de storage (equivalente a `php artisan storage:link`,
# hecho con ln -sf directo para no depender de que Laravel pueda arrancar
# en tiempo de build, ej. sin APP_KEY/.env todavía). Sin esto,
# ProcesarImagenActaJob guarda la evidencia fotográfica de cada acta y
# construye su imagen_url apuntando a /storage/actas/..., pero esa ruta
# nunca es servida -404 siempre- porque public/storage nunca llega a
# existir en una imagen construida desde cero (a diferencia del
# docker-compose de desarrollo, que monta todo el repo con bind mount
# y por eso no lo revelaba).
RUN ln -sf /var/www/storage/app/public /var/www/public/storage

# NOTA DE DESPLIEGUE: este repo solo define docker-compose.yml de desarrollo
# (bind mount ./backend-core:/var/www -> storage/ persiste en el host). Un
# despliegue real que use esta imagen "as-is" (sin ese bind mount) debe
# montar un volumen persistente en /var/www/storage, o las actas/fotos
# escritas en runtime se pierden al recrear el contenedor.

# Permisos
RUN chown -R www-data:www-data /var/www

USER www-data

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
