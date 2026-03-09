import prisma from '../../config/db';
import { CreateRegistrationDto } from './dto/registrations.dto';
import crypto from 'crypto';

export class RegistrationsService {
    async create(data: CreateRegistrationDto, userId: string) {
        const training = await prisma.training.findUnique({
            where: { id: data.training_id },
            include: { company: true }
        });

        if (!training) {
            throw new Error('Capacitación no encontrada');
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

        return prisma.registration.create({
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
