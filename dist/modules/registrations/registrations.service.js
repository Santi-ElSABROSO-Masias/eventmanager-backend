"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const crypto_1 = __importDefault(require("crypto"));
const mailer_1 = require("../induccion-temporal/utils/mailer");
class RegistrationsService {
    async create(data, userId) {
        const training = await db_1.default.training.findUnique({
            where: { id: data.training_id },
            include: {
                company: true,
                _count: { select: { registrations: true } }
            }
        });
        if (!training) {
            throw new Error('Capacitación no encontrada');
        }
        if (training._count.registrations >= training.max_capacity) {
            throw new Error('No hay cupos disponibles para esta capacitación');
        }
        if (new Date() > training.registration_deadline) {
            throw new Error('La fecha límite de inscripción ha pasado');
        }
        // Checking if already registered
        const existing = await db_1.default.registration.findUnique({
            where: {
                training_id_dni: { training_id: data.training_id, dni: data.dni }
            }
        });
        if (existing) {
            throw new Error('El trabajador ya está inscrito en esta capacitación');
        }
        // Verificar email duplicado en el mismo curso
        const emailExists = await db_1.default.registration.findFirst({
            where: {
                training_id: data.training_id,
                email: data.email
            }
        });
        if (emailExists) {
            throw new Error(JSON.stringify({
                field: 'email',
                message: `El correo ${data.email} ya está registrado en este curso`
            }));
        }
        // Verificar teléfono duplicado en el mismo curso  
        if (data.phone) {
            const phoneExists = await db_1.default.registration.findFirst({
                where: {
                    training_id: data.training_id,
                    phone: data.phone
                }
            });
            if (phoneExists) {
                throw new Error(JSON.stringify({
                    field: 'phone',
                    message: `El teléfono ${data.phone} ya está registrado en este curso`
                }));
            }
        }
        const validationToken = crypto_1.default.randomBytes(32).toString('hex');
        const registration = await db_1.default.registration.create({
            data: {
                training_id: data.training_id,
                full_name: data.full_name,
                dni: data.dni,
                email: data.email,
                phone: data.phone,
                organization: data.organization,
                area: data.area,
                role: data.role,
                brevete: data.brevete,
                status: 'registrado',
                validation_token: validationToken,
                registered_by: userId,
            }
        });
        const newRegisteredCount = training._count.registrations + 1;
        const remainingSlots = training.max_capacity - newRegisteredCount;
        if (remainingSlots < 5) {
            const existingCriticalAlert = await db_1.default.systemNotification.findFirst({
                where: {
                    training_id: training.id,
                    type: 'critical_capacity_alert'
                }
            });
            if (!existingCriticalAlert) {
                const gerenciaUsers = await db_1.default.user.findMany({
                    where: { role: 'super_super_admin', is_active: true },
                    select: { email: true, name: true }
                });
                const subject = `⚠️ Alerta de cupos críticos - ${training.title}`;
                const html = `
                    <div style="font-family: Arial, sans-serif; color: #334155;">
                      <h3 style="color:#ea580c;">⚠️ Alerta de cupos críticos</h3>
                      <p>La capacitación <strong>${training.title}</strong> tiene menos de 5 cupos.</p>
                      <p>Quedan <strong>${Math.max(0, remainingSlots)}</strong> cupos disponibles.</p>
                    </div>
                `;
                for (const user of gerenciaUsers) {
                    try {
                        await (0, mailer_1.sendSystemNotification)(user.email, subject, html);
                        await db_1.default.systemNotification.create({
                            data: {
                                training_id: training.id,
                                type: 'critical_capacity_alert',
                                status: 'sent',
                                recipient_email: user.email,
                                subject,
                                body_html: html,
                                sent_at: new Date()
                            }
                        });
                    }
                    catch (error) {
                        await db_1.default.systemNotification.create({
                            data: {
                                training_id: training.id,
                                type: 'critical_capacity_alert',
                                status: 'failed',
                                recipient_email: user.email,
                                subject,
                                body_html: html
                            }
                        });
                        console.error('Error sending critical_capacity_alert notification:', error);
                    }
                }
            }
        }
        return {
            ...registration,
            registered_count: newRegisteredCount
        };
    }
    async validate(id, status, userId, rejectionReason) {
        const registration = await db_1.default.registration.findUnique({ where: { id } });
        if (!registration)
            throw new Error('Inscripción no encontrada');
        // Nivel 2 (Capacitador / Super Admin Nivel 2) validates the identity documents
        if (status === 'rechazado') {
            return db_1.default.registration.update({
                where: { id },
                data: {
                    status: 'rechazado',
                    rejection_reason: rejectionReason,
                    approved_by_level2: userId,
                    approved_at_level2: new Date()
                }
            });
        }
        return db_1.default.registration.update({
            where: { id },
            data: {
                status: 'pendiente', // Avanza al Nivel 1
                approved_by_level2: userId,
                approved_at_level2: new Date()
            }
        });
    }
    async approveFinal(id, userId) {
        const registration = await db_1.default.registration.findUnique({ where: { id } });
        if (!registration)
            throw new Error('Inscripción no encontrada');
        if (registration.status !== 'pendiente') {
            throw new Error('La inscripción debe ser validada previamente por el Nivel 2 (estado: pendiente)');
        }
        return db_1.default.registration.update({
            where: { id },
            data: {
                status: 'aprobado',
                approved_by_level1: userId,
                approved_at_level1: new Date(),
                // Acá se desencadenaría el envío por correo si la generación de Teams Link es post-aprobación
            }
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters.trainingId)
            where.training_id = filters.trainingId;
        if (filters.status)
            where.status = filters.status;
        // Auth scoping
        if (filters.userRole === 'admin_contratista' && filters.userCompanyId) {
            where.training = { company_id: filters.userCompanyId };
        }
        return db_1.default.registration.findMany({
            where,
            orderBy: { registered_at: 'desc' },
            include: {
                training: { select: { title: true, start_date: true } }
            }
        });
    }
}
exports.RegistrationsService = RegistrationsService;
