import prisma from '../../config/db';

export class NotificationsService {
    async getUserNotifications(email: string) {
        return prisma.systemNotification.findMany({
            where: { recipient_email: email },
            orderBy: { created_at: 'desc' }
        });
    }

    async markAsRead(id: string, email: string) {
        // Verificamos que la notificación exista y pertenezca al usuario autenticado
        const notification = await prisma.systemNotification.findFirst({
            where: { id, recipient_email: email }
        });

        if (!notification) {
            throw new Error('Notificación no encontrada o no autorizada');
        }

        return prisma.systemNotification.update({
            where: { id },
            data: { 
                is_read: true,
                read_at: new Date()
            }
        });
    }
}