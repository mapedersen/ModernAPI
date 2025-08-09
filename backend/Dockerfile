# ModernAPI Production Dockerfile
# Multi-stage build for optimized production image

# =============================================================================
# Build Stage - Full .NET SDK for building the application
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first (for better layer caching)
COPY ModernAPI.sln ./
COPY global.json ./
COPY Directory.Build.props ./

# Copy all project files
COPY ModernAPI.API/ModernAPI.API.csproj ModernAPI.API/
COPY ModernAPI.Application/ModernAPI.Application.csproj ModernAPI.Application/
COPY ModernAPI.Domain/ModernAPI.Domain.csproj ModernAPI.Domain/
COPY ModernAPI.Infrastructure/ModernAPI.Infrastructure.csproj ModernAPI.Infrastructure/

# Copy test project files
COPY tests/ModernAPI.API.Tests/ModernAPI.API.Tests.csproj tests/ModernAPI.API.Tests/
COPY tests/ModernAPI.Application.Tests/ModernAPI.Application.Tests.csproj tests/ModernAPI.Application.Tests/
COPY tests/ModernAPI.Domain.Tests/ModernAPI.Domain.Tests.csproj tests/ModernAPI.Domain.Tests/
COPY tests/ModernAPI.Infrastructure.Tests/ModernAPI.Infrastructure.Tests.csproj tests/ModernAPI.Infrastructure.Tests/
COPY tests/ModernAPI.IntegrationTests/ModernAPI.IntegrationTests.csproj tests/ModernAPI.IntegrationTests/

# Restore dependencies (cached layer if project files haven't changed)
RUN dotnet restore ModernAPI.sln

# Copy all source code
COPY . .

# Build and test the application
RUN dotnet build ModernAPI.sln -c Release --no-restore
RUN dotnet test ModernAPI.sln -c Release --no-build --verbosity normal

# Publish the API project
RUN dotnet publish ModernAPI.API/ModernAPI.API.csproj \
    -c Release \
    --no-build \
    --output /app/publish \
    --self-contained false \
    --verbosity normal

# =============================================================================
# Runtime Stage - Minimal ASP.NET Runtime for production
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Create non-root user for security
RUN groupadd -r modernapi && useradd -r -g modernapi -u 1001 modernapi

# Set working directory
WORKDIR /app

# Install required packages for production
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy published application from build stage
COPY --from=build --chown=modernapi:modernapi /app/publish .

# Create directory for logs with proper permissions
RUN mkdir -p logs && chown -R modernapi:modernapi logs

# Switch to non-root user
USER modernapi

# Configure ASP.NET Core for production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_EnableDiagnostics=0

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set entrypoint
ENTRYPOINT ["dotnet", "ModernAPI.API.dll"]