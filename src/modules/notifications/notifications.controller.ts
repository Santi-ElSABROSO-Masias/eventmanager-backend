import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';

const notificationsService = new NotificationsService();

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const userEmail = (req as any).user?.email;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const notifications = await notificationsService.getUserNotifications(userId, userEmail);

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error: any) {
        console.error('[NotificationsController] Error fetching notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const notification = await notificationsService.markAsRead(id, userId);

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error: any) {
        console.error('[NotificationsController] Error marking as read:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
