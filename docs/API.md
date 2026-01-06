# API Documentation

## Base URL
```
http://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login to the system.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "isAdmin": false,
    "isApproved": true,
    "isActive": true
  }
}
```

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Registration successful. Awaiting admin approval.",
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "isApproved": false
  }
}
```

### Inbox Management

#### GET /inbox
Get all inboxes for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "address": "random123@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "emails": 5
    }
  }
]
```

#### POST /inbox
Create a new inbox.

**Request (optional custom address):**
```json
{
  "customAddress": "myinbox"
}
```

**Response:**
```json
{
  "id": "uuid",
  "address": "myinbox@example.com",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /inbox/:id
Get a specific inbox with all emails.

**Response:**
```json
{
  "id": "uuid",
  "address": "myinbox@example.com",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "emails": [
    {
      "id": "uuid",
      "from": "sender@example.com",
      "subject": "Test Email",
      "receivedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### DELETE /inbox/:id
Delete an inbox and all its emails.

**Response:**
```json
{
  "message": "Inbox deleted successfully"
}
```

### Email Management

#### GET /email/:id
Get a specific email with full details.

**Response:**
```json
{
  "id": "uuid",
  "inboxId": "uuid",
  "from": "sender@example.com",
  "to": "myinbox@example.com",
  "subject": "Test Email",
  "textBody": "Plain text content",
  "htmlBody": "<html>HTML content</html>",
  "attachments": [
    {
      "filename": "document.pdf",
      "contentType": "application/pdf",
      "size": 12345,
      "content": "base64-encoded-content"
    }
  ],
  "receivedAt": "2024-01-01T00:00:00.000Z"
}
```

#### DELETE /email/:id
Delete a specific email.

**Response:**
```json
{
  "message": "Email deleted successfully"
}
```

### Admin Endpoints

All admin endpoints require admin role.

#### GET /admin/users
Get all users.

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "isAdmin": false,
    "isApproved": true,
    "isActive": true,
    "maxInboxes": 5,
    "maxEmails": 50,
    "retentionHours": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "inboxes": 2
    }
  }
]
```

#### GET /admin/users/:id
Get specific user details.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "isAdmin": false,
  "isApproved": true,
  "isActive": true,
  "maxInboxes": 5,
  "maxEmails": 50,
  "retentionHours": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "inboxes": [
    {
      "id": "uuid",
      "address": "inbox@example.com",
      "_count": {
        "emails": 3
      }
    }
  ],
  "loginEvents": [
    {
      "id": "uuid",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "ipAddress": "192.168.1.1",
      "success": true
    }
  ]
}
```

#### PATCH /admin/users/:id
Update user settings.

**Request:**
```json
{
  "isApproved": true,
  "isActive": true,
  "maxInboxes": 10,
  "maxEmails": 100,
  "retentionHours": 48
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "isAdmin": false,
  "isApproved": true,
  "isActive": true,
  "maxInboxes": 10,
  "maxEmails": 100,
  "retentionHours": 48
}
```

#### DELETE /admin/users/:id
Delete a user account.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

#### GET /admin/inboxes
Get all inboxes (admin view).

**Response:**
```json
[
  {
    "id": "uuid",
    "address": "inbox@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "_count": {
      "emails": 5
    }
  }
]
```

#### DELETE /admin/inboxes/:id
Delete any inbox (admin).

**Response:**
```json
{
  "message": "Inbox deleted successfully"
}
```

#### GET /admin/settings
Get system settings.

**Response:**
```json
{
  "id": "uuid",
  "loginRequired": true,
  "registrationOpen": false,
  "defaultRetentionHours": 72,
  "maxInboxesPerUser": 5,
  "maxEmailsPerInbox": 50,
  "deleteOldOnLimit": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /admin/settings
Update system settings.

**Request:**
```json
{
  "loginRequired": true,
  "registrationOpen": false,
  "defaultRetentionHours": 48,
  "maxInboxesPerUser": 10,
  "maxEmailsPerInbox": 100,
  "deleteOldOnLimit": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "loginRequired": true,
  "registrationOpen": false,
  "defaultRetentionHours": 48,
  "maxInboxesPerUser": 10,
  "maxEmailsPerInbox": 100,
  "deleteOldOnLimit": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /admin/stats
Get system statistics.

**Response:**
```json
{
  "totalUsers": 10,
  "activeUsers": 8,
  "totalInboxes": 25,
  "totalEmails": 150,
  "recentLogins": 15,
  "emailsByDay": [
    {
      "date": "2024-01-01",
      "count": "20"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Returns 429 status when exceeded
- Wait for the window to expire or adjust limits in configuration
