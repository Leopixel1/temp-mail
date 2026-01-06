# 🎯 Feature Overview

## What Users Can Do

### 📧 Email Management
- **Create Temporary Inboxes**: Generate random or custom email addresses instantly
- **Receive Emails**: All emails sent to your address appear automatically
- **View Emails**: Read HTML and plain text emails with full formatting
- **Manage Attachments**: View attachment details (up to 5MB each)
- **Auto-Refresh**: Email list updates every 10 seconds automatically
- **Delete Emails**: Remove individual emails or entire inboxes
- **Copy Address**: One-click copy email address to clipboard

### 🔐 Account Features
- **Secure Registration**: Create account with email and password
- **Approval System**: Admin approves new accounts before access
- **Personal Dashboard**: Clean interface showing all your inboxes
- **Multiple Inboxes**: Create up to 5 inboxes (default, configurable by admin)
- **Privacy**: Only see your own emails and inboxes

## What Admins Can Do

### 👥 User Management
- **Approve Registrations**: Review and approve new user accounts
- **Manage Users**: Activate, deactivate, or delete user accounts
- **Set Custom Limits**: Override global limits per user
  - Maximum inboxes
  - Maximum emails per inbox
  - Custom retention time
- **View Activity**: See user statistics and inbox counts

### ⚙️ System Configuration
- **Access Control**
  - Toggle login requirement ON/OFF
  - Open or close registration
- **Email Retention**
  - Set global retention time (10min to 7 days)
  - Choose deletion policy (block or auto-delete old emails)
- **User Limits**
  - Default max inboxes per user
  - Default max emails per inbox
- **Real-Time Updates**: All changes apply immediately

### 📊 Statistics Dashboard
- **User Metrics**
  - Total users
  - Active users
  - Recent logins (24h)
- **Email Metrics**
  - Total inboxes
  - Total emails stored
  - Emails received per day (7-day chart)
- **Activity Tracking**
  - Login events
  - Failed attempts
  - User behavior

### 🗂️ Inbox Overview
- **View All Inboxes**: See every inbox in the system
- **Email Counts**: Check how many emails each inbox has
- **User Information**: See which user owns each inbox
- **Admin Delete**: Remove any inbox regardless of owner

## Technical Features

### 🔒 Security
- **Password Protection**: Bcrypt hashing with 10 salt rounds
- **JWT Authentication**: Secure token-based login sessions
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All data validated before processing
- **SQL Injection Protection**: Parameterized queries via Prisma ORM
- **XSS Protection**: Security headers and content sanitization
- **Role-Based Access**: Admin and user role separation
- **Attachment Validation**: Size and type restrictions

### 📮 Mail System
- **Catch-All SMTP**: Receives emails to any address @yourdomain
- **Full Email Storage**: 
  - Sender address
  - Recipient address
  - Subject line
  - Plain text body
  - HTML body
  - Attachments (base64 encoded)
  - Timestamp
- **Format Support**: Both HTML and plain text rendering
- **Attachment Handling**: Files up to 5MB each
- **System Protection**: Filters system addresses (postmaster, abuse, etc.)

### 🔄 Automation
- **Auto-Cleanup**: Hourly cron job removes old emails
- **Retention Enforcement**: Automatically deletes emails older than retention time
- **Limit Enforcement**: 
  - Blocks new emails when limit reached, OR
  - Automatically deletes oldest email
- **Health Checks**: Services monitor each other
- **Auto-Restart**: Services automatically recover from crashes

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Real-Time**: Auto-refresh keeps inbox current
- **Fast**: React with optimized rendering
- **Accessible**: Clear navigation and actions
- **Color-Coded**: Visual indicators for status and actions

## Retention Time Options

Administrators can choose from:
- **10 minutes**: Ultra-temporary (0.17 hours)
- **1 hour**: Very short-term
- **3 hours**: Short-term
- **24 hours**: One day
- **3 days**: Default, recommended (72 hours)
- **7 days**: Extended retention (168 hours)

Each user can have a custom retention time that overrides the global setting.

## Limits & Capacity

### Default Limits (Configurable)
- **Inboxes per user**: 5
- **Emails per inbox**: 50
- **Attachment size**: 5MB per file
- **Total email size**: 10MB

### Supported File Types
- Images (all formats)
- Documents (PDF, Word, Excel)
- Text files
- Archives (ZIP)

### Scalability
- **Users**: No hard limit, scales with resources
- **Emails**: Auto-cleaned based on retention
- **Storage**: Depends on disk space and retention policy

## Browser Support

### Desktop
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile
- ✅ iOS Safari 14+
- ✅ Chrome Mobile
- ✅ Firefox Mobile
- ✅ Samsung Internet

## API Capabilities

### Public Endpoints
- Login
- Registration

### User Endpoints (Authenticated)
- List inboxes
- Create inbox
- Get inbox with emails
- Delete inbox
- Get email details
- Delete email

### Admin Endpoints (Admin Only)
- User management
- System settings
- Statistics
- Inbox overview

All endpoints support:
- JSON request/response
- JWT authentication
- Rate limiting
- Input validation
- Error handling

## Performance

### Response Times
- **Login**: < 500ms
- **Create Inbox**: < 200ms
- **View Emails**: < 300ms
- **Email Reception**: < 1s from SMTP to database

### Resource Usage
- **Backend**: ~100-200MB RAM
- **Frontend**: ~50MB RAM (Nginx)
- **Database**: ~50-100MB RAM + storage
- **Mail Server**: ~50-100MB RAM

### Concurrent Users
- **Light load**: 50+ concurrent users
- **Medium load**: 100+ concurrent users
- **Heavy load**: Requires scaling (horizontal ready)

## Deployment Options

### Single Server
- All services on one machine
- Smallest footprint
- Easy maintenance
- Good for small teams

### Multi-Server
- Database on separate server
- Backend scaled horizontally
- Load balancer in front
- High availability

### Cloud Platforms
- ✅ AWS EC2
- ✅ Google Cloud Platform
- ✅ DigitalOcean
- ✅ Hetzner
- ✅ Any VPS provider

### Container Orchestration
- ✅ Docker Compose (default)
- ✅ Docker Swarm (with modifications)
- ✅ Kubernetes (manifests available on request)

## Monitoring & Logs

### Available Logs
- **Application logs**: Backend operations
- **Mail logs**: Email reception and processing
- **Database logs**: Query performance
- **Access logs**: HTTP requests
- **Error logs**: Exceptions and failures

### Monitoring Points
- Container health
- Database connections
- Email throughput
- User activity
- System resources

### Backup & Recovery
- Database backup via pg_dump
- Configuration backup (.env)
- Scheduled backups via cron
- Point-in-time recovery
- Disaster recovery procedures

## Upgrade Path

### Current Version: 1.0.0
- ✅ Core functionality complete
- ✅ Production ready
- ✅ Security hardened
- ✅ Fully documented

### Potential Future Features
- WebSocket for real-time updates
- Email search functionality
- Advanced filtering rules
- Multiple domain support
- Email forwarding
- IMAP/POP3 access
- Mobile apps
- Two-factor authentication
- Audit logging
- Advanced analytics

## Getting Started

1. **Install**: `sudo bash installer/install.sh`
2. **Configure DNS**: Add A and MX records
3. **Access**: Open browser to your domain
4. **Login**: Use admin credentials from installation
5. **Create Inbox**: Generate your first temp email
6. **Test**: Send an email to verify

## Support & Community

- 📖 Documentation: See `docs/` directory
- 🐛 Bug Reports: GitHub Issues
- 💡 Feature Requests: GitHub Issues
- 🤝 Contributing: See CONTRIBUTING.md
- 📧 Security Issues: Contact maintainers

---

**Ready to host your own temporary mail system!** 🚀
