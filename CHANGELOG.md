# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-06

### Added

#### Backend
- Complete RESTful API with Express and TypeScript
- JWT-based authentication system
- User registration with admin approval workflow
- Inbox management (create, list, delete)
- Email receiving and storage
- Admin API endpoints for user management
- Admin API endpoints for system settings
- Statistics and monitoring endpoints
- Prisma ORM integration with PostgreSQL
- Automated email cleanup with node-cron
- Password hashing with bcrypt
- Rate limiting for API protection
- Input validation with express-validator
- Security headers with Helmet.js
- Email processing script for Postfix integration

#### Frontend
- React + Vite application with TypeScript
- User authentication UI (login, registration)
- User dashboard with inbox management
- Email viewer with HTML rendering
- Attachment display support
- Admin dashboard with comprehensive controls
- User management interface
- System settings configuration
- Statistics and charts display
- Auto-refresh functionality (10-second polling)
- Responsive design for mobile devices
- Custom CSS styling
- API client with Axios
- JWT token management

#### Database
- PostgreSQL schema with Prisma
- Users table with authentication and limits
- Inboxes table for temporary addresses
- Emails table with full content storage
- Login events tracking
- System settings storage
- Indexed queries for performance
- Cascading deletes for data integrity

#### Mail Server
- Postfix catch-all configuration
- Email forwarding to backend processor
- Virtual alias mapping
- Production-ready SMTP settings
- Message size limits
- Rate limiting
- Security configurations

#### Deployment
- Docker containers for all services
- Docker Compose orchestration
- Multi-stage Docker builds
- Nginx reverse proxy for frontend
- Health checks for services
- Automatic service restart
- Volume persistence for data
- Environment-based configuration

#### Installation
- Interactive installer script (install.sh)
- Automated dependency installation
- Configuration wizard
- Password generation
- Service startup automation
- Post-installation information display

#### Documentation
- Comprehensive README with setup guide
- Quick start guide
- Admin guide with best practices
- Deployment guide for various platforms
- API documentation with examples
- Contributing guidelines
- Project summary
- Example environment configuration
- Troubleshooting guides

#### Security
- Password hashing with bcrypt (10 rounds)
- JWT tokens with secure secrets
- Rate limiting (100 req/15min)
- Input validation on all endpoints
- SQL injection protection via Prisma
- XSS protection with Helmet
- CORS configuration
- Email content sandboxing
- Role-based access control
- Login event tracking

#### Features
- Multiple inboxes per user
- Random or custom email addresses
- Email retention policies
- Per-user limits (inboxes, emails)
- Global system settings
- Admin approval for new users
- User activation/deactivation
- Email auto-deletion
- Attachment support
- HTML and plain text emails
- Mobile-responsive interface

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- N/A (Initial release)

## [Unreleased]

### Planned Features
- WebSocket support for real-time updates
- Email search functionality
- Email filtering and rules
- Multiple domain support
- Email forwarding capability
- API keys for programmatic access
- Kubernetes deployment manifests
- Prometheus metrics export
- Grafana dashboard templates
- Mobile application
- IMAP/POP3 support
- Email templates
- Two-factor authentication
- Audit logging
- Backup/restore utilities
- Migration tools

---

For more details, see the [releases page](https://github.com/Leopixel1/temp-mail/releases).
