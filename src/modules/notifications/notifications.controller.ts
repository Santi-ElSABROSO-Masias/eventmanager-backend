import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';

const notificationsService = new NotificationsService();

export class NotificationsController {
    async getHistorial(req: Request, res: Response) {
        try {
            // Priorizamos req.user.email inyectado por el middleware de autenticación
            let userEmail = (req as any).user?.email;

            // Fallback temporal si el tipado o el middleware no inyecta el email directamente
            if (!userEmail && req.headers['user-email']) {
                // TODO: Fix Express Request typing for req.user
                userEmail = Array.isArray(req.headers['user-email']) 
                    ? req.headers['user-email'][0] 
                    : req.headers['user-email'];
            }
            
            if (!userEmail) {
                return res.status(401).json({ error: 'No autorizado - Email no encontrado' });
            }

            const notifications = await notificationsService.getUserNotifications(userEmail as string);
            return res.status(200).json(notifications);
        } catch (error: any) {
            console.error('[NotificationsController] Error getHistorial:', error);
            return res.status(500).json({ error: 'Error interno al obtener notificaciones' });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            let userEmail = (req as any).user?.email;

            if (!userEmail && req.headers['user-email']) {
                // TODO: Fix Express Request typing for req.user
                userEmail = Array.isArray(req.headers['user-email']) 
                    ? req.headers['user-email'][0] 
                    : req.headers['user-email'];
            }

            const { id } = req.params;

            if (!userEmail) {
                return res.status(401).json({ error: 'No autorizado - Email no encontrado' });
            }

            const updatedNotification = await notificationsService.markAsRead(id as string, userEmail as string);
            return res.status(200).json(updatedNotification);
        } catch (error: any) {
            console.error('[NotificationsController] Error markAsRead:', error);
            if (error.message === 'Notificación no encontrada o no autorizada') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Error interno al actualizar la notificación' });
        }
    }
}