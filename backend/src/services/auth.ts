import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const JWT_EXPIRES_IN = '24h';

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function loginUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    await prisma.loginEvent.create({
      data: {
        userId: 'unknown',
        success: false,
        ipAddress,
        userAgent
      }
    }).catch(() => {}); // Ignore error if userId doesn't exist
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await comparePassword(password, user.password);
  
  await prisma.loginEvent.create({
    data: {
      userId: user.id,
      success: isValidPassword,
      ipAddress,
      userAgent
    }
  });

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  if (!user.isApproved) {
    throw new Error('Account pending approval');
  }

  if (!user.isActive) {
    throw new Error('Account deactivated');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isApproved: user.isApproved,
      isActive: user.isActive
    }
  };
}

export async function registerUser(email: string, password: string) {
  const settings = await prisma.systemSettings.findFirst();
  
  if (settings && !settings.registrationOpen) {
    throw new Error('Registration is closed');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isApproved: false,
      maxInboxes: settings?.maxInboxesPerUser || 5,
      maxEmails: settings?.maxEmailsPerInbox || 50
    }
  });

  return {
    id: user.id,
    email: user.email,
    isApproved: user.isApproved
  };
}
