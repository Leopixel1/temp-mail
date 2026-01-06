import { prisma } from './database';

export async function cleanupOldEmails() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    if (!settings) return;

    // Get all users with their retention settings
    const users = await prisma.user.findMany({
      select: {
        id: true,
        retentionHours: true,
        inboxes: {
          select: {
            id: true,
            emails: {
              select: {
                id: true,
                receivedAt: true
              },
              orderBy: {
                receivedAt: 'desc'
              }
            }
          }
        }
      }
    });

    let totalDeleted = 0;

    for (const user of users) {
      const retentionHours = user.retentionHours || settings.defaultRetentionHours;
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - retentionHours);

      for (const inbox of user.inboxes) {
        // Delete old emails based on retention
        const deleted = await prisma.email.deleteMany({
          where: {
            inboxId: inbox.id,
            receivedAt: {
              lt: cutoffDate
            }
          }
        });

        totalDeleted += deleted.count;

        // Check if inbox exceeds email limit
        const emailCount = inbox.emails.length;
        const maxEmails = user.retentionHours !== null ? 
          await prisma.user.findUnique({ where: { id: user.id }, select: { maxEmails: true } })
            .then(u => u?.maxEmails || settings.maxEmailsPerInbox) 
          : settings.maxEmailsPerInbox;

        if (settings.deleteOldOnLimit && emailCount > maxEmails) {
          // Delete oldest emails over the limit
          const emailsToDelete = inbox.emails
            .slice(maxEmails)
            .map(e => e.id);
          
          if (emailsToDelete.length > 0) {
            const limitDeleted = await prisma.email.deleteMany({
              where: {
                id: {
                  in: emailsToDelete
                }
              }
            });
            totalDeleted += limitDeleted.count;
          }
        }
      }
    }

    console.log(`Cleanup complete: ${totalDeleted} emails deleted`);
    return totalDeleted;
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
}
