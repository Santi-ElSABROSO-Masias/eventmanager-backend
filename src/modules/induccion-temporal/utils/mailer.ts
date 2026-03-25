import nodemailer from 'nodemailer';

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
  html: string
): Promise<void> => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.warn(`[MAILER] Missing GMAIL_USER/GMAIL_APP_PASS. Skipping email to ${to}`);
    return;
  }

  await transporter.sendMail({
    from: `"EventManager Notificaciones" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
