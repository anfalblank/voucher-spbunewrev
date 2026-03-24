# Deployment Guide - manggala.biz.id

## Prerequisites

1. Server with:
   - SSH access
   - Docker and Docker Compose installed
   - Nginx installed
   - At least 1GB RAM, 10GB disk

2. Domain pointing to server IP

## Quick Deploy

```bash
# Deploy from local machine
./deploy.sh root manggala.biz.id

# Or with custom SSH user
./deploy.sh username manggala.biz.id
```

## Manual Deployment

### 1. Prepare Server

```bash
# SSH to server
ssh root@manggala.biz.id

# Install Docker
curl -fsSL https://get.docker.com | sh
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /var/www/voucher-spbu/data
```

### 2. Sync Files

```bash
# From local machine
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    ./ root@manggala.biz.id:/var/www/voucher-spbu/
```

### 3. Configure Environment

```bash
# On server
cd /var/www/voucher-spbu

# Generate secret
openssl rand -base64 32

# Edit .env.production
nano .env.production
```

### 4. Start Application

```bash
cd /var/www/voucher-spbu
docker-compose up -d --build
```

### 5. Setup Nginx

```bash
# Copy nginx config
cp nginx.conf /etc/nginx/sites-available/voucher-spbu

# Enable site
ln -s /etc/nginx/sites-available/voucher-spbu /etc/nginx/sites-enabled/

# Get SSL certificate
apt install certbot python3-certbot-nginx
certbot --nginx -d manggala.biz.id

# Test and reload
nginx -t && systemctl reload nginx
```

## Management Commands

```bash
# View logs
ssh root@manggala.biz.id 'cd /var/www/voucher-spbu && docker-compose logs -f'

# Restart app
ssh root@manggala.biz.id 'cd /var/www/voucher-spbu && docker-compose restart'

# Stop app
ssh root@manggala.biz.id 'cd /var/www/voucher-spbu && docker-compose down'

# Update app
./deploy.sh root manggala.biz.id

# Database backup
ssh root@manggala.biz.id 'cd /var/www/voucher-spbu && cp data/spbu-voucher.db data/backup-$(date +%Y%m%d).db'
```

## Environment Variables

Edit `.env.production`:

```bash
DATABASE_URL=file:./data/spbu-voucher.db
NODE_ENV=production
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=https://manggala.biz.id
NEXT_PUBLIC_APP_URL=https://manggala.biz.id
```

## Troubleshooting

### Application not starting
```bash
docker-compose logs --tail=100
```

### Database locked
```bash
docker-compose restart
```

### Port 3000 already in use
```bash
docker ps
docker stop <container-id>
```

### Nginx 502 Bad Gateway
- Check if Docker container is running: `docker ps`
- Check if port 3000 is listening: `netstat -tlnp | grep 3000`
- Check nginx error logs: `tail -f /var/log/nginx/error.log`

## Monitoring

### Health Check
```bash
curl https://manggala.biz.id/api/health
```

### Container Stats
```bash
ssh root@manggala.biz.id 'docker stats'
```

### Disk Usage
```bash
ssh root@manggala.biz.id 'df -h'
```
