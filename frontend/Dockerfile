# Pipeline-friendly Dockerfile that builds inside container
# Uses Node.js for build (better Rollup compatibility) then Bun for runtime
FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Install git (needed for some packages)
RUN apk add --no-cache git

# Copy package files (both package.json and lockfile)
COPY package.json bun.lockb* ./

# Install dependencies with npm (better native binary support)
RUN npm install

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_BASE_URL=https://modernapi.dev
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Verify build output
RUN echo "Verifying build output..." && \
    ls -la .output/ && \
    if [ ! -f ".output/server/index.mjs" ]; then \
        echo "ERROR: Server bundle not found!"; \
        exit 1; \
    fi && \
    echo "✅ Build verification passed"

# Production stage - runtime with Bun
FROM oven/bun:1.1.34-alpine AS runtime

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S tanstack && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G tanstack tanstack

# Install wget for health checks
RUN apk add --no-cache wget

# Copy built output from build stage
COPY --from=build --chown=tanstack:tanstack /app/.output .output
COPY --from=build --chown=tanstack:tanstack /app/package.json package.json

# Switch to non-root user
USER tanstack

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["bun", ".output/server/index.mjs"]