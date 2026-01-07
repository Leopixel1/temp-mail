import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function initializeDatabase() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('Database connected');

    // Check if system settings exist, create default if not
    const settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      await prisma.systemSettings.create({
        data: {
          loginRequired: process.env.LOGIN_REQUIRED === 'true',
          registrationOpen: process.env.REGISTRATION_OPEN === 'true',
          defaultRetentionHours: parseInt(process.env.DEFAULT_RETENTION_HOURS || '72'),
          maxInboxesPerUser: parseInt(process.env.MAX_INBOXES_PER_USER || '5'),
          maxEmailsPerInbox: parseInt(process.env.MAX_EMAILS_PER_INBOX || '50'),
          deleteOldOnLimit: process.env.DELETE_OLD_ON_LIMIT === 'true'
        }
      });
      console.log('Default system settings created');
    }

    // Check if admin user exists, create if not
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      const adminExists = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (!adminExists) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true,
            isApproved: true,
            isActive: true
          }
        });
        console.log(`Admin user created: ${adminEmail}`);
      }
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
