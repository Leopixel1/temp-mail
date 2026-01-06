import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../services/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get specific email
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const email = await prisma.email.findUnique({
      where: { id: req.params.id },
      include: {
        inbox: true
      }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Check ownership
    if (email.inbox.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(email);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete email
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const email = await prisma.email.findUnique({
      where: { id: req.params.id },
      include: {
        inbox: true
      }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Check ownership
    if (email.inbox.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.email.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Email deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
