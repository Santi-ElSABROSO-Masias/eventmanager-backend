import { Router } from 'express';
import { getNotifications, markAsRead } from './notifications.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
