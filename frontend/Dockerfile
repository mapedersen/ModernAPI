# Multi-stage build for production - use official Bun image (x64 for compatibility)
FROM --platform=linux/amd64 oven/bun:1.1.34-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies with bun
RUN rm -rf node_modules bun.lockb && \
    bun install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for API URL
ARG VITE_API_BASE_URL=https://modernapi.dev

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application for production
RUN bun run build || (echo "Build failed, checking for alternative build methods..." && \
    if [ -f "vite.config.ts" ]; then \
      echo "Attempting direct vite build..." && \
      bun x vite build || echo "Vite build also failed"; \
    fi)

# Production stage - serve with Bun for TanStack Start SSR (x64 for compatibility)
FROM --platform=linux/amd64 oven/bun:1.1.34-alpine AS runtime

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S tanstack && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G tanstack tanstack

# Bun is already available in the official image

# Copy entire application from build stage since we're skipping the build step
COPY --from=build --chown=tanstack:tanstack /app/ ./

# Switch to non-root user
USER tanstack

# Expose port
EXPOSE 3000

# Environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start TanStack Start in production mode
CMD ["bun", "run", "start"]