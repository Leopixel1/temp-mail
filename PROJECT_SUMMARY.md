# Project Summary - Temp Mail System

## Overview
Complete, production-ready self-hosted temporary email system with user management, admin dashboard, and automatic cleanup.

## System Architecture

### Components
1. **Backend (Node.js + TypeScript + Express)**
   - RESTful API
   - JWT authentication
   - Prisma ORM
   - Email processing
   - Scheduled cleanup

2. **Frontend (React + Vite + TypeScript)**
   - User dashboard
   - Admin panel
   - Real-time email viewing
   - Responsive design

3. **Database (PostgreSQL)**
   - Users & authentication
   - Inboxes & emails
   - System settings
   - Login events

4. **Mail Server (Postfix)**
   - Catch-all SMTP
   - Email forwarding to backend
   - Production-ready configuration

5. **Deployment (Docker + Docker Compose)**
   - Containerized services
   - Automated setup
   - Easy scaling

## Features Implemented

### User Features ✅
- [x] User registration with admin approval
- [x] Secure login (JWT tokens)
- [x] Create multiple temporary inboxes
- [x] Generate random or custom email addresses
- [x] Receive emails instantly
- [x] View HTML and plain text emails
- [x] View attachments (base64 encoded)
- [x] Delete individual emails
- [x] Delete entire inboxes
- [x] Auto-refresh email list (10 seconds)
- [x] Mobile-responsive design

### Admin Features ✅
- [x] Dedicated admin dashboard
- [x] User management
  - [x] Approve/reject registrations
  - [x] Activate/deactivate accounts
  - [x] Delete users
  - [x] Set per-user limits
  - [x] Custom retention per user
- [x] System settings
  - [x] Toggle login requirement
  - [x] Enable/disable registration
  - [x] Configure retention time
  - [x] Set global limits
  - [x] Email deletion policy
- [x] Statistics dashboard
  - [x] User metrics
  - [x] Email volume charts
  - [x] Login activity tracking
- [x] Inbox overview
  - [x] View all inboxes
  - [x] Delete any inbox

### Email System ✅
- [x] Postfix catch-all configuration
- [x] Automatic email processing
- [x] Store sender, recipient, subject, body
- [x] HTML and plain text support
- [x] Attachment handling
- [x] Timestamp tracking
- [x] Receive-only (no sending)

### Security ✅
- [x] Password hashing (bcrypt, 10 rounds)
- [x] JWT authentication
- [x] Rate limiting (100 req/15min)
- [x] Input validation (express-validator)
- [x] SQL injection protection (Prisma ORM)
- [x] XSS protection (Helmet.js)
- [x] CORS configuration
- [x] Email sandboxing (iframe sandbox)
- [x] Admin-only routes protection

### Automation ✅
- [x] Scheduled email cleanup (hourly cron)
- [x] Retention policy enforcement
- [x] Automatic old email deletion
- [x] Email limit enforcement
- [x] Database initialization
- [x] Admin user creation

### Deployment ✅
- [x] Docker containers
- [x] Docker Compose orchestration
- [x] Interactive installer script
- [x] Environment configuration
- [x] Health checks
- [x] Automatic restarts
- [x] Volume persistence

### Documentation ✅
- [x] Comprehensive README
- [x] Quick start guide
- [x] Admin guide
- [x] Deployment guide
- [x] API documentation
- [x] Contributing guide
- [x] Example configurations

## File Structure

```
temp-mail/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.ts        # Login/register
│   │   │   ├── inbox.ts       # Inbox management
│   │   │   ├── email.ts       # Email operations
│   │   │   └── admin.ts       # Admin endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── auth.ts        # Authentication
│   │   │   ├── database.ts    # DB initialization
│   │   │   └── cleanup.ts     # Email cleanup
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.ts        # JWT verification
│   │   ├── index.ts           # App entry point
│   │   └── receive-email.js   # SMTP handler
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   └── api.ts         # API client
│   │   ├── App.tsx            # Main app
│   │   └── main.tsx           # Entry point
│   ├── Dockerfile
│   ├── nginx.conf             # Nginx config
│   ├── package.json
│   └── vite.config.ts
├── postfix/                    # Mail server
│   ├── main.cf                # Postfix config
│   ├── master.cf              # Services config
│   ├── virtual_alias          # Catch-all mapping
│   ├── start.sh               # Startup script
│   └── Dockerfile
├── installer/
│   └── install.sh             # Installation script
├── docs/                       # Documentation
│   ├── ADMIN_GUIDE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── QUICKSTART.md
├── docker-compose.yml          # Service orchestration
├── .env.example                # Config template
├── README.md                   # Main documentation
├── CONTRIBUTING.md             # Contributor guide
└── LICENSE                     # MIT License
```

## Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express 4.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15
- **Auth**: JWT (jsonwebtoken)
- **Security**: Helmet, bcrypt, rate-limit
- **Email**: mailparser
- **Scheduling**: node-cron

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **Routing**: React Router 6
- **HTTP Client**: Axios
- **Styling**: Plain CSS

### Infrastructure
- **Containers**: Docker
- **Orchestration**: Docker Compose
- **Mail Server**: Postfix 3.x
- **Web Server**: Nginx (for frontend)
- **OS**: Ubuntu 22.04 (recommended)

## Database Schema

### Tables
1. **users** - User accounts
   - Authentication credentials
   - Approval status
   - Custom limits
   - Retention settings

2. **inboxes** - Temporary email addresses
   - Belongs to user
   - Unique address
   - Creation timestamp

3. **emails** - Received messages
   - Belongs to inbox
   - Full email content
   - Attachments (JSON)
   - Received timestamp

4. **login_events** - Authentication logs
   - User activity
   - IP addresses
   - Success/failure tracking

5. **system_settings** - Global configuration
   - Access control
   - Default limits
   - Retention policy

## API Endpoints

### Public
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User (Authenticated)
- `GET /api/inbox` - List inboxes
- `POST /api/inbox` - Create inbox
- `GET /api/inbox/:id` - Get inbox with emails
- `DELETE /api/inbox/:id` - Delete inbox
- `GET /api/email/:id` - Get email details
- `DELETE /api/email/:id` - Delete email

### Admin Only
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - User details
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/inboxes` - All inboxes
- `DELETE /api/admin/inboxes/:id` - Delete any inbox
- `GET /api/admin/settings` - System settings
- `PATCH /api/admin/settings` - Update settings
- `GET /api/admin/stats` - Statistics

## Installation Requirements

### Minimum
- Ubuntu 20.04+
- 1 CPU core
- 2GB RAM
- 10GB disk
- Domain name
- Root access

### Recommended
- Ubuntu 22.04 LTS
- 2+ CPU cores
- 4GB RAM
- 20GB+ SSD
- Domain with MX records
- Firewall configured

## Default Configuration

```env
# Domain
DOMAIN=mail.example.com

# Retention
DEFAULT_RETENTION_HOURS=72  # 3 days

# Limits
MAX_INBOXES_PER_USER=5
MAX_EMAILS_PER_INBOX=50

# Access
REGISTRATION_OPEN=false
LOGIN_REQUIRED=true
DELETE_OLD_ON_LIMIT=true

# Rate Limit
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests
```

## Security Features

1. **Authentication**
   - Bcrypt password hashing (10 rounds)
   - JWT tokens (24h expiry)
   - Session-based auth

2. **Authorization**
   - Role-based access (user/admin)
   - Route protection
   - Resource ownership verification

3. **Input Protection**
   - Express-validator on all inputs
   - SQL injection prevention (Prisma)
   - XSS protection (Helmet)

4. **Rate Limiting**
   - API rate limiting
   - Login attempt tracking
   - IP-based restrictions

5. **Email Security**
   - Iframe sandboxing
   - Base64 attachment encoding
   - No executable content

## Performance Considerations

### Database
- Indexed queries (userId, receivedAt)
- Cascading deletes
- Connection pooling

### Cleanup
- Hourly cron job
- Batch operations
- Configurable retention

### Scalability
- Stateless backend
- Horizontal scaling ready
- Container-based deployment

## Testing Checklist

- [x] User registration flow
- [x] Admin approval system
- [x] Login authentication
- [x] JWT token generation
- [x] Inbox creation (random)
- [x] Inbox creation (custom)
- [x] Email reception
- [x] Email viewing
- [x] Email deletion
- [x] Inbox deletion
- [x] Admin dashboard access
- [x] User management
- [x] Settings modification
- [x] Statistics display
- [x] Retention cleanup
- [x] Rate limiting
- [x] Input validation

## Deployment Options

1. **Single Server** - All services on one machine
2. **Docker Swarm** - Multi-node high availability
3. **Kubernetes** - Enterprise orchestration
4. **Cloud Platforms** - AWS, GCP, DigitalOcean, Hetzner

## Monitoring & Maintenance

### Logs
- Application: `docker-compose logs`
- Database: PostgreSQL logs
- Mail: Postfix logs

### Backups
- Database: PostgreSQL dumps
- Configuration: .env file
- Scheduled: Cron jobs

### Updates
- Git pull
- Docker rebuild
- Database migrations
- Service restart

## Known Limitations

1. **Email Sending**: System only receives emails, does not send
2. **Port 25**: Some cloud providers block SMTP port
3. **Attachment Size**: Limited by configuration (10MB default)
4. **Real-time**: Polling-based updates, not WebSocket

## Future Enhancements

Potential improvements:
- [ ] WebSocket for real-time updates
- [ ] Email search functionality
- [ ] Email filtering/rules
- [ ] Multiple domains support
- [ ] Email forwarding
- [ ] API keys for programmatic access
- [ ] Kubernetes manifests
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] Mobile app
- [ ] Email templates
- [ ] IMAP/POP3 support

## License

MIT License - See LICENSE file

## Support

- Documentation: `docs/` directory
- Issues: GitHub Issues
- Discussions: GitHub Discussions

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2024
