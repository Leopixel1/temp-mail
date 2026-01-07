# Admin Guide - Temp Mail System

This guide covers administrative tasks and best practices for managing your temp mail system.

## Initial Setup

### First Login

1. Use the admin credentials provided during installation
2. Navigate to `/admin` after logging in
3. Review system settings and adjust as needed

### Recommended Initial Configuration

1. **Registration Settings**
   - Keep registration closed initially
   - Test the system thoroughly
   - Enable registration when ready

2. **Retention Policy**
   - Start with 72 hours (3 days)
   - Adjust based on usage patterns
   - Monitor disk usage

3. **User Limits**
   - Default: 5 inboxes per user
   - Default: 50 emails per inbox
   - Adjust based on server resources

## User Management

### Approving New Users

1. Go to Admin Dashboard → Users
2. Find users with "Pending" status
3. Click "Approve" to activate
4. Users will receive access immediately

### Managing User Limits

#### Per-User Limits

Click "Edit Limits" for a specific user to set:
- Maximum number of inboxes
- Maximum emails per inbox
- Custom retention time (overrides default)

#### Global Limits

In Settings tab, configure defaults for:
- All new users
- Existing users (if not overridden)

### Deactivating Users

1. Click "Deactivate" on user row
2. User loses access immediately
3. Data remains intact
4. Can be reactivated later

### Deleting Users

⚠️ **Warning**: This permanently deletes:
- User account
- All user's inboxes
- All emails in those inboxes

Cannot delete your own admin account.

## System Settings

### Access Control

#### Login Required
- **ON**: Users must log in to use the system
- **OFF**: Anonymous access allowed (not recommended)

#### Registration Open
- **ON**: Anyone can register (requires admin approval)
- **OFF**: Only admins can create accounts

### Email Retention

#### Default Retention Time
Global setting for all emails:
- **10 minutes**: Ultra-short (0.17 hours)
- **1 hour**: Very temporary
- **3 hours**: Short-term
- **24 hours**: Daily use
- **72 hours**: Recommended default
- **168 hours**: Extended (7 days)

#### Delete Old on Limit
When inbox reaches email limit:
- **ON**: Delete oldest email automatically
- **OFF**: Block new emails until user cleans up

### User Limits

#### Max Inboxes Per User
Default number of inboxes new users can create:
- Recommended: 5-10 for regular users
- Can be overridden per user

#### Max Emails Per Inbox
Maximum emails stored per inbox:
- Recommended: 50-100
- Higher values require more disk space
- Can be overridden per user

## Monitoring

### Statistics Dashboard

View real-time metrics:
- **Total Users**: All registered accounts
- **Active Users**: Currently enabled accounts
- **Total Inboxes**: All temporary addresses
- **Total Emails**: Stored messages
- **Recent Logins**: Authentication events (24h)

### Email Activity

Chart shows emails received per day for the last 7 days:
- Monitor traffic patterns
- Detect unusual activity
- Plan capacity

### Login Events

Track authentication:
- Successful logins
- Failed attempts (security monitoring)
- IP addresses and user agents

## Maintenance

### Database Cleanup

Automatic cleanup runs hourly to:
- Delete emails older than retention time
- Remove excess emails from full inboxes
- Free up disk space

Manual cleanup:
```bash
docker-compose exec backend npm run cleanup
```

### Disk Space Management

Monitor disk usage:
```bash
# Check Docker volumes
docker system df -v

# Check PostgreSQL size
docker-compose exec postgres psql -U tempmail -c "SELECT pg_size_pretty(pg_database_size('tempmail'));"
```

Clean up if needed:
```bash
# Remove old Docker images
docker image prune -a

# Clean up unused volumes (⚠️ careful!)
docker volume prune
```

### Log Management

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postfix
docker-compose logs -f frontend
```

Limit log size in `docker-compose.yml`:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Security Best Practices

### Password Management

1. **Admin Password**
   - Use strong, unique password
   - Change regularly
   - Store securely (password manager)

2. **JWT Secret**
   - Generate random, complex secret
   - Never commit to version control
   - Rotate periodically

3. **Database Password**
   - Auto-generated during installation
   - Stored in `.env` file
   - Backup securely

### Rate Limiting

Default settings (in `.env`):
```bash
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per window
```

Adjust if experiencing:
- Legitimate users blocked: Increase MAX_REQUESTS
- Bot attacks: Decrease MAX_REQUESTS or WINDOW_MS

### Firewall Configuration

Restrict access:
```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 25/tcp  # SMTP
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

For production, consider:
- Cloudflare protection
- Fail2ban for SSH
- Geographic restrictions

## Backup Strategy

### Daily Backups

Create automated backup script:

```bash
#!/bin/bash
BACKUP_DIR="/backups/tempmail"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U tempmail tempmail | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup configuration
cp .env $BACKUP_DIR/env_$DATE.backup

# Remove backups older than 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "env_*.backup" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup-script.sh >> /var/log/tempmail-backup.log 2>&1
```

### Restore Procedure

1. **Stop services**
```bash
docker-compose stop
```

2. **Restore database**
```bash
gunzip < backup.sql.gz | docker-compose exec -T postgres psql -U tempmail tempmail
```

3. **Restore configuration**
```bash
cp env_backup .env
```

4. **Start services**
```bash
docker-compose start
```

## Troubleshooting

### Common Issues

#### Users Can't Receive Emails

1. Check DNS MX records
2. Verify Postfix is running
3. Check Postfix logs for errors
4. Test with telnet:
```bash
telnet mail.example.com 25
```

#### High Disk Usage

1. Check retention settings
2. Run manual cleanup
3. Review inbox limits
4. Consider lowering retention time

#### Performance Issues

1. Check resource usage:
```bash
docker stats
```

2. Increase server resources if needed
3. Optimize database:
```bash
docker-compose exec postgres vacuumdb -U tempmail -d tempmail -z -v
```

#### Users Locked Out

1. Check if account is approved
2. Verify account is active
3. Check login events for failed attempts
4. Reset password if needed (requires database access)

### Getting Help

1. Check logs for errors
2. Review documentation
3. Open GitHub issue with:
   - Error messages
   - Steps to reproduce
   - System information
   - Logs (sanitized)

## Performance Tuning

### PostgreSQL Optimization

Edit `docker-compose.yml` to add:
```yaml
postgres:
  command: 
    - "postgres"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "max_connections=100"
    - "-c"
    - "work_mem=4MB"
```

### Postfix Optimization

For high volume, edit `postfix/main.cf`:
```conf
# Increase concurrent connections
default_process_limit = 100
smtpd_client_connection_count_limit = 50
```

### Node.js Optimization

For production, add to backend environment:
```yaml
backend:
  environment:
    NODE_OPTIONS: "--max-old-space-size=2048"
```

## Monitoring Tools

### Set Up Monitoring (Optional)

Consider adding:

1. **Prometheus + Grafana**: Metrics and dashboards
2. **Uptime Kuma**: Uptime monitoring
3. **Netdata**: Real-time system monitoring

Example addition to `docker-compose.yml`:
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
  depends_on:
    - prometheus
```

## Updating the System

### Before Updating

1. **Backup everything**
2. **Test in staging** if possible
3. **Note current version**
4. **Review changelog**

### Update Process

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose build --no-cache

# Stop old containers
docker-compose down

# Start new containers
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### Rollback Procedure

If update fails:
```bash
# Stop containers
docker-compose down

# Checkout previous version
git checkout <previous-tag>

# Rebuild and start
docker-compose build
docker-compose up -d
```

## Support and Resources

- **Documentation**: README.md
- **Configuration**: .env.example
- **Issues**: GitHub Issues
- **Community**: GitHub Discussions

---

**Remember**: Regular backups, monitoring, and updates keep your system secure and running smoothly!
