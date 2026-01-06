# Contributing to Temp Mail

Thank you for your interest in contributing to Temp Mail! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions on topic

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- Code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/temp-mail.git
   cd temp-mail
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/Leopixel1/temp-mail.git
   ```

## Development Setup

### Backend Development

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with development settings
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Full Stack Development

```bash
# Start database only
docker-compose up -d postgres

# Run backend locally
cd backend
npm run dev

# Run frontend locally (in another terminal)
cd frontend
npm run dev
```

### Database Migrations

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

## Making Changes

### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Performance: `perf/description`

Example:
```bash
git checkout -b feature/add-email-forwarding
```

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

Example:
```
feat: add email forwarding functionality

- Add forwarding field to inbox model
- Implement forwarding in email receiver
- Add UI for configuring forwarding
```

### Code Quality

Before committing:

1. **Format code**:
   ```bash
   # Backend
   cd backend
   npm run format  # if available
   
   # Frontend
   cd frontend
   npm run format  # if available
   ```

2. **Run linter**:
   ```bash
   npm run lint
   ```

3. **Run tests** (if available):
   ```bash
   npm test
   ```

## Submitting Changes

### Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push changes**:
   ```bash
   git push origin feature/your-feature
   ```

3. **Create Pull Request**:
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for new code
- Use async/await over callbacks
- Handle errors properly
- Add JSDoc comments for functions
- Use meaningful variable names

Example:
```typescript
/**
 * Creates a new inbox for the user
 * @param userId - The user's unique identifier
 * @param customAddress - Optional custom address prefix
 * @returns The created inbox
 */
async function createInbox(
  userId: string, 
  customAddress?: string
): Promise<Inbox> {
  // Implementation
}
```

### React/Frontend

- Use functional components
- Use hooks for state management
- Keep components small and focused
- Use TypeScript interfaces for props
- Handle loading and error states

Example:
```typescript
interface InboxListProps {
  inboxes: Inbox[];
  onSelect: (inbox: Inbox) => void;
}

function InboxList({ inboxes, onSelect }: InboxListProps) {
  // Implementation
}
```

### Database

- Use Prisma schema for models
- Create migrations for schema changes
- Index frequently queried fields
- Use transactions for related changes

### API Design

- Use RESTful conventions
- Version APIs if breaking changes
- Validate all inputs
- Return consistent error formats
- Document all endpoints

### Security

- Never commit secrets
- Validate and sanitize inputs
- Use parameterized queries
- Hash passwords with bcrypt
- Implement rate limiting
- Follow OWASP guidelines

## Project Structure

```
temp-mail/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utilities
│   └── prisma/            # Database schema
├── frontend/
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       └── utils/         # Utilities
├── postfix/               # Mail server config
├── installer/             # Installation scripts
└── docs/                  # Documentation
```

## Testing

### Backend Tests (example)

```typescript
describe('Inbox Service', () => {
  it('should create inbox with random address', async () => {
    const inbox = await createInbox(userId);
    expect(inbox.address).toMatch(/@example.com$/);
  });
});
```

### Frontend Tests (example)

```typescript
describe('InboxList', () => {
  it('renders inbox addresses', () => {
    render(<InboxList inboxes={mockInboxes} onSelect={jest.fn()} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
```

## Documentation

Update docs when:
- Adding new features
- Changing behavior
- Adding configuration options
- Fixing bugs (if not obvious)

Documentation locations:
- README.md - Overview and basic usage
- docs/API.md - API endpoints
- docs/ADMIN_GUIDE.md - Admin features
- docs/DEPLOYMENT.md - Deployment instructions

## Need Help?

- 💬 Open a discussion for questions
- 🐛 Open an issue for bugs
- 💡 Open an issue for feature requests
- 📧 Contact maintainers for security issues

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in commit messages

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Temp Mail! 🎉
