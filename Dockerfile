# syntax=docker/dockerfile:1

# ---- Build stage --------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage -------------------------------------------------------
# Ansible101 is a fully static, browser-only app (no backend, no server-side
# secrets/env vars), so the runtime image just serves the built dist/ folder.
FROM nginxinc/nginx-unprivileged:alpine3.24-slim AS runtime

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:8080/"]
