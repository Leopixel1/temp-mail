import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../services/database';
import crypto from 'crypto';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List user's inboxes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const inboxes = await prisma.inbox.findMany({
      where: { userId: req.user!.userId },
      include: {
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

// Create new inbox
router.post('/',
  body('customAddress').optional().isString().trim(),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      
      // Check user limits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { inboxes: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.inboxes.length >= user.maxInboxes) {
        return res.status(400).json({ 
          error: `Maximum inbox limit reached (${user.maxInboxes})` 
        });
      }

      // Generate random address or use custom
      const domain = process.env.DOMAIN || 'example.com';
      let address: string;
      
      if (req.body.customAddress) {
        const custom = req.body.customAddress.toLowerCase();
        // Validate custom address format
        if (!/^[a-z0-9._-]+$/.test(custom)) {
          return res.status(400).json({ 
            error: 'Invalid address format. Use only lowercase letters, numbers, dots, hyphens, and underscores.' 
          });
        }
        address = `${custom}@${domain}`;
      } else {
        // Generate random address
        const randomPart = crypto.randomBytes(8).toString('hex');
        address = `${randomPart}@${domain}`;
      }

      // Check if address already exists
      const existingInbox = await prisma.inbox.findUnique({
        where: { address }
      });

      if (existingInbox) {
        return res.status(400).json({ error: 'Address already exists' });
      }

      const inbox = await prisma.inbox.create({
        data: {
          address,
          userId
        }
      });

      res.status(201).json(inbox);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get specific inbox
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const inbox = await prisma.inbox.findUnique({
      where: { id: req.params.id },
      include: {
        emails: {
          orderBy: { receivedAt: 'desc' },
          select: {
            id: true,
            from: true,
            subject: true,
            receivedAt: true
          }
        }
      }
    });

    if (!inbox) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    if (inbox.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(inbox);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete inbox
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const inbox = await prisma.inbox.findUnique({
      where: { id: req.params.id }
    });

    if (!inbox) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    if (inbox.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.inbox.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Inbox deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
