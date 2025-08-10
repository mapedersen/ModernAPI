# Production-ready Dockerfile for ModernAPI Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy csproj files and restore dependencies (better layer caching)
COPY ["ModernAPI.API/ModernAPI.API.csproj", "ModernAPI.API/"]
COPY ["ModernAPI.Application/ModernAPI.Application.csproj", "ModernAPI.Application/"]
COPY ["ModernAPI.Domain/ModernAPI.Domain.csproj", "ModernAPI.Domain/"]
COPY ["ModernAPI.Infrastructure/ModernAPI.Infrastructure.csproj", "ModernAPI.Infrastructure/"]
RUN dotnet restore "ModernAPI.API/ModernAPI.API.csproj" --verbosity normal

# Copy source code and build
COPY . .
RUN dotnet publish ModernAPI.API/ModernAPI.API.csproj -c Release -o /app/publish --no-restore

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S modernapi && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G modernapi modernapi

# Install curl for health checks (Alpine uses apk)
RUN apk add --no-cache curl

# Copy published app with correct ownership
COPY --from=build --chown=modernapi:modernapi /app/publish .

# Switch to non-root user
USER modernapi

# Configure ports
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "ModernAPI.API.dll"]