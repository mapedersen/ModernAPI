# Simplified Dockerfile for ModernAPI Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy entire source first (simpler approach)
COPY . .

# Restore with retry logic and build
RUN dotnet restore --verbosity minimal --configfile NuGet.config || \
    dotnet restore --verbosity minimal --force || \
    dotnet restore --verbosity minimal
RUN dotnet publish ModernAPI.API/ModernAPI.API.csproj -c Release -o /app/publish --no-restore

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy published app
COPY --from=build /app/publish .

# Configure ports
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "ModernAPI.API.dll"]