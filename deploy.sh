#!/bin/bash

# Deployment script for manggala.biz.id
# Usage: ./deploy.sh [ssh-user] [ssh-host]

set -e

SSH_USER=${1:-root}
SSH_HOST=${2:-manggala.biz.id}
APP_DIR="/var/www/voucher-spbu"
APP_NAME="voucher-spbu"

echo "🚀 Deploying $APP_NAME to $SSH_HOST..."

# Create .env.production if not exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found, creating..."
    cat > .env.production << EOF
DATABASE_URL=file:./data/spbu-voucher.db
NODE_ENV=production
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=https://manggala.biz.id
NEXT_PUBLIC_APP_URL=https://manggala.biz.id
EOF
fi

# Sync files to server
echo "📤 Syncing files to server..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '*.db' \
    --exclude '*.db-shm' \
    --exclude '*.db-wal' \
    --exclude '.data' \
    --exclude 'data' \
    ./ $SSH_USER@$SSH_HOST:$APP_DIR/

# Setup and deploy on remote server
echo "🔧 Building and starting on remote server..."
ssh $SSH_USER@$SSH_HOST << 'ENDSSH'
    set -e
    cd /var/www/voucher-spbu

    # Create data directory
    mkdir -p data

    # Stop existing container
    echo "🛑 Stopping existing container..."
    docker-compose down 2>/dev/null || true

    # Build and start
    echo "🔨 Building Docker image..."
    docker-compose build --no-cache

    echo "🚀 Starting container..."
    docker-compose up -d

    # Wait for health check
    echo "⏳ Waiting for application to be healthy..."
    sleep 10

    # Check logs
    echo "📋 Container logs:"
    docker-compose logs --tail=20

    echo "✅ Deployment complete!"
ENDSSH

echo "✨ Deployment finished!"
echo "🌐 https://manggala.biz.id"
echo "🔍 Check logs: ssh $SSH_USER@$SSH_HOST 'cd $APP_DIR && docker-compose logs -f'"
