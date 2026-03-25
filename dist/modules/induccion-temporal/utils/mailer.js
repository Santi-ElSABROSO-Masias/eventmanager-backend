"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSystemNotification = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
});
const sendSystemNotification = async (to, subject, html) => {
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
exports.sendSystemNotification = sendSystemNotification;
