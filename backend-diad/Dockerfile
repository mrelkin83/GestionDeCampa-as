# --- Etapa de build ---
FROM node:20-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa de producción ---
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init && \
    addgroup -S app && adduser -S app -G app

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

USER app

EXPOSE 3000

# dumb-init reenvía señales (SIGTERM) correctamente para un shutdown limpio
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
