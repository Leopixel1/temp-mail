import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { prisma } from '../services/database';
import { hashPassword } from '../services/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isAdmin: true,
        isApproved: true,
        isActive: true,
        maxInboxes: true,
        maxEmails: true,
        retentionHours: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            inboxes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific user
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        isApproved: true,
        isActive: true,
        maxInboxes: true,
        maxEmails: true,
        retentionHours: true,
        createdAt: true,
        updatedAt: true,
        inboxes: {
          include: {
            _count: {
              select: { emails: true }
            }
          }
        },
        loginEvents: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.patch('/users/:id',
  body('isApproved').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('maxInboxes').optional().isInt({ min: 0 }),
  body('maxEmails').optional().isInt({ min: 0 }),
  body('retentionHours').optional().isInt({ min: 1 }),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { isApproved, isActive, maxInboxes, maxEmails, retentionHours } = req.body;
      
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          ...(isApproved !== undefined && { isApproved }),
          ...(isActive !== undefined && { isActive }),
          ...(maxInboxes !== undefined && { maxInboxes }),
          ...(maxEmails !== undefined && { maxEmails }),
          ...(retentionHours !== undefined && { retentionHours })
        },
        select: {
          id: true,
          email: true,
          isAdmin: true,
          isApproved: true,
          isActive: true,
          maxInboxes: true,
          maxEmails: true,
          retentionHours: true
        }
      });

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Prevent deleting own account
    if (req.params.id === req.user!.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all inboxes (admin view)
router.get('/inboxes', async (req: AuthRequest, res: Response) => {
  try {
    const inboxes = await prisma.inbox.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        _count: {
          select: { emails: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inboxes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete inbox (admin)
router.delete('/inboxes/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.inbox.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Inbox deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get system settings
router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findFirst();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update system settings
router.patch('/settings',
  body('loginRequired').optional().isBoolean(),
  body('registrationOpen').optional().isBoolean(),
  body('defaultRetentionHours').optional().isInt({ min: 1 }),
  body('maxInboxesPerUser').optional().isInt({ min: 1 }),
  body('maxEmailsPerInbox').optional().isInt({ min: 1 }),
  body('deleteOldOnLimit').optional().isBoolean(),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const settings = await prisma.systemSettings.findFirst();
      
      if (!settings) {
        return res.status(404).json({ error: 'Settings not found' });
      }

      const updated = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: req.body
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, activeUsers, totalInboxes, totalEmails, recentLogins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.inbox.count(),
      prisma.email.count(),
      prisma.loginEvent.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    // Emails received per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const emailsByDay = await prisma.$queryRaw`
      SELECT DATE(received_at) as date, COUNT(*) as count
      FROM emails
      WHERE received_at >= ${sevenDaysAgo}
      GROUP BY DATE(received_at)
      ORDER BY DATE(received_at) DESC
    `;

    res.json({
      totalUsers,
      activeUsers,
      totalInboxes,
      totalEmails,
      recentLogins,
      emailsByDay
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
