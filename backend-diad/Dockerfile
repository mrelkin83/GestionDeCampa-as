FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Configurar directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN if [ -f package.json ]; then npm install; fi

# Copiar archivos del proyecto
COPY . .

# Build (si existe tsconfig)
RUN if [ -f tsconfig.json ]; then npm run build; fi

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
