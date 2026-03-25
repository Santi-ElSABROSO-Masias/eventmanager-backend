import prisma from '../../config/db';
import { CreateRegistrationDto } from './dto/registrations.dto';
import crypto from 'crypto';
import { sendSystemNotification } from '../induccion-temporal/utils/mailer';

export class RegistrationsService {
    async create(data: CreateRegistrationDto, userId: string) {
        const training = await prisma.training.findUnique({
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
        const existing = await prisma.registration.findUnique({
            where: {
                training_id_dni: { training_id: data.training_id, dni: data.dni }
            }
        });

        if (existing) {
            throw new Error('El trabajador ya está inscrito en esta capacitación');
        }

        const validationToken = crypto.randomBytes(32).toString('hex');

        const registration = await prisma.registration.create({
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
            const existingCriticalAlert = await prisma.systemNotification.findFirst({
                where: {
                    training_id: training.id,
                    type: 'critical_capacity_alert'
                }
            });

            if (!existingCriticalAlert) {
                const gerenciaUsers = await prisma.user.findMany({
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
                        await sendSystemNotification(user.email, subject, html);
                        await prisma.systemNotification.create({
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
                    } catch (error) {
                        await prisma.systemNotification.create({
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

    async validate(id: string, status: 'aprobado' | 'rechazado', userId: string, rejectionReason?: string) {
        const registration = await prisma.registration.findUnique({ where: { id } });
        if (!registration) throw new Error('Inscripción no encontrada');

        // Nivel 2 (Capacitador / Super Admin Nivel 2) validates the identity documents
        if (status === 'rechazado') {
            return prisma.registration.update({
                where: { id },
                data: {
                    status: 'rechazado',
                    rejection_reason: rejectionReason,
                    approved_by_level2: userId,
                    approved_at_level2: new Date()
                }
            });
        }

        return prisma.registration.update({
            where: { id },
            data: {
                status: 'pendiente', // Avanza al Nivel 1
                approved_by_level2: userId,
                approved_at_level2: new Date()
            }
        });
    }

    async approveFinal(id: string, userId: string) {
        const registration = await prisma.registration.findUnique({ where: { id } });
        if (!registration) throw new Error('Inscripción no encontrada');

        if (registration.status !== 'pendiente') {
            throw new Error('La inscripción debe ser validada previamente por el Nivel 2 (estado: pendiente)');
        }

        return prisma.registration.update({
            where: { id },
            data: {
                status: 'aprobado',
                approved_by_level1: userId,
                approved_at_level1: new Date(),
                // Acá se desencadenaría el envío por correo si la generación de Teams Link es post-aprobación
            }
        });
    }

    async findAll(filters: any) {
        const where: any = {};
        if (filters.trainingId) where.training_id = filters.trainingId;
        if (filters.status) where.status = filters.status;

        // Auth scoping
        if (filters.userRole === 'admin_contratista' && filters.userCompanyId) {
            where.training = { company_id: filters.userCompanyId };
        }

        return prisma.registration.findMany({
            where,
            orderBy: { registered_at: 'desc' },
            include: {
                training: { select: { title: true, start_date: true } }
            }
        });
    }

    // NOTE: Excel operations (importFromExcel / exportToExcel) would require XLSX library
    // We'll scaffold these to return Not Implemented or keep them out of scope for MVP setup
}
