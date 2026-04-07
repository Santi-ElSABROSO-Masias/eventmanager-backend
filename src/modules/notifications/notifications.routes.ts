import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const notificationsController = new NotificationsController();

// Aquí inyectamos el middleware de autenticación para asegurar 'req.user'
router.use(authenticate);

router.get('/', notificationsController.getHistorial.bind(notificationsController));
router.patch('/:id/read', notificationsController.markAsRead.bind(notificationsController));

export default router;