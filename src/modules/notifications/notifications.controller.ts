import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import prisma from '../../config/db';

const notificationsService = new NotificationsService();

export class NotificationsController {
    /**
     * Extrae el email del usuario con la siguiente prioridad:
     * 1. Header explicito 'user-email' remitido por el frontend.
     * 2. Busqueda en DB mediante el ID presente en el JWT decodificado.
     */
    private getUserEmail = async (req: Request): Promise<string | null> => {
        // Prioridad 1: Header
        const headerEmail = req.headers['user-email'];
        if (headerEmail) {
            return Array.isArray(headerEmail) ? headerEmail[0] : headerEmail;
        }

        // Prioridad 2: JWT ID -> DB Query
        const userId = (req as any).user?.id;
        if (userId) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { email: true }
                });
                return user?.email || null;
            } catch (error) {
                console.error('[NotificationsController] Error al buscar usuario por ID:', error);
                return null;
            }
        }

        return null;
    };

    getHistorial = async (req: Request, res: Response) => {
        try {
            const userEmail = await this.getUserEmail(req);
            
            if (!userEmail) {
                return res.status(401).json({ error: 'No autorizado - Email no encontrado' });
            }

            const notifications = await notificationsService.getUserNotifications(userEmail);
            return res.status(200).json(notifications);
        } catch (error: any) {
            console.error('[NotificationsController] Error getHistorial:', error);
            return res.status(500).json({ error: 'Error interno al obtener notificaciones' });
        }
    };

    markAsRead = async (req: Request, res: Response) => {
        try {
            const userEmail = await this.getUserEmail(req);
            const { id } = req.params;

            if (!userEmail) {
                return res.status(401).json({ error: 'No autorizado - Email no encontrado' });
            }

            const updatedNotification = await notificationsService.markAsRead(id as string, userEmail);
            return res.status(200).json(updatedNotification);
        } catch (error: any) {
            console.error('[NotificationsController] Error markAsRead:', error);
            if (error.message === 'Notificación no encontrada o no autorizada') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Error interno al actualizar la notificación' });
        }
    };
}