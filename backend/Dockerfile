# Simplified Dockerfile for ModernAPI Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy only production projects (exclude tests for faster builds)
COPY ModernAPI.API/ ModernAPI.API/
COPY ModernAPI.Application/ ModernAPI.Application/
COPY ModernAPI.Domain/ ModernAPI.Domain/
COPY ModernAPI.Infrastructure/ ModernAPI.Infrastructure/

# Restore only main API project with retry logic (dependencies auto-included)
RUN dotnet restore ModernAPI.API/ModernAPI.API.csproj --verbosity minimal || \
    dotnet restore ModernAPI.API/ModernAPI.API.csproj --verbosity minimal --force || \
    dotnet restore ModernAPI.API/ModernAPI.API.csproj --verbosity minimal
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