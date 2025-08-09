#!/bin/bash

# ModernAPI Kubernetes Deployment Script
# This script deploys ModernAPI to a Kubernetes cluster

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
K8S_DIR="${PROJECT_ROOT}/k8s"
NAMESPACE="modernapi"

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

# Check if kubectl is available and configured
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "kubectl cannot connect to Kubernetes cluster"
        log_info "Please configure kubectl to connect to your cluster"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
    kubectl cluster-info --context=$(kubectl config current-context)
}

# Validate Kubernetes manifests
validate_manifests() {
    log_info "Validating Kubernetes manifests..."
    
    local manifests=(
        "$K8S_DIR/namespace.yml"
        "$K8S_DIR/configmap.yml"
        "$K8S_DIR/secret.yml"
        "$K8S_DIR/postgres.yml"
        "$K8S_DIR/modernapi.yml"
        "$K8S_DIR/monitoring.yml"
    )
    
    for manifest in "${manifests[@]}"; do
        if [ ! -f "$manifest" ]; then
            log_error "Manifest not found: $manifest"
            exit 1
        fi
        
        # Validate YAML syntax
        if ! kubectl apply --dry-run=client -f "$manifest" &> /dev/null; then
            log_error "Invalid manifest: $manifest"
            kubectl apply --dry-run=client -f "$manifest"
            exit 1
        fi
    done
    
    log_info "Manifests validation passed"
}

# Create or update secrets
update_secrets() {
    log_info "Updating secrets..."
    log_warn "Please ensure you have updated the secrets in k8s/secret.yml with production values"
    
    read -p "Have you updated the secrets with production values? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Please update the secrets in k8s/secret.yml before deploying"
        exit 1
    fi
    
    kubectl apply -f "$K8S_DIR/secret.yml"
    log_info "Secrets updated"
}

# Deploy the application
deploy() {
    log_info "Deploying ModernAPI to Kubernetes..."
    
    # Apply manifests in order
    kubectl apply -f "$K8S_DIR/namespace.yml"
    kubectl apply -f "$K8S_DIR/configmap.yml"
    update_secrets
    kubectl apply -f "$K8S_DIR/postgres.yml"
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgres -n $NAMESPACE --timeout=300s
    
    # Deploy the application
    kubectl apply -f "$K8S_DIR/modernapi.yml"
    kubectl apply -f "$K8S_DIR/monitoring.yml"
    
    log_info "Deployment completed"
}

# Check deployment status
check_status() {
    log_info "Checking deployment status..."
    
    echo "Namespace: $NAMESPACE"
    kubectl get all -n $NAMESPACE
    
    echo ""
    echo "Pod Status:"
    kubectl get pods -n $NAMESPACE -o wide
    
    echo ""
    echo "Service Status:"
    kubectl get services -n $NAMESPACE
    
    echo ""
    echo "Ingress Status:"
    kubectl get ingress -n $NAMESPACE
}

# Wait for rollout to complete
wait_for_rollout() {
    log_info "Waiting for rollout to complete..."
    
    kubectl rollout status deployment/postgres -n $NAMESPACE
    kubectl rollout status deployment/modernapi -n $NAMESPACE
    kubectl rollout status deployment/prometheus -n $NAMESPACE
    kubectl rollout status deployment/grafana -n $NAMESPACE
    
    log_info "Rollout completed successfully"
}

# Show application info
show_app_info() {
    log_info "Application Information:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Get ingress information
    local api_host=$(kubectl get ingress modernapi -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "Not configured")
    
    echo "🚀 ModernAPI:      https://$api_host"
    echo "📊 Grafana:       Port-forward: kubectl port-forward svc/grafana 3000:3000 -n $NAMESPACE"
    echo "📈 Prometheus:    Port-forward: kubectl port-forward svc/prometheus 9090:9090 -n $NAMESPACE"
    echo ""
    echo "Useful Commands:"
    echo "  View logs:      kubectl logs -f deployment/modernapi -n $NAMESPACE"
    echo "  Get pods:       kubectl get pods -n $NAMESPACE"
    echo "  Describe pod:   kubectl describe pod <pod-name> -n $NAMESPACE"
    echo "  Port forward:   kubectl port-forward svc/modernapi 8080:80 -n $NAMESPACE"
    echo "  Scale:          kubectl scale deployment modernapi --replicas=5 -n $NAMESPACE"
}

# Update deployment
update() {
    log_info "Updating deployment..."
    
    # Apply all manifests
    kubectl apply -f "$K8S_DIR/"
    
    # Restart deployments to pick up new images
    kubectl rollout restart deployment/modernapi -n $NAMESPACE
    
    wait_for_rollout
    log_info "Update completed"
}

# Scale deployment
scale_deployment() {
    local replicas=${1:-3}
    
    log_info "Scaling ModernAPI to $replicas replicas..."
    
    kubectl scale deployment modernapi --replicas=$replicas -n $NAMESPACE
    kubectl rollout status deployment/modernapi -n $NAMESPACE
    
    log_info "Scaling completed"
}

# Create backup
backup() {
    log_info "Creating database backup..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="modernapi_backup_$timestamp.sql"
    
    # Create a temporary pod for backup
    kubectl run postgres-backup-$timestamp \
        --image=postgres:16-alpine \
        --rm -i --restart=Never \
        --env="PGPASSWORD=$(kubectl get secret modernapi-secrets -n $NAMESPACE -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d)" \
        --command -- pg_dump \
        -h postgres \
        -U "$(kubectl get secret modernapi-secrets -n $NAMESPACE -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)" \
        "$(kubectl get secret modernapi-secrets -n $NAMESPACE -o jsonpath='{.data.POSTGRES_DB}' | base64 -d)" > "$backup_file"
    
    log_info "Backup created: $backup_file"
}

# Show logs
show_logs() {
    local component=${1:-modernapi}
    local follow=${2:-false}
    
    if [ "$follow" = "true" ]; then
        kubectl logs -f deployment/$component -n $NAMESPACE
    else
        kubectl logs deployment/$component -n $NAMESPACE --tail=100
    fi
}

# Delete deployment
delete_deployment() {
    log_warn "This will delete the entire ModernAPI deployment including data!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        exit 0
    fi
    
    log_info "Deleting deployment..."
    
    kubectl delete -f "$K8S_DIR/" --ignore-not-found=true
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    log_info "Deployment deleted"
}

# Show usage
show_usage() {
    echo "ModernAPI Kubernetes Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [ARGS]"
    echo ""
    echo "Options:"
    echo "  --deploy, -d      Deploy the application (default)"
    echo "  --update, -u      Update existing deployment"
    echo "  --status, -s      Show deployment status"
    echo "  --scale           Scale deployment (usage: --scale 5)"
    echo "  --backup, -b      Create database backup"
    echo "  --logs, -l        Show logs (usage: --logs [component] [follow])"
    echo "  --delete          Delete entire deployment"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                Deploy to Kubernetes"
    echo "  $0 --update       Update existing deployment"
    echo "  $0 --scale 5      Scale to 5 replicas"
    echo "  $0 --logs modernapi true  Follow ModernAPI logs"
    echo "  $0 --backup       Create database backup"
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
        --status|-s)
            action="status"
            ;;
        --scale)
            action="scale"
            shift
            scale_deployment "$@"
            exit 0
            ;;
        --backup|-b)
            action="backup"
            ;;
        --logs|-l)
            action="logs"
            shift
            show_logs "$@"
            exit 0
            ;;
        --delete)
            action="delete"
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
            validate_manifests
            deploy
            wait_for_rollout
            check_status
            show_app_info
            ;;
        update)
            check_prerequisites
            validate_manifests
            update
            check_status
            show_app_info
            ;;
        status)
            check_prerequisites
            check_status
            show_app_info
            ;;
        backup)
            check_prerequisites
            backup
            ;;
        delete)
            check_prerequisites
            delete_deployment
            ;;
    esac
}

# Run main function
main "$@"