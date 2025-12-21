# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept Vite build args so VITE_* vars are embedded at build time
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}

# Install dependencies
COPY frontend/package*.json frontend/package-lock.json ./
RUN npm ci

# Copy sources and build
COPY frontend/ ./
RUN npm run build

# Production image - serve built assets with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (will map to host 5173 in docker-compose to match dev origin)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
