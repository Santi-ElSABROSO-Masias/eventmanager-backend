import prisma from '../../config/db';
import { CreateTrainingDto, UpdateTrainingDto, ExtendDeadlineDto, DuplicateDto } from './dto/trainings.dto';
import { sendSystemNotification } from '../induccion-temporal/utils/mailer';

export class TrainingsService {
    async create(data: CreateTrainingDto, userId: string) {
        try {
            console.log('Create training - Datos recibidos:', JSON.stringify(data, null, 2));
            
            // FIX 1: Validar meeting_link - enviar undefined si es URL inválida o vacío
            let meetingLink = data.meeting_link;
            if (meetingLink) {
                try {
                    new URL(meetingLink);
                } catch {
                    console.warn('URL de meeting_link inválida, enviando undefined:', meetingLink);
                    meetingLink = undefined;
                }
            } else if (meetingLink === '') {
                meetingLink = undefined;
            }
            
            const training = await prisma.training.create({
                data: {
                    title: data.title,
                    description: data.description,
                    start_date: new Date(data.start_date),
                    start_time: new Date(`1970-01-01T${data.start_time}:00Z`),
                    end_time: new Date(`1970-01-01T${data.end_time}:00Z`),
                    max_capacity: data.max_capacity,
                    duration_hours: data.duration_hours,
                    color: data.color,
                    group_number: data.group_number,
                    registration_deadline: new Date(data.registration_deadline),
                    meeting_link: meetingLink,
                    status: data.status,
                    is_active: data.is_active,
                    is_published: data.is_published,
                    template_id: data.template_id,
                    company_id: data.company_id,
                    created_by: userId,
                }
            });
            
            console.log('Training creado exitosamente:', training.id);
            return training;
        } catch (error) {
            console.error('Error exacto en create:', JSON.stringify(error, null, 2));
            throw error;
        }
    }

    async findAll(filters: any) {
        const where: any = { is_active: true };
        if (filters.status) where.status = filters.status;
        if (filters.companyId) where.company_id = filters.companyId;

        // TODO: Add month/year filtering based on start_date
        return prisma.training.findMany({
            where,
            orderBy: { start_date: 'desc' },
            include: {
                _count: { select: { registrations: true } },
                company: { select: { name: true } }
            }
        });
    }

    async findOne(id: string) {
        return prisma.training.findUnique({
            where: { id },
            include: {
                company: { select: { name: true } },
                registrations: {
                    select: { id: true, full_name: true, dni: true, status: true, identity_validated: true },
                    orderBy: { registered_at: 'desc' },
                }
            }
        });
    }

    async update(id: string, data: UpdateTrainingDto) {
        try {
            console.log('[UPDATE] ID:', id);
            console.log('[UPDATE] Payload:', JSON.stringify(data));

            const existing = await prisma.training.findUnique({ where: { id } });
            if (!existing) throw new Error('Capacitación no encontrada');

            const updateData: any = { ...data };
            if (data.start_date) updateData.start_date = new Date(data.start_date);
            if (data.registration_deadline) updateData.registration_deadline = new Date(data.registration_deadline);
            if (data.start_time) updateData.start_time = new Date(`1970-01-01T${data.start_time}:00Z`);
            if (data.end_time) updateData.end_time = new Date(`1970-01-01T${data.end_time}:00Z`);

            const updatedTraining = await prisma.training.update({
                where: { id },
                data: updateData
            });

            const justPublished = existing.is_published === false && updatedTraining.is_published === true;
            if (justPublished) {
                try {
                    const contractorAdmins = await prisma.user.findMany({
                        where: { role: 'admin_contratista', is_active: true },
                        select: { id: true, email: true, name: true }
                    });

                    for (const admin of contractorAdmins) {
                        const subject = `Nueva capacitación disponible - ${updatedTraining.title}`;
                        const html = `
                            <div style="font-family: Arial, sans-serif; color: #334155;">
                              <h3 style="color:#10b981;">📚 Nueva capacitación disponible: ${updatedTraining.title}</h3>
                              <p>Fecha: <strong>${updatedTraining.start_date.toISOString().split('T')[0]}</strong></p>
                              <p>Cupos: <strong>${updatedTraining.max_capacity}</strong></p>
                              <p>Ingresa a la plataforma para inscribir a tus trabajadores.</p>
                            </div>
                        `;

                        try {
                            await sendSystemNotification(admin.email, subject, html, {
                                type: 'new_training_published',
                                trainingId: updatedTraining.id,
                                userId: admin.id
                            });
                        } catch (error) {
                            console.error('Error sending new_training_published notification:', error);
                        }
                    }
                } catch (notifError) {
                    console.error('Notificación falló, continuando...', notifError);
                    // NO relanzar el error - el update se completará de todas formas
                }
            }

            return updatedTraining;
        } catch (error: any) {
            console.error('[UPDATE] Error:', {
                message: error?.message,
                code: error?.code,
                meta: error?.meta
            });
            throw error;
        }
    }

    async extendDeadline(id: string, data: ExtendDeadlineDto, userId: string) {
        return prisma.training.update({
            where: { id },
            data: {
                registration_deadline: new Date(data.newDeadline),
                deadline_extended_at: new Date(),
                deadline_extended_by: userId,
                deadline_extension_reason: data.reason
            }
        });
    }

    async duplicate(id: string, data: DuplicateDto, userId: string) {
        const original = await prisma.training.findUnique({ where: { id } });
        if (!original) throw new Error('Capacitación no encontrada');

        return prisma.training.create({
            data: {
                title: `${original.title} (Copia)`,
                description: original.description,
                start_date: new Date(data.newDate),
                start_time: data.newTime ? new Date(`1970-01-01T${data.newTime}:00Z`) : original.start_time,
                end_time: original.end_time, // Optionally calculate end_time based on newTime and duration
                max_capacity: original.max_capacity,
                duration_hours: original.duration_hours,
                color: original.color,
                registration_deadline: new Date(data.newDate), // Simplified deadline for duplicate
                status: 'inactive', // Copies start as inactive
                is_active: true,
                is_published: false,
                template_id: original.template_id,
                company_id: original.company_id,
                created_by: userId,
            }
        });
    }

    async delete(id: string) {
        return prisma.training.update({
            where: { id },
            data: { status: 'inactive', is_active: false }
        });
    }
}
