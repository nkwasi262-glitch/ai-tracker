# ============================================================================
# Stage 1: Dependencies, Automated Verification & Production Bundle Build
# ============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Accept optional Dokploy build-time environment variables
ARG VITE_APP_ENV=production
ARG VITE_APP_NAME="Ghana National AI Projects Registry & Monitoring System (GNAPRMS)"
ARG VITE_APP_VERSION=1.0.0
ARG VITE_API_BASE_URL=/api/v1

ENV VITE_APP_ENV=${VITE_APP_ENV} \
    VITE_APP_NAME=${VITE_APP_NAME} \
    VITE_APP_VERSION=${VITE_APP_VERSION} \
    VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy dependency manifests first to maximize Docker layer caching
COPY package.json package-lock.json ./

# Deterministic install from package-lock.json
RUN npm ci

# Copy application source and configuration
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

# Run automated RBAC & workflow verification tests and compile production bundle
RUN npm test && npm run build

# ============================================================================
# Stage 2: Production NGINX Runtime for Dokploy
# ============================================================================
FROM nginx:1.27-alpine AS production

LABEL org.opencontainers.image.title="GNAPRMS - Ghana National AI Projects Registry & Monitoring System" \
      org.opencontainers.image.description="Sovereign National AI Projects Registry & Monitoring System for NITA / MOCD Ghana" \
      org.opencontainers.image.version="1.0.0"

# Copy hardened NGINX configuration with SPA fallback, Gzip, caching, and /health endpoint
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port 80 (Dokploy / Traefik routes external HTTPS traffic to container port 80)
EXPOSE 80

# Built-in container healthcheck for Dokploy zero-downtime deployments
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
