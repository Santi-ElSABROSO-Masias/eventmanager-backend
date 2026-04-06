import nodemailer from 'nodemailer';
import prisma from '../../../config/db';
import { SystemNotificationType } from '@prisma/client';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export const sendSystemNotification = async (
  to: string,
  subject: string,
  html: string,
  metadata?: {
    type?: SystemNotificationType;
    userId?: string;
    trainingId?: string;
    authorizationId?: string;
  }
): Promise<void> => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.warn(`[MAILER] Missing GMAIL_USER/GMAIL_APP_PASS. Skipping email to ${to}`);
    return;
  }

  // Enviar Email
  await transporter.sendMail({
    from: `"EventManager Notificaciones" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });

  // Persistir en BD (Silencioso para no romper flujo si falla DB)
  try {
    await prisma.systemNotification.create({
      data: {
        recipient_email: to,
        subject,
        body_html: html,
        type: metadata?.type || 'new_training_published', // Fallback a un tipo existente
        status: 'sent',
        sent_at: new Date(),
        user_id: metadata?.userId,
        training_id: metadata?.trainingId,
        authorization_id: metadata?.authorizationId,
      }
    });
  } catch (error) {
    console.error('[MAILER] Error persisting notification in DB:', error);
  }
};
