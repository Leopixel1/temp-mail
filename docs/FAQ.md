# Frequently Asked Questions (FAQ)

## Network & Ports

### Which ports do I need to open on my router?

To run the Temp Mail system from your home network, you need to configure port forwarding on your router for the following ports:

| Port | Service | Required | Description |
|------|---------|----------|-------------|
| **25** | SMTP | **Yes** | Incoming email from internet mail servers |
| **80** | HTTP | **Yes** | Web interface access |
| **443** | HTTPS | Recommended | Secure web interface (if using SSL/TLS) |

#### Router Port Forwarding Configuration

**For Home/Self-Hosted Deployments:**

1. **Access your router admin panel** (usually at 192.168.1.1 or 192.168.0.1)

2. **Find Port Forwarding section** (may be called: Port Forwarding, Virtual Server, NAT, or Applications)

3. **Create port forwarding rules:**

   **Rule 1 - SMTP (Email Reception):**
   - External Port: 25
   - Internal Port: 25
   - Internal IP: Your server's local IP (e.g., 192.168.1.100)
   - Protocol: TCP
   - Description: Temp Mail SMTP

   **Rule 2 - HTTP (Web Interface):**
   - External Port: 80
   - Internal Port: 80
   - Internal IP: Your server's local IP (e.g., 192.168.1.100)
   - Protocol: TCP
   - Description: Temp Mail HTTP

   **Rule 3 - HTTPS (Optional but Recommended):**
   - External Port: 443
   - Internal Port: 443
   - Internal IP: Your server's local IP (e.g., 192.168.1.100)
   - Protocol: TCP
   - Description: Temp Mail HTTPS

4. **Save and apply** the router configuration

5. **Configure firewall on your server** (if running ufw or similar):
   ```bash
   sudo ufw allow 25/tcp   # SMTP
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```

#### Finding Your Server's Local IP

```bash
# On your server, run:
hostname -I
# or
ip addr show
```

#### Verifying Port Forwarding

After configuration, test that ports are accessible:

```bash
# From an external network/device, test SMTP:
telnet your-public-ip 25

# Test HTTP (use browser):
http://your-public-ip

# Test if port is open (from external source):
nc -zv your-public-ip 25
```

### Do I need to open ports if hosting on a cloud provider?

**No port forwarding needed** for cloud providers like:
- DigitalOcean
- AWS EC2
- Google Cloud Platform
- Hetzner
- Vultr
- Linode

Instead, configure the **cloud firewall/security groups**:
- Allow incoming TCP port 25 (SMTP)
- Allow incoming TCP port 80 (HTTP)
- Allow incoming TCP port 443 (HTTPS)
- Allow incoming TCP port 22 (SSH for management)

### My ISP blocks port 25, what can I do?

Many residential ISPs block outbound port 25 to prevent spam. Solutions:

1. **Contact your ISP** and request port 25 to be unblocked (mention running a mail server)

2. **Use a cloud server** instead of home hosting (recommended for mail servers)

3. **Use an SMTP relay service** (advanced configuration):
   - Mailgun
   - SendGrid
   - AWS SES
   - Configure Postfix to relay through them

4. **Use alternative port** (not standard, requires sender configuration):
   - Port 587 (submission port)
   - Port 2525 (alternative)
   - Note: Most mail servers won't send to non-standard ports

### What is my public IP address?

Find your public IP address:

```bash
curl ifconfig.me
# or
curl icanhazip.com
# or visit
# https://whatismyip.com
```

Note: If your ISP provides a **dynamic IP**, it may change. Consider:
- Using a **Dynamic DNS (DDNS)** service (No-IP, DuckDNS, etc.)
- Upgrading to a **static IP** from your ISP
- Using a **cloud provider** with a static IP

## DNS Configuration

### How do I configure DNS for my domain?

You need to add two DNS records at your domain registrar or DNS provider:

**Example for subdomain (mail.example.com):**
```
Type    Name    Value                   TTL     Priority
A       mail    YOUR_PUBLIC_IP          300     -
MX      @       mail.example.com        300     10
```

**Example for root domain (example.com):**
```
Type    Name    Value                   TTL     Priority
A       @       YOUR_PUBLIC_IP          300     -
MX      @       example.com             300     10
```

### How long does DNS propagation take?

- Typically: **5-30 minutes**
- Maximum: **24-48 hours** (rare)

Check propagation status:
```bash
# Check A record
dig mail.example.com
nslookup mail.example.com

# Check MX record
dig MX example.com
nslookup -type=MX example.com
```

Online tools:
- https://dnschecker.org
- https://whatsmydns.net

### Can I use a subdomain or must I use the root domain?

You can use either:

**Subdomain (Recommended):**
- Example: `mail.example.com`
- Benefit: Keeps main domain separate
- MX record points to: `mail.example.com`

**Root Domain:**
- Example: `example.com`
- All email to `@example.com` goes here
- MX record points to: `example.com`

**Best Practice:** Use a subdomain to keep mail separate from your main website.

## Installation & Setup

### Do I need a domain name?

**Yes, a domain is required** for receiving emails. You cannot use just an IP address because:
- MX records require a domain name
- Most mail servers reject emails sent to IP addresses
- Email addresses need a domain (user@domain.com)

Free domain options:
- Freenom (.tk, .ml, .ga, .cf, .gq domains) - check availability
- Free subdomain services (not recommended for production)

Paid domain options (recommended):
- Namecheap
- Google Domains
- Cloudflare Registrar
- GoDaddy

### What are the minimum system requirements?

**Minimum (Testing/Personal Use):**
- 1 CPU core
- 2GB RAM
- 10GB disk space
- Linux (Ubuntu 20.04+)

**Recommended (Production):**
- 2+ CPU cores
- 4GB RAM
- 20GB+ SSD storage
- Ubuntu 22.04 LTS
- Static IP address

**For High Traffic:**
- 4+ CPU cores
- 8GB+ RAM
- 50GB+ SSD storage
- Consider load balancing

### Can I run this on Windows or macOS?

The system is designed for **Linux servers** (Ubuntu recommended).

However, for **development/testing only**:
- **Windows**: Use WSL2 (Windows Subsystem for Linux) + Docker Desktop
- **macOS**: Use Docker Desktop

**Not recommended for production** on Windows/macOS due to:
- Performance limitations
- Docker networking complexity
- Postfix mail server issues

### Do I need Docker experience?

**No Docker experience required** for basic installation!

The installer script handles:
- Docker installation
- Container setup
- Configuration

Basic Docker commands for management:
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop/start
docker-compose stop
docker-compose start
```

See `README.md` for more Docker commands.

## Security

### Is HTTPS required?

**Not required** but **strongly recommended** for production use:

**Without HTTPS:**
- ⚠️ Login credentials sent in plain text
- ⚠️ JWT tokens visible to network snoopers
- ⚠️ Email content not encrypted in transit

**With HTTPS:**
- ✅ All web traffic encrypted
- ✅ Login credentials protected
- ✅ Professional appearance
- ✅ Better SEO ranking

Setup HTTPS using one of these options:

**Option 1: Nginx + Certbot (Command Line)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get free SSL certificate
sudo certbot --nginx -d mail.example.com
```

**Option 2: Nginx Proxy Manager (Web GUI)**
- Easy-to-use web interface for SSL management
- See [README.md](../README.md#option-2-nginx-proxy-manager-npm) for quick setup
- See [DEPLOYMENT.md](DEPLOYMENT.md#option-b-nginx-proxy-manager) for detailed guide

### Can I use Nginx Proxy Manager (NPM) for SSL?

**Yes!** Nginx Proxy Manager is an excellent choice for SSL management. It provides:

**Benefits:**
- ✅ User-friendly web interface (no command line needed)
- ✅ Automatic SSL certificate requests from Let's Encrypt
- ✅ Auto-renewal of certificates
- ✅ Easy management of multiple domains
- ✅ Built-in security features (HSTS, HTTP/2)
- ✅ No manual Nginx configuration required

**Quick Setup:**
1. Install NPM using Docker
2. Access admin interface on port 81
3. Add proxy host for your domain
4. Enable SSL with one click
5. NPM handles everything automatically

**Important**: If running NPM on the same server as Temp Mail, change Temp Mail's frontend port from `80:80` to `8080:80` in Temp Mail's docker-compose.yml to avoid port conflicts.

**Full Guide**: See [docs/DEPLOYMENT.md](DEPLOYMENT.md#option-b-nginx-proxy-manager) for complete NPM setup instructions.

### Should I allow open registration?

**Depends on your use case:**

**Keep registration closed (default)** if:
- Personal/family use
- Small team/organization
- You want to control who has access
- You need to review each user

**Enable open registration** if:
- Public service
- Large community
- You have moderation tools
- You can handle abuse reports

**Best Practice:** Start with registration closed, open it later if needed.

### How do I secure my admin account?

1. **Strong password**: Use 16+ characters with mixed case, numbers, symbols
2. **Unique password**: Don't reuse from other services
3. **Password manager**: Use 1Password, Bitwarden, or similar
4. **Regular updates**: Keep system packages updated
5. **Monitor logs**: Check for suspicious activity
6. **Firewall**: Use ufw to restrict access
7. **Fail2ban**: Install to prevent brute force attacks

### What about spam and abuse?

Built-in protections:
- ✅ Rate limiting on API endpoints
- ✅ Admin approval for new users
- ✅ Automatic email deletion (retention policy)
- ✅ User account deactivation by admin

Additional recommendations:
- Monitor admin panel statistics daily
- Deactivate suspicious users promptly
- Adjust retention time lower if seeing abuse
- Consider requiring email verification
- Use Cloudflare for DDoS protection

## Email Management

### How long are emails kept?

**Default: 72 hours (3 days)**

Configurable retention options:
- 10 minutes (testing)
- 1 hour (very temporary)
- 3 hours (short-term)
- 24 hours (one day)
- 72 hours (3 days) - default
- 168 hours (7 days)

Change in `.env` file:
```bash
DEFAULT_RETENTION_HOURS=72
```

Or set per-user limits in admin panel.

### What happens when inbox/email limits are reached?

**Two behaviors** (configurable):

**Option 1: Delete oldest (default)**
```bash
DELETE_OLD_ON_LIMIT=true
```
- Automatically removes oldest emails
- Inbox continues receiving new mail
- Users don't hit hard limit

**Option 2: Reject new emails**
```bash
DELETE_OLD_ON_LIMIT=false
```
- New emails rejected when limit reached
- User must manually delete emails
- More control for users

### Can I receive emails with attachments?

**Yes!** The system supports:
- ✅ Email attachments (all types)
- ✅ HTML emails
- ✅ Plain text emails
- ✅ Inline images
- ✅ Large emails (configurable size limit)

Attachments are stored in the database. Monitor disk space if receiving many large attachments.

### How many inboxes can a user create?

**Default limit: 5 inboxes per user**

Configurable globally:
```bash
MAX_INBOXES_PER_USER=5
```

Or set custom limits per user in admin panel.

### What email addresses can users receive mail at?

Users can create temporary email addresses like:
- `randomstring@yourdomain.com`
- `anything@yourdomain.com`
- `test123@yourdomain.com`

The system uses **catch-all** configuration:
- All emails to `@yourdomain.com` are accepted
- Users create "inboxes" that filter emails to specific addresses
- Each inbox has a unique randomly generated address

## Troubleshooting

### Emails are not being received

**Check DNS:**
```bash
dig MX yourdomain.com
nslookup -type=MX yourdomain.com
```

**Check ports are open:**
```bash
# On server
sudo netstat -tlnp | grep :25

# From external
telnet yourdomain.com 25
```

**Check Postfix logs:**
```bash
docker-compose logs -f postfix
```

**Check backend logs:**
```bash
docker-compose logs -f backend | grep "Email received"
```

**Test email sending:**
```bash
echo "Test" | mail -s "Test" test@yourdomain.com
```

### Web interface is not accessible

**Check containers are running:**
```bash
docker-compose ps
```

**Check frontend logs:**
```bash
docker-compose logs -f frontend
```

**Check ports:**
```bash
sudo netstat -tlnp | grep :80
```

**Restart services:**
```bash
docker-compose restart
```

### Port 80 is already in use

If you get "port is already allocated" error when starting Temp Mail:

**Cause**: Another service (like Nginx, Apache, or Nginx Proxy Manager) is using port 80.

**Solution 1: Change Temp Mail Port**
```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Change frontend ports from:
# ports:
#   - "80:80"
# To:
# ports:
#   - "8080:80"

# Restart
docker-compose down
docker-compose up -d
```

Access at: `http://your-ip:8080`

**Solution 2: Use Reverse Proxy**

If using Nginx Proxy Manager or Nginx:
1. Change Temp Mail to port 8080 (as above)
2. Configure reverse proxy to forward `yourdomain.com` → `localhost:8080`
3. Access via your domain with SSL

**Solution 3: Stop Conflicting Service**
```bash
# Find what's using port 80
sudo lsof -i :80

# Stop the service (if not needed)
sudo systemctl stop nginx  # or apache2, or other service
sudo systemctl disable nginx  # prevent auto-start
```

### Cannot login to admin account

**Check credentials in .env file:**
```bash
grep -E "ADMIN_EMAIL|ADMIN_PASSWORD" .env
```

**Reset password:**
```bash
# Generate new password hash
docker-compose exec backend node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('your-new-password', 10).then(hash => console.log(hash));
"

# Update database
docker-compose exec postgres psql -U tempmail tempmail
UPDATE users SET password='PASTE_HASH_HERE' WHERE email='admin@example.com';
\q
```

**Check backend logs for errors:**
```bash
docker-compose logs -f backend
```

### Database connection failed

**Check PostgreSQL status:**
```bash
docker-compose ps postgres
docker-compose exec postgres pg_isready
```

**Check credentials match:**
```bash
# In .env file
grep POSTGRES_ .env
```

**Restart database:**
```bash
docker-compose restart postgres
```

**Check logs:**
```bash
docker-compose logs postgres
```

### Out of disk space

**Check disk usage:**
```bash
df -h
docker system df
```

**Clean Docker:**
```bash
# Remove unused containers/images
docker system prune -a

# Remove old logs
sudo truncate -s 0 /var/lib/docker/containers/*/*.log
```

**Reduce retention time:**
```bash
# Edit .env
DEFAULT_RETENTION_HOURS=24  # Instead of 72
docker-compose restart backend
```

**Add more storage** or **lower email limits**.

## Backup & Maintenance

### How do I backup my data?

**Manual backup:**
```bash
# Backup database
docker-compose exec postgres pg_dump -U tempmail tempmail > backup.sql

# Backup configuration
cp .env .env.backup
```

**Automated backup script:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/tempmail"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U tempmail tempmail | gzip > $BACKUP_DIR/db_$DATE.sql.gz
cp .env $BACKUP_DIR/env_$DATE.backup

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Schedule with cron:**
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### How do I restore from backup?

```bash
# Stop services
docker-compose stop

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U tempmail tempmail

# Restore configuration
cp .env.backup .env

# Start services
docker-compose start
```

### How do I update to a new version?

```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

**Always backup before updating!**

## Performance

### How many emails can the system handle?

Depends on server resources:

**Small server (2GB RAM):**
- ~1,000 emails per day
- ~50 concurrent users
- ~500 total stored emails

**Medium server (4GB RAM):**
- ~10,000 emails per day
- ~200 concurrent users
- ~5,000 total stored emails

**Large server (8GB+ RAM):**
- ~100,000+ emails per day
- ~1,000+ concurrent users
- ~50,000+ total stored emails

**Optimization tips:**
- Lower retention time = less storage
- Add more RAM for better performance
- Use SSD instead of HDD
- Enable database optimization
- Use CDN for static assets

### Can I scale horizontally?

**Yes**, with modifications:

1. **Load balancer** in front of multiple backend instances
2. **Shared PostgreSQL** database
3. **Shared Postfix** or route to single instance
4. **Redis** for session storage (requires code changes)

See `docs/DEPLOYMENT.md` for Docker Swarm and Kubernetes options.

### System is running slow

**Check resource usage:**
```bash
docker stats
htop  # or top
df -h
```

**Common causes:**
1. **Low RAM**: Add swap or increase RAM
2. **Disk full**: Clean up old data
3. **Too many emails**: Lower retention time
4. **Database bloat**: Vacuum PostgreSQL
5. **High CPU**: Check for infinite loops in logs

**Quick fixes:**
```bash
# Add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Vacuum database
docker-compose exec postgres psql -U tempmail tempmail -c "VACUUM FULL;"

# Restart services
docker-compose restart
```

## Miscellaneous

### Can I customize the frontend design?

**Yes!** Frontend is React-based:

```bash
cd frontend
# Edit files in src/
# Rebuild
docker-compose build frontend
docker-compose up -d
```

See `frontend/README.md` for development setup.

### Can I use a custom domain for API?

**Yes**, configure reverse proxy:

```nginx
# API at api.example.com
server {
    listen 80;
    server_name api.example.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Frontend at mail.example.com
server {
    listen 80;
    server_name mail.example.com;
    location / {
        proxy_pass http://localhost:80;
    }
}
```

Update frontend `.env`:
```bash
VITE_API_URL=https://api.example.com
```

### Does it support multiple domains?

**Not by default**. One instance = one domain.

For multiple domains:
1. **Run separate instances** (different ports/servers)
2. **Modify Postfix configuration** (advanced)
3. **Use multiple servers** with different domains

### Can I integrate with existing email system?

**Not recommended**. This is a standalone temporary email system.

However, you can:
- Use different domain for temp mail
- Forward specific addresses to existing system
- Run in parallel with existing mail server (different ports)

### Is there an API?

**Yes!** RESTful API with JWT authentication.

See `docs/API.md` for:
- Authentication endpoints
- Inbox management
- Email retrieval
- Admin operations

Example:
```bash
# Login
curl -X POST http://mail.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get inboxes
curl http://mail.example.com/api/inboxes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Where can I get help?

- 📖 **Documentation**: Read all `.md` files in `docs/` folder
- 🐛 **GitHub Issues**: https://github.com/Leopixel1/temp-mail/issues
- 💬 **Discussions**: GitHub Discussions (if enabled)
- 📧 **Email**: Check repository for contact info

Before asking for help:
1. Check this FAQ
2. Read error messages in logs
3. Search existing GitHub issues
4. Provide logs and configuration when reporting issues

## Additional Resources

- **Main README**: `/README.md`
- **Quick Start Guide**: `/docs/QUICKSTART.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **Admin Guide**: `/docs/ADMIN_GUIDE.md`
- **API Documentation**: `/docs/API.md`

---

**Didn't find your answer?** Open an issue on GitHub: https://github.com/Leopixel1/temp-mail/issues
