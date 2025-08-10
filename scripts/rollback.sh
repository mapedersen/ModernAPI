#!/bin/bash
set -e

# ModernAPI Rollback Script
# Usage: ./rollback.sh [environment]
# Environment: production (default) or staging

ENVIRONMENT="${1:-production}"
PROJECT_DIR="/srv/modernapi"
COMPOSE_FILE="docker-compose.production.yml"

if [[ "$ENVIRONMENT" == "staging" ]]; then
    PROJECT_DIR="/srv/modernapi-staging"
    COMPOSE_FILE="docker-compose.staging.yml"
fi

echo "🔄 ModernAPI Rollback Script"
echo "Environment: $ENVIRONMENT"
echo "Project Directory: $PROJECT_DIR"

# Check if we're in the right directory
if [[ ! -d "$PROJECT_DIR" ]]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Check for rollback information
if [[ ! -f ".deployment-rollback-manual" ]]; then
    echo "❌ No rollback information found (.deployment-rollback-manual)"
    echo "ℹ️  This file is created during manual deployments"
    exit 1
fi

# Read rollback information
echo "📋 Reading rollback information..."
cat .deployment-rollback-manual

echo ""
read -p "🤔 Do you want to proceed with rollback? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

# Get rollback commit
ROLLBACK_COMMIT=$(head -n 1 .deployment-rollback-manual)

if [[ -z "$ROLLBACK_COMMIT" || "$ROLLBACK_COMMIT" == "unknown" ]]; then
    echo "❌ Invalid rollback commit: $ROLLBACK_COMMIT"
    exit 1
fi

echo "🔄 Rolling back to commit: $ROLLBACK_COMMIT"

# Save current state before rollback
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
echo "💾 Current commit (before rollback): $CURRENT_COMMIT"

# Perform rollback
echo "📌 Checking out rollback commit..."
if git checkout "$ROLLBACK_COMMIT"; then
    echo "✅ Git rollback successful"
else
    echo "❌ Git rollback failed"
    exit 1
fi

# Stop services
echo "⏹️ Stopping services..."
docker compose -f "$COMPOSE_FILE" down

# Start services with rolled back code
echo "🔨 Starting services with rolled back code..."
if docker compose -f "$COMPOSE_FILE" up -d --build; then
    echo "✅ Services started successfully"
else
    echo "❌ Service startup failed"
    exit 1
fi

# Health check
echo "🔍 Performing health check..."
HEALTH_URL="http://localhost:5001"
if [[ "$ENVIRONMENT" == "staging" ]]; then
    HEALTH_URL="http://localhost:5002"
fi

for i in {1..10}; do
    sleep 6
    if curl -f -s "$HEALTH_URL/health" > /dev/null 2>&1; then
        echo "✅ Health check passed"
        break
    elif [[ $i -eq 10 ]]; then
        echo "❌ Health check failed after 10 attempts"
        echo "⚠️ Rollback may have failed"
        exit 1
    else
        echo "⏳ Health check attempt $i/10..."
    fi
done

# Update deployment info
echo "📝 Updating deployment info..."
cat > .deployment-info << EOF
deployment_type=rollback
rollback_from_commit=$CURRENT_COMMIT
rollback_to_commit=$ROLLBACK_COMMIT
rollback_date=$(date -u --iso-8601=seconds)
rollback_environment=$ENVIRONMENT
EOF

# Clean up
echo "🧹 Cleaning up old images..."
docker image prune -f --filter "until=24h" || true

echo ""
echo "🎉 Rollback completed successfully!"
echo "📌 Rolled back to: $ROLLBACK_COMMIT"
echo "📅 Rollback time: $(date)"
echo ""
echo "ℹ️  To rollback again, you can:"
echo "   1. Use the GitHub Actions manual deployment workflow"
echo "   2. Run this script again (if further rollback info is available)"
echo "   3. Manually checkout any commit: git checkout <commit-sha>"