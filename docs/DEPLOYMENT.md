# Deployment Guide

This guide covers different deployment scenarios for the Temp Mail system.

## Table of Contents
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Cloud Providers](#cloud-providers)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)

## Quick Start

For testing and development:

```bash
# Clone repository
git clone https://github.com/Leopixel1/temp-mail.git
cd temp-mail

# Copy environment file
cp .env.example .env

# Edit configuration
nano .env

# Run with Docker Compose
docker-compose up -d
```

Access at: http://localhost

## Production Deployment

### Prerequisites

1. **Server Requirements**
   - Ubuntu 22.04 LTS (recommended)
   - 2+ CPU cores
   - 2GB+ RAM
   - 20GB+ disk space
   - Static IP address

2. **Domain Setup**
   - Registered domain name
   - DNS management access
   - MX record capability

### Step-by-Step Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git ufw fail2ban

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 25/tcp   # SMTP
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

#### 2. Install Application

```bash
# Run installer
sudo bash installer/install.sh
```

Follow the prompts to configure:
- Domain name
- Admin credentials
- Retention policy
- User limits

#### 3. Configure DNS

Add these DNS records at your domain provider:

**For subdomain (mail.example.com):**
```
Type    Name    Value           TTL     Priority
A       mail    YOUR_SERVER_IP  300     -
MX      @       mail.example.com 300    10
```

**For root domain (example.com):**
```
Type    Name    Value           TTL     Priority
A       @       YOUR_SERVER_IP  300     -
MX      @       example.com     300     10
```

Verify DNS propagation:
```bash
# Check A record
dig mail.example.com

# Check MX record
dig MX example.com
```

#### 4. Setup SSL/TLS

##### Option A: Certbot + Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/tempmail
```

Add configuration:
```nginx
server {
    listen 80;
    server_name mail.example.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and get certificate:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tempmail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d mail.example.com
```

##### Option B: Cloudflare

1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Enable "Flexible" or "Full" SSL
4. Add A record pointing to server
5. Enable proxy (orange cloud)

#### 5. Security Hardening

```bash
# Install fail2ban
sudo apt install fail2ban

# Configure fail2ban for SSH
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600
```

Start fail2ban:
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 6. Setup Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup logrotate for Docker
sudo nano /etc/logrotate.d/docker-containers
```

Add:
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size 10M
    missingok
    delaycompress
    copytruncate
}
```

#### 7. Automated Backups

Create backup script:
```bash
sudo nano /usr/local/bin/backup-tempmail.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/backups/tempmail"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /path/to/temp-mail/docker-compose.yml exec -T postgres \
  pg_dump -U tempmail tempmail | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup config
cp /path/to/temp-mail/.env $BACKUP_DIR/env_$DATE.backup

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.backup" -mtime +30 -delete

# Optional: Upload to S3/B2
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://bucket-name/
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-tempmail.sh
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-tempmail.sh >> /var/log/tempmail-backup.log 2>&1
```

## Cloud Providers

### DigitalOcean

1. **Create Droplet**
   - Choose Ubuntu 22.04
   - Select $12/month plan (2GB RAM)
   - Enable monitoring
   - Add SSH key

2. **Configure Networking**
   - Point domain A record to droplet IP
   - Configure firewall in DO dashboard

3. **Deploy**
   - SSH into droplet
   - Run installation script

### AWS EC2

1. **Launch Instance**
   - Ubuntu 22.04 AMI
   - t3.small instance type
   - 20GB EBS storage
   - Configure security group (ports 22, 25, 80, 443)

2. **Elastic IP**
   - Allocate Elastic IP
   - Associate with instance

3. **Route 53**
   - Create hosted zone
   - Add A and MX records

### Google Cloud Platform

1. **Create VM Instance**
   - e2-small machine type
   - Ubuntu 22.04 LTS
   - Allow HTTP/HTTPS traffic

2. **Configure Firewall**
   ```bash
   gcloud compute firewall-rules create allow-smtp \
     --allow tcp:25 \
     --source-ranges 0.0.0.0/0
   ```

3. **Static IP**
   ```bash
   gcloud compute addresses create tempmail-ip --region=us-central1
   gcloud compute instances add-access-config instance-name \
     --access-config-name "External NAT" \
     --address $(gcloud compute addresses describe tempmail-ip --region=us-central1 --format="value(address)")
   ```

### Hetzner

1. **Create Server**
   - CX21 or CX31
   - Ubuntu 22.04
   - Add SSH key

2. **Configure Firewall**
   - Allow ports 22, 25, 80, 443

3. **Setup DNS**
   - Use Hetzner DNS or external provider

## Docker Deployment Options

### Docker Swarm

For high availability:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml tempmail

# Scale services
docker service scale tempmail_backend=3
```

### Kubernetes

See `k8s/` directory for manifests (if available).

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
REGISTRATION_OPEN=true
DEFAULT_RETENTION_HOURS=1
```

### Staging
```bash
NODE_ENV=staging
REGISTRATION_OPEN=true
DEFAULT_RETENTION_HOURS=24
```

### Production
```bash
NODE_ENV=production
REGISTRATION_OPEN=false
DEFAULT_RETENTION_HOURS=72
```

## Performance Optimization

### Database Tuning

Edit `docker-compose.yml`:
```yaml
postgres:
  environment:
    POSTGRES_INITDB_ARGS: "-c shared_buffers=256MB -c max_connections=200"
```

### Backend Scaling

Run multiple backend instances:
```yaml
backend:
  deploy:
    replicas: 3
```

### Caching

Add Redis for session storage:
```yaml
redis:
  image: redis:alpine
  restart: unless-stopped
```

## Monitoring Setup

### Prometheus + Grafana

Add to `docker-compose.yml`:
```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

### Uptime Monitoring

Options:
- UptimeRobot (free tier)
- Better Uptime
- Self-hosted Uptime Kuma

## Troubleshooting

### Port 25 Blocked

Some cloud providers block port 25. Solutions:
1. Request port 25 unblock from provider
2. Use alternative port (587) with relay
3. Use external SMTP relay service

### Memory Issues

Increase swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### High CPU Usage

Check logs:
```bash
docker stats
docker-compose logs -f
```

Optimize:
- Reduce cleanup frequency
- Increase retention time
- Add more resources

## Maintenance

### Regular Tasks

Weekly:
- Review logs for errors
- Check disk space
- Verify backups
- Update DNS if needed

Monthly:
- Update system packages
- Review security settings
- Optimize database
- Check for updates

Quarterly:
- Review and update SSL certificates
- Audit user accounts
- Performance review
- Disaster recovery test

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- GitHub Issues
- Community forums

---

**Remember**: Always test changes in a staging environment before applying to production!
