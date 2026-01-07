# Quick Start Guide

Get your temp mail system running in 5 minutes!

## Prerequisites

- Linux server (Ubuntu 22.04+)
- Root/sudo access
- Domain name
- 2GB RAM minimum

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/Leopixel1/temp-mail.git
cd temp-mail
```

### 2. Run Installer

```bash
sudo bash installer/install.sh
```

### 3. Answer Prompts

The installer will ask:

**Domain**: Enter your domain (e.g., `mail.example.com`)
```
Enter your domain: mail.example.com
```

**Admin Email**: Your admin login email
```
Enter admin email: admin@example.com
```

**Admin Password**: Leave empty to auto-generate
```
Enter admin password (leave empty to generate): [press Enter]
Generated admin password: XyZ123AbC456...
```

**Retention Time**: Choose email lifetime
```
Select default email retention time:
1) 10 minutes
2) 1 hour
3) 3 hours
4) 24 hours
5) 3 days (72 hours)  ← Recommended
6) 7 days
Choose (1-6) [default: 5]: 5
```

**Limits**: Set user restrictions
```
Max inboxes per user [default: 5]: 5
Max emails per inbox [default: 50]: 50
```

**Registration**: Allow new users?
```
Allow open registration? (y/N): n
```

### 4. Wait for Installation

The installer will:
- ✅ Install Docker & Docker Compose
- ✅ Generate secure passwords
- ✅ Create configuration files
- ✅ Build containers
- ✅ Start services

### 5. Configure DNS

**IMPORTANT**: Add these DNS records at your domain provider:

```
Type    Name    Value               Priority
A       mail    YOUR_SERVER_IP      -
MX      @       mail.example.com    10
```

Replace:
- `mail` with your subdomain
- `YOUR_SERVER_IP` with your server's IP address

**Wait 5-15 minutes for DNS propagation**

### 6. Access Your System

Open browser: `http://mail.example.com` (or your domain)

Login with:
- **Email**: The admin email you provided
- **Password**: The generated/chosen password

## Quick Test

### Test Web Access

1. Go to your domain in browser
2. Login with admin credentials
3. Create an inbox
4. Copy the generated email address

### Test Email Reception

Send a test email:
```bash
# From any system with mail command
echo "Test message" | mail -s "Test" your-inbox@mail.example.com
```

Or use an online SMTP tester.

Check your inbox in the web interface - email should appear within seconds!

## Next Steps

### Secure Your System

1. **Enable HTTPS** (recommended for production):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d mail.example.com
   ```

2. **Configure Firewall**:
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 25/tcp   # SMTP
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   ```

3. **Setup Backups**:
   ```bash
   # Manual backup
   docker-compose exec postgres pg_dump -U tempmail tempmail > backup.sql
   
   # Automated backups (see docs/DEPLOYMENT.md)
   ```

### Explore Admin Panel

Access at: `http://mail.example.com/admin`

Features:
- 👥 **User Management**: Approve registrations, manage users
- ⚙️ **Settings**: Configure system behavior
- 📊 **Statistics**: Monitor usage and activity

### Allow Users to Register (Optional)

1. Go to Admin Panel → Settings
2. Toggle "Registration Open" to ON
3. Users can now register
4. You must approve each new user

## Common Issues

### Can't Access Web Interface

**Problem**: Connection refused or timeout

**Solutions**:
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### Emails Not Received

**Problem**: Sent emails don't appear

**Solutions**:
1. Verify DNS MX records are set correctly
2. Check if port 25 is open:
   ```bash
   sudo netstat -tlnp | grep :25
   ```
3. Check Postfix logs:
   ```bash
   docker-compose logs -f postfix
   ```
4. Test SMTP connection:
   ```bash
   telnet mail.example.com 25
   ```

### Forgot Admin Password

**Reset via database**:
```bash
# Generate new password hash
docker-compose exec backend node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('new-password', 10).then(hash => console.log(hash));
"

# Update in database
docker-compose exec postgres psql -U tempmail tempmail
UPDATE users SET password='PASTE_HASH_HERE' WHERE email='admin@example.com';
\q
```

### Container Won't Start

**Check logs**:
```bash
docker-compose logs backend
docker-compose logs postgres
docker-compose logs postfix
```

**Common fixes**:
```bash
# Remove and recreate
docker-compose down
docker-compose up -d

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

## Management Commands

```bash
# View logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Stop services
docker-compose stop

# Start services
docker-compose start

# Update and rebuild
git pull
docker-compose up -d --build

# Complete removal (⚠️ deletes data!)
docker-compose down -v
```

## Default Credentials

**Admin Email**: What you entered during installation
**Admin Password**: Check installation output or `.env` file

To view saved credentials:
```bash
grep -E "ADMIN_EMAIL|ADMIN_PASSWORD" .env
```

## System Requirements

### Minimum
- 1 CPU core
- 2GB RAM
- 10GB disk space
- Ubuntu 20.04+

### Recommended
- 2+ CPU cores
- 4GB RAM
- 20GB+ disk space
- Ubuntu 22.04 LTS

## Port Requirements

| Port | Service | Required |
|------|---------|----------|
| 25   | SMTP    | Yes      |
| 80   | HTTP    | Yes      |
| 443  | HTTPS   | Recommended |

## Getting Help

- 📖 Full documentation: `README.md`
- 🔧 Admin guide: `docs/ADMIN_GUIDE.md`
- 🚀 Deployment guide: `docs/DEPLOYMENT.md`
- 🐛 Issues: https://github.com/Leopixel1/temp-mail/issues

## Performance Tips

- Use SSD storage for better database performance
- Enable HTTPS for security
- Set up automated backups
- Monitor resource usage with `docker stats`
- Adjust retention time based on usage

## Security Checklist

- [ ] Admin password is strong and unique
- [ ] JWT_SECRET is randomly generated
- [ ] Firewall is configured
- [ ] HTTPS is enabled
- [ ] Registration requires approval
- [ ] Regular backups are configured
- [ ] System is kept updated

## What's Next?

1. **Customize Settings**: Adjust limits and retention in admin panel
2. **Add Users**: Enable registration or create users manually
3. **Monitor Usage**: Check statistics in admin dashboard
4. **Setup Backups**: Configure automated database backups
5. **Optimize**: Tune settings based on your usage patterns

---

**Congratulations!** 🎉 Your self-hosted temp mail system is ready!

Need help? Check the full documentation in the `docs/` folder or open an issue on GitHub.
