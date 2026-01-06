#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=================================================="
echo "  Temp Mail Self-Hosted Installation Script"
echo "=================================================="
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

# Check Ubuntu version
if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [[ "$ID" != "ubuntu" ]]; then
    echo -e "${YELLOW}Warning: This script is designed for Ubuntu. Your OS: $ID${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
  
  VERSION_ID_NUM=$(echo $VERSION_ID | cut -d'.' -f1)
  if [ "$VERSION_ID_NUM" -lt 20 ]; then
    echo -e "${YELLOW}Warning: Ubuntu 20.04 or higher recommended. Your version: $VERSION_ID${NC}"
  fi
else
  echo -e "${YELLOW}Warning: Cannot detect OS version${NC}"
fi

# Function to generate random password
generate_password() {
  openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

echo -e "${BLUE}Step 1: Installing dependencies...${NC}"

# Update package list
apt-get update

# Install required packages
apt-get install -y curl git openssl

# Install Docker if not present
if ! command_exists docker; then
  echo -e "${GREEN}Installing Docker...${NC}"
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
  systemctl enable docker
  systemctl start docker
else
  echo -e "${GREEN}Docker already installed${NC}"
fi

# Install Docker Compose if not present
if ! command_exists docker-compose; then
  echo -e "${GREEN}Installing Docker Compose...${NC}"
  DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
  curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
else
  echo -e "${GREEN}Docker Compose already installed${NC}"
fi

echo -e "${BLUE}Step 2: Gathering configuration...${NC}"

# Get domain
read -p "Enter your domain (e.g., mail.example.com): " DOMAIN
while [ -z "$DOMAIN" ]; do
  echo -e "${RED}Domain cannot be empty${NC}"
  read -p "Enter your domain: " DOMAIN
done

# Get admin email
read -p "Enter admin email (e.g., admin@example.com): " ADMIN_EMAIL
while [ -z "$ADMIN_EMAIL" ]; do
  echo -e "${RED}Admin email cannot be empty${NC}"
  read -p "Enter admin email: " ADMIN_EMAIL
done

# Get admin password
read -sp "Enter admin password (leave empty to generate): " ADMIN_PASSWORD
echo
if [ -z "$ADMIN_PASSWORD" ]; then
  ADMIN_PASSWORD=$(generate_password)
  echo -e "${GREEN}Generated admin password: ${ADMIN_PASSWORD}${NC}"
fi

# Get retention time
echo "Select default email retention time:"
echo "1) 10 minutes"
echo "2) 1 hour"
echo "3) 3 hours"
echo "4) 24 hours"
echo "5) 3 days (72 hours)"
echo "6) 7 days"
read -p "Choose (1-6) [default: 5]: " RETENTION_CHOICE

case $RETENTION_CHOICE in
  1) RETENTION_HOURS=0.17 ;; # 10 minutes
  2) RETENTION_HOURS=1 ;;
  3) RETENTION_HOURS=3 ;;
  4) RETENTION_HOURS=24 ;;
  5) RETENTION_HOURS=72 ;;
  6) RETENTION_HOURS=168 ;;
  *) RETENTION_HOURS=72 ;;
esac

# Get limits
read -p "Max inboxes per user [default: 5]: " MAX_INBOXES
MAX_INBOXES=${MAX_INBOXES:-5}

read -p "Max emails per inbox [default: 50]: " MAX_EMAILS
MAX_EMAILS=${MAX_EMAILS:-50}

# Registration settings
read -p "Allow open registration? (y/N): " ALLOW_REG
if [[ $ALLOW_REG =~ ^[Yy]$ ]]; then
  REGISTRATION_OPEN=true
else
  REGISTRATION_OPEN=false
fi

# Generate JWT secret
JWT_SECRET=$(generate_password)

# Generate database password
DB_PASSWORD=$(generate_password)

echo -e "${BLUE}Step 3: Creating configuration files...${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Create .env file
cat > .env <<EOF
# Temp Mail Configuration
# Generated on $(date)

# Domain Configuration
DOMAIN=${DOMAIN}

# Database Configuration
POSTGRES_USER=tempmail
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=tempmail

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Admin Configuration
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# System Configuration
NODE_ENV=production
DEFAULT_RETENTION_HOURS=${RETENTION_HOURS}
MAX_INBOXES_PER_USER=${MAX_INBOXES}
MAX_EMAILS_PER_INBOX=${MAX_EMAILS}
REGISTRATION_OPEN=${REGISTRATION_OPEN}
LOGIN_REQUIRED=true
DELETE_OLD_ON_LIMIT=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend Port
FRONTEND_PORT=80
EOF

echo -e "${GREEN}Configuration saved to .env${NC}"

echo -e "${BLUE}Step 4: Building and starting containers...${NC}"

# Build and start containers
docker-compose build
docker-compose up -d

echo -e "${GREEN}Containers started!${NC}"

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 10

# Check container status
echo -e "${BLUE}Container status:${NC}"
docker-compose ps

echo -e "${GREEN}"
echo "=================================================="
echo "  Installation Complete!"
echo "=================================================="
echo -e "${NC}"
echo ""
echo -e "${BLUE}Access Information:${NC}"
echo -e "  Web Interface: ${GREEN}http://${DOMAIN}${NC} (or http://your-server-ip)"
echo -e "  Admin Email: ${GREEN}${ADMIN_EMAIL}${NC}"
echo -e "  Admin Password: ${GREEN}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "${YELLOW}Important Next Steps:${NC}"
echo "1. Configure DNS Records:"
echo "   - A Record: ${DOMAIN} -> Your Server IP"
echo "   - MX Record: ${DOMAIN} -> ${DOMAIN} (Priority: 10)"
echo ""
echo "2. If using a firewall, open ports:"
echo "   - Port 25 (SMTP)"
echo "   - Port 80 (HTTP) or Port 443 (HTTPS)"
echo ""
echo "3. For HTTPS, consider setting up a reverse proxy with:"
echo "   - Nginx + Let's Encrypt"
echo "   - Traefik"
echo "   - Caddy"
echo ""
echo "4. Test email reception:"
echo "   Send a test email to: test@${DOMAIN}"
echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose stop"
echo "  Start services: docker-compose start"
echo "  Restart services: docker-compose restart"
echo "  Remove all: docker-compose down -v"
echo ""
echo -e "${YELLOW}Backup Recommendations:${NC}"
echo "  - Backup the .env file"
echo "  - Backup PostgreSQL data: docker-compose exec postgres pg_dump -U tempmail tempmail > backup.sql"
echo ""
echo -e "${GREEN}Enjoy your self-hosted temporary mail system!${NC}"
