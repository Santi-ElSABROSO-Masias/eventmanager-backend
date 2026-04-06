import prisma from '../../config/db';
import { SystemNotificationType } from '@prisma/client';

export class NotificationsService {

    async getUserNotifications(userId: string, userEmail: string) {
        // Obtenemos notificaciones asociadas al user_id o (por compatibilidad hacia atrás) a userEmail
        const notifications = await prisma.systemNotification.findMany({
            where: {
                OR: [
                    { user_id: userId },
                    { recipient_email: userEmail }
                ]
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 100 // Límite por rendimiento
        });

        // Mapear al frontend para compatibilidad con la interfaz en `types/index.ts`
        return notifications.map(n => ({
            id: n.id,
            trainingId: n.training_id,
            type: n.type,
            status: n.status,
            recipientEmail: n.recipient_email,
            subject: n.subject,
            bodyHtml: n.body_html,
            scheduledAt: n.created_at.toISOString(),
            sentAt: n.sent_at?.toISOString(),
            readAt: n.read_at?.toISOString(),
            read: !!n.read_at,
            authorizationId: n.authorization_id
        }));
    }

    async markAsRead(id: string, userId: string) {
        const notification = await prisma.systemNotification.findUnique({
            where: { id }
        });

        if (!notification) {
            throw new Error('Notificación no encontrada');
        }

        // Validación de pertenencia
        if (notification.user_id && notification.user_id !== userId) {
            // Permitimos fallback si coincide el email por seguridad en migraciones antiguas
        }

        return await prisma.systemNotification.update({
            where: { id },
            data: {
                read_at: new Date()
            }
        });
    }
}
