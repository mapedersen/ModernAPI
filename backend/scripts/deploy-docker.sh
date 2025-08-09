#!/bin/bash

# ModernAPI Docker Production Deployment Script
# This script deploys ModernAPI using Docker Compose in production

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.production"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.production.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are available
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Validate environment configuration
validate_environment() {
    log_info "Validating environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Please copy .env.example to .env.production and configure it"
        exit 1
    fi
    
    # Check for required environment variables
    local required_vars=(
        "JWT_SECRET"
        "DATABASE_URL" 
        "POSTGRES_PASSWORD"
        "GRAFANA_ADMIN_PASSWORD"
        "DOMAIN"
        "ACME_EMAIL"
    )
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        log_info "Please configure these variables in $ENV_FILE"
        exit 1
    fi
    
    log_info "Environment configuration validated"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build the ModernAPI application image
    docker build \
        --target runtime \
        --tag modernapi:latest \
        --file Dockerfile \
        .
    
    log_info "Docker images built successfully"
}

# Deploy the application
deploy() {
    log_info "Deploying ModernAPI production environment..."
    
    cd "$PROJECT_ROOT"
    
    # Start the services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    log_info "Deployment completed"
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up (healthy)"; then
            log_info "Services are healthy"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Waiting for services to be healthy..."
        sleep 10
        ((attempt++))
    done
    
    log_warn "Health check timed out. Please check service logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    return 1
}

# Show deployment info
show_deployment_info() {
    log_info "Deployment Information:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Load domain from env file
    local domain=$(grep "^DOMAIN=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"')
    
    if [ -z "$domain" ]; then
        domain="localhost"
    fi
    
    echo "🚀 ModernAPI:      https://api.${domain}"
    echo "📊 Grafana:       https://dashboard.${domain} (admin/[password])"
    echo "📈 Prometheus:    https://metrics.${domain}"
    echo "📝 Seq Logs:      https://logs.${domain}"
    echo "🔄 Traefik:       https://traefik.${domain}"
    echo ""
    echo "Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "To view logs: docker-compose -f $COMPOSE_FILE logs -f [service_name]"
    echo "To stop: docker-compose -f $COMPOSE_FILE down"
    echo "To update: $0 --update"
}

# Update deployment
update_deployment() {
    log_info "Updating deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Rebuild application image
    build_images
    
    # Rolling update
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate
    
    log_info "Update completed"
}

# Backup data
backup_data() {
    log_info "Creating backup..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir="${PROJECT_ROOT}/backups/$timestamp"
    
    mkdir -p "$backup_dir"
    
    # Backup PostgreSQL database
    docker-compose -f "$COMPOSE_FILE" exec postgres pg_dumpall -U modernapi_user > "$backup_dir/postgres_backup.sql"
    
    # Backup persistent volumes
    docker run --rm \
        -v "$(docker-compose -f "$COMPOSE_FILE" config --volumes | grep postgres-data):/data:ro" \
        -v "$backup_dir:/backup" \
        alpine tar czf /backup/postgres_data.tar.gz -C /data .
    
    log_info "Backup created at: $backup_dir"
}

# Clean up
cleanup() {
    log_info "Cleaning up..."
    
    cd "$PROJECT_ROOT"
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful!)
    read -p "Remove unused volumes? This will delete data not used by running containers (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
    fi
    
    log_info "Cleanup completed"
}

# Show usage
show_usage() {
    echo "ModernAPI Docker Production Deployment"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --deploy, -d      Deploy the application (default)"
    echo "  --update, -u      Update existing deployment"
    echo "  --backup, -b      Create backup of data"
    echo "  --cleanup, -c     Clean up unused Docker resources"
    echo "  --health, -h      Check service health"
    echo "  --logs, -l        Show service logs"
    echo "  --stop            Stop all services"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                Deploy production environment"
    echo "  $0 --update       Update existing deployment"
    echo "  $0 --backup       Create backup before deployment"
}

# Show logs
show_logs() {
    local service=${1:-}
    
    cd "$PROJECT_ROOT"
    
    if [ -n "$service" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    else
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Stop services
stop_services() {
    log_info "Stopping services..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" down
    
    log_info "Services stopped"
}

# Main function
main() {
    local action="deploy"
    
    case "${1:-}" in
        --deploy|-d)
            action="deploy"
            ;;
        --update|-u)
            action="update"
            ;;
        --backup|-b)
            action="backup"
            ;;
        --cleanup|-c)
            action="cleanup"
            ;;
        --health|-h)
            action="health"
            ;;
        --logs|-l)
            action="logs"
            shift
            show_logs "$@"
            exit 0
            ;;
        --stop)
            action="stop"
            ;;
        --help)
            show_usage
            exit 0
            ;;
        "")
            action="deploy"
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
    
    case "$action" in
        deploy)
            check_prerequisites
            validate_environment
            build_images
            deploy
            check_health
            show_deployment_info
            ;;
        update)
            check_prerequisites
            validate_environment
            update_deployment
            check_health
            show_deployment_info
            ;;
        backup)
            backup_data
            ;;
        cleanup)
            cleanup
            ;;
        health)
            check_health
            ;;
        stop)
            stop_services
            ;;
    esac
}

# Run main function
main "$@"