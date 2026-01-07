# 📧 Temp Mail - Self-Hosted Temporary Email System

A complete, production-ready temporary email system similar to temp-mail.org, but fully self-hosted with admin controls, user management, and complete privacy.

## 🎯 Features

- **Complete Mail System**: Receive emails via Postfix catch-all SMTP server
- **User Management**: Registration with admin approval system
- **Admin Dashboard**: Comprehensive control panel for system management
- **Inbox Management**: Users can create multiple temporary email addresses
- **Email Viewer**: View emails with HTML rendering and attachment support
- **Auto-Cleanup**: Automatic email deletion based on retention policies
- **Security**: Password hashing, JWT authentication, rate limiting
- **Production Ready**: Docker-based deployment with PostgreSQL database

## 🔧 Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React + Vite
- **Database**: PostgreSQL + Prisma ORM
- **SMTP**: Postfix (catch-all configuration)
- **Auth**: JWT tokens
- **Deployment**: Docker + Docker Compose

## 📋 Prerequisites

- Linux server (Ubuntu 22.04+ recommended)
- Root or sudo access
- Domain name with DNS access
- Minimum 2GB RAM, 10GB disk space

## 🚀 Quick Installation

1. **Clone the repository**
```bash
git clone https://github.com/Leopixel1/temp-mail.git
cd temp-mail
```

2. **Run the installer**
```bash
sudo bash installer/install.sh
```

The installer will:
- Check system requirements
- Install Docker and Docker Compose
- Gather configuration (domain, admin credentials, limits)
- Generate secure passwords and secrets
- Build and start all services

3. **Configure DNS**

Add these DNS records for your domain:
```
Type    Name                Value               Priority
A       mail.example.com    YOUR_SERVER_IP      -
MX      example.com         mail.example.com    10
```

## 🔒 Security Configuration

### Firewall Rules

Allow required ports:
```bash
# SMTP
sudo ufw allow 25/tcp

# HTTP (or use 443 for HTTPS)
sudo ufw allow 80/tcp

# SSH (if needed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### SSL/TLS Setup (Recommended)

For production use with HTTPS, set up a reverse proxy:

#### Option 1: Nginx + Let's Encrypt
```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d mail.example.com
```

Configure Nginx:
```nginx
server {
    listen 443 ssl http2;
    server_name mail.example.com;

    ssl_certificate /etc/letsencrypt/live/mail.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mail.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Option 2: Nginx Proxy Manager (NPM)

Nginx Proxy Manager provides a user-friendly web interface for managing reverse proxies and SSL certificates.

**Installation:**
```bash
# Create NPM directory
mkdir -p ~/nginx-proxy-manager
cd ~/nginx-proxy-manager

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  npm:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'    # HTTP
      - '81:81'    # Admin interface
      - '443:443'  # HTTPS
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - npm-network

networks:
  npm-network:
    driver: bridge
EOF

# Start NPM
docker-compose up -d
```

> **Note**: This basic setup uses NPM's own network. For advanced Docker network integration to directly connect NPM with Temp Mail containers, see the [detailed guide](docs/DEPLOYMENT.md#option-b-nginx-proxy-manager).

**Configuration:**
1. Access NPM admin interface at `http://your-server-ip:81`
2. Default login: `admin@example.com` / `changeme` (change immediately)
3. Click "Proxy Hosts" → "Add Proxy Host"
4. Configure:
   - **Domain Names**: `mail.example.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `your-server-ip` or `host.docker.internal` (for Docker)
   - **Forward Port**: `80` (or `8080` if you change Temp Mail's port - see note below)
   - Enable "Block Common Exploits"
   - Enable "Websockets Support"
5. Go to "SSL" tab:
   - Select "Request a new SSL Certificate"
   - Enable "Force SSL"
   - Enable "HTTP/2 Support"
   - Agree to Let's Encrypt Terms
   - Click "Save"

**Port Conflict Resolution**: If running NPM on the same server as Temp Mail, you'll need to change Temp Mail's port since both use port 80 by default:

1. Edit Temp Mail's docker-compose.yml:
   ```yaml
   frontend:
     ports:
       - "8080:80"  # Change from 80:80
   ```

2. Restart Temp Mail:
   ```bash
   docker-compose down && docker-compose up -d
   ```

3. In NPM proxy host configuration, use:
   - **Forward Hostname/IP**: `your-server-ip` or `host.docker.internal`
   - **Forward Port**: `8080`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#option-b-nginx-proxy-manager) for detailed NPM setup instructions.

## 📖 User Guide

### For Users

1. **Registration**: Register an account (if enabled by admin)
2. **Wait for Approval**: Admin must approve your account
3. **Create Inbox**: Generate temporary email addresses
4. **Receive Emails**: All emails sent to your inbox addresses appear automatically
5. **Auto-Refresh**: Email list refreshes every 10 seconds
6. **Manage**: View, delete individual emails or entire inboxes

### For Administrators

Access the admin panel at `/admin` after logging in with admin credentials.

#### User Management
- Approve/reject new registrations
- Activate/deactivate user accounts
- Set custom limits per user (inboxes, emails, retention)
- Delete user accounts

#### System Settings
- Toggle login requirement
- Enable/disable registration
- Set default retention time
- Configure global limits
- Choose deletion behavior on limit

#### Statistics
- View total users, inboxes, emails
- Monitor login activity
- Track emails received per day

## ⚙️ Configuration

### Environment Variables

Edit `.env` file to customize:

```bash
# Domain
DOMAIN=mail.example.com

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password

# Email Retention (in hours)
DEFAULT_RETENTION_HOURS=72

# User Limits
MAX_INBOXES_PER_USER=5
MAX_EMAILS_PER_INBOX=50

# Registration
REGISTRATION_OPEN=false

# Security
JWT_SECRET=random-secret-key
```

### Retention Time Options

Common configurations:
- **10 minutes**: 0.17 hours (testing/high security)
- **1 hour**: 1 hour (very temporary)
- **3 hours**: 3 hours (short-term)
- **24 hours**: 24 hours (one day)
- **3 days**: 72 hours (default, recommended)
- **7 days**: 168 hours (extended)

## 🔧 Management Commands

### Docker Compose

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postfix

# Restart services
docker-compose restart

# Stop services
docker-compose stop

# Start services
docker-compose start

# Rebuild and restart
docker-compose up -d --build

# Remove everything (including data!)
docker-compose down -v
```

### Database Management

```bash
# Backup database
docker-compose exec postgres pg_dump -U tempmail tempmail > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U tempmail tempmail

# Access database console
docker-compose exec postgres psql -U tempmail tempmail
```

### Email Troubleshooting

```bash
# Test email reception
echo "Test email" | mail -s "Test Subject" test@mail.example.com

# Check Postfix logs
docker-compose logs -f postfix

# Check email processing
docker-compose logs -f backend | grep "Email received"
```

## 📊 System Architecture

```
┌─────────────┐
│   Internet  │
└──────┬──────┘
       │ SMTP (Port 25)
       ▼
┌─────────────────┐
│   Postfix       │
│   (Catch-All)   │
└────────┬────────┘
         │ Pipe
         ▼
┌─────────────────┐      ┌──────────────┐
│   Backend       │◄────►│  PostgreSQL  │
│   (Node.js)     │      │  (Database)  │
└────────┬────────┘      └──────────────┘
         │ HTTP API
         ▼
┌─────────────────┐
│   Frontend      │
│   (React)       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   User Browser  │
└─────────────────┘
```

## 🔐 Security Features

1. **Password Hashing**: Bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Rate Limiting**: Prevent brute force attacks
4. **Input Validation**: Express-validator on all inputs
5. **SQL Injection Protection**: Prisma ORM with prepared statements
6. **XSS Protection**: Helmet.js security headers
7. **CORS Configuration**: Controlled cross-origin access
8. **Email Sandboxing**: iframes with sandbox attribute

## ❓ Frequently Asked Questions

### Which ports do I need to open on my router?

For home/self-hosted deployments, configure port forwarding for:
- **Port 25** (SMTP) - Required for receiving emails
- **Port 80** (HTTP) - Required for web interface
- **Port 443** (HTTPS) - Recommended for secure access

See the [FAQ](docs/FAQ.md#which-ports-do-i-need-to-open-on-my-router) for detailed router configuration instructions.

### Common Questions

For answers to questions about:
- Router port forwarding setup
- DNS configuration
- Installation requirements
- Security best practices
- Troubleshooting
- Backup and maintenance
- Performance optimization

**See the comprehensive [FAQ document](docs/FAQ.md)** for detailed answers.

## 🐛 Troubleshooting

### Emails Not Received

1. Check DNS MX records:
```bash
dig MX example.com
nslookup -type=MX example.com
```

2. Test SMTP connection:
```bash
telnet mail.example.com 25
```

3. Check Postfix logs:
```bash
docker-compose logs postfix
```

### Database Connection Issues

1. Check PostgreSQL status:
```bash
docker-compose ps postgres
```

2. Verify connection:
```bash
docker-compose exec postgres pg_isready
```

### Frontend Not Loading

1. Check container status:
```bash
docker-compose ps frontend
```

2. Check build logs:
```bash
docker-compose logs frontend
```

**For more troubleshooting help**, see the [FAQ](docs/FAQ.md#troubleshooting).

## 📦 Backup & Restore

### Full Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose exec postgres pg_dump -U tempmail tempmail > backups/db_$(date +%Y%m%d).sql

# Backup configuration
cp .env backups/env_$(date +%Y%m%d).backup
```

### Scheduled Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/temp-mail && docker-compose exec postgres pg_dump -U tempmail tempmail > backups/db_$(date +\%Y\%m\%d).sql
```

### Restore from Backup

```bash
# Stop services
docker-compose stop

# Restore database
cat backups/db_20240101.sql | docker-compose exec -T postgres psql -U tempmail tempmail

# Start services
docker-compose start
```

## 🔄 Updates

To update to a new version:

```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose up -d --build

# Check status
docker-compose ps
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For issues and questions:
- **FAQ**: See [docs/FAQ.md](docs/FAQ.md) for answers to common questions
- **GitHub Issues**: https://github.com/Leopixel1/temp-mail/issues

## 🙏 Acknowledgments

Built with modern web technologies and best practices for self-hosting enthusiasts.
