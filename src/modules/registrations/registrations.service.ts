import prisma from '../../config/db';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/registrations.dto';
import crypto from 'crypto';
import { sendSystemNotification } from '../induccion-temporal/utils/mailer';
import { supabase } from '../../config/supabase';

export class RegistrationsService {
    async create(data: CreateRegistrationDto, user: any, file?: Express.Multer.File) {
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

        // Verificar email duplicado en el mismo curso
        const emailExists = await prisma.registration.findFirst({
            where: {
                training_id: data.training_id,
                email: data.email
            }
        });
        if (emailExists) {
            throw new Error(
                JSON.stringify({
                    field: 'email',
                    message: `El correo ${data.email} ya está registrado en este curso`
                })
            );
        }

        // Verificar teléfono duplicado en el mismo curso  
        if (data.phone) {
            const phoneExists = await prisma.registration.findFirst({
                where: {
                    training_id: data.training_id,
                    phone: data.phone
                }
            });
            if (phoneExists) {
                throw new Error(
                    JSON.stringify({
                        field: 'phone',
                        message: `El teléfono ${data.phone} ya está registrado en este curso`
                    })
                );
            }
        }

        const validationToken = crypto.randomBytes(32).toString('hex');

        // Force user organization if admin_contratista
        let finalOrganization = data.organization;
        if (user.role === 'admin_contratista' && user.companyId) {
            const userCompany = await prisma.company.findUnique({ where: { id: user.companyId }});
            if (userCompany) {
                finalOrganization = userCompany.name;
            }
        }

        let dniPhotoUrl = data.dni_photo_url;

        if (file) {
            const fileExt = file.originalname.split('.').pop() || 'jpg';
            const fileName = `fotos-dni/dni_${data.dni}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('capacitaciones')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (uploadError) {
                console.error('[RegistrationsService] Error al subir foto:', uploadError);
                throw new Error('No se pudo subir la foto del DNI: ' + uploadError.message);
            }

            const { data: urlData } = supabase.storage
                .from('capacitaciones')
                .getPublicUrl(fileName);

            dniPhotoUrl = urlData.publicUrl;
        }

        const registration = await prisma.registration.create({
            data: {
                training_id: data.training_id,
                full_name: data.full_name,
                dni: data.dni,
                email: data.email,
                phone: data.phone,
                organization: finalOrganization,
                area: data.area,
                role: data.role,
                brevete: data.brevete,
                status: 'registrado',
                validation_token: validationToken,
                registered_by: user.id,
                dni_photo_url: dniPhotoUrl,
            }
        });

        // 📧 Notificación de Confirmación de Registro
        const confirmSubject = `Confirmación de Inscripción - ${training.title}`;
        const confirmHtml = `
            <div style="font-family: Arial, sans-serif; color: #334155;">
              <h3 style="color:#10b981;">📝 Registro Confirmado</h3>
              <p>Hola, el trabajador <strong>${registration.full_name}</strong> ha sido inscrito exitosamente en la capacitación <strong>${training.title}</strong>.</p>
              <ul>
                <li>Fecha del curso: <strong>${training.start_date.toISOString().split('T')[0]}</strong></li>
              </ul>
              <p>Se enviará el link de acceso una vez aprobado por la Gerencia SSO.</p>
            </div>
        `;

        try {
            await sendSystemNotification(registration.email, confirmSubject, confirmHtml, {
                type: 'registration_confirmed',
                trainingId: training.id
                // No asociamos userId porque el trabajador no suele tener cuenta de usuario en el sistema
            });
        } catch (error) {
            console.error('Error sending registration_confirmed notification:', error);
        }

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
                    select: { id: true, email: true, name: true }
                });

                const subject = `⚠️ Alerta de cupos críticos - ${training.title}`;
                const html = `
                    <div style="font-family: Arial, sans-serif; color: #334155;">
                      <h3 style="color:#ea580c;">⚠️ Alerta de cupos críticos</h3>
                      <p>La capacitación <strong>${training.title}</strong> tiene menos de 5 cupos.</p>
                      <p>Quedan <strong>${Math.max(0, remainingSlots)}</strong> cupos disponibles.</p>
                    </div>
                `;

                for (const gerenciaUser of gerenciaUsers) {
                    try {
                        await sendSystemNotification(gerenciaUser.email, subject, html, {
                            type: 'critical_capacity_alert',
                            trainingId: training.id,
                            userId: gerenciaUser.id
                        });
                    } catch (error) {
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
            const updated = await prisma.registration.update({
                where: { id },
                data: {
                    status: 'rechazado',
                    rejection_reason: rejectionReason,
                    approved_by_level2: userId,
                    approved_at_level2: new Date()
                },
                include: { training: true }
            });

            // 📧 Notificación de Rechazo
            const subject = `❌ Inscripción Observada/Rechazada - ${updated.training.title}`;
            const html = `
                <div style="font-family: Arial, sans-serif; color: #334155;">
                  <h3 style="color:#ef4444;">❌ Inscripción Observada</h3>
                  <p>Hola, tu inscripción para la capacitación <strong>${updated.training.title}</strong> ha sido observada o rechazada.</p>
                  <p>Motivo: <strong>${rejectionReason || 'Documentación no válida o incompleta'}</strong></p>
                  <p>Por favor, contacta con tu supervisor para regularizar tu situación.</p>
                </div>
            `;

            try {
                await sendSystemNotification(updated.email, subject, html, {
                    type: 'registration_confirmed', // Reutilizamos el tipo para el registro de auditoría si no hay uno específico
                    trainingId: updated.training_id
                });
            } catch (error) {
                console.error('Error sending rejection notification:', error);
            }

            return updated;
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

    async approveFinal(id: string, userId: string, meetingLink?: string) {
        const registration = await prisma.registration.findUnique({ where: { id } });
        if (!registration) throw new Error('Inscripción no encontrada');

        // Solo bloqueamos si ya fue rechazado — no se puede resucitar un rechazo
        if (registration.status === 'rechazado') {
            throw new Error('No se puede aprobar una inscripción que fue rechazada');
        }

        const now = new Date();

        // Si el Nivel 2 no validó todavía, el Nivel 1 lo auto-completa
        // para que la aprobación quede reflejada en toda la cadena
        const level2AutoData = !registration.approved_by_level2
            ? {
                approved_by_level2: userId,
                approved_at_level2: now,
              }
            : {};

        const updated = await prisma.registration.update({
            where: { id },
            data: {
                status: 'aprobado',
                approved_by_level1: userId,
                approved_at_level1: now,
                ...(meetingLink && { meeting_link: meetingLink }),
                ...level2AutoData,
            },
            include: { training: true }
        });

        // 📧 Notificación de Aprobación Final
        const subject = `✅ Inscripción Confirmada y Aprobada - ${updated.training.title}`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #334155;">
              <h3 style="color:#10b981;">✅ ¡Felicidades! Inscripción Aprobada</h3>
              <p>Tu inscripción para <strong>${updated.training.title}</strong> ha sido aprobada por la Gerencia SSO.</p>
              ${updated.meeting_link ? `<p>Link de acceso virtual: <a href="${updated.meeting_link}">${updated.meeting_link}</a></p>` : '<p>La capacitación será presencial. Por favor asiste puntual.</p>'}
              <ul>
                <li>Fecha: <strong>${updated.training.start_date.toISOString().split('T')[0]}</strong></li>
              </ul>
              <p>Te esperamos.</p>
            </div>
        `;

        try {
            await sendSystemNotification(updated.email, subject, html, {
                type: 'registration_confirmed',
                trainingId: updated.training_id
            });
        } catch (error) {
            console.error('Error sending final approval notification:', error);
        }

        return updated;
    }

    async findAll(filters: any) {
        console.log('[findAll] Starting with filters:', filters);

        // Auth validation
        if (filters.userRole === 'admin_contratista' && !filters.userCompanyId) {
            throw new Error('admin_contratista must have companyId to query registrations');
        }

        const where: any = {};
        
        // Base filters
        if (filters.trainingId) {
            where.training_id = filters.trainingId;
        }
        if (filters.status) {
            where.status = filters.status;
        }

        // Role-based authorization scoping
        if (filters.userRole === 'admin_contratista') {
            console.log('[findAll] Filtering for admin_contratista with company:', filters.userCompanyId);
            
            const company = await prisma.company.findUnique({ where: { id: filters.userCompanyId } });
            const companyName = company?.name?.trim() || '';

            where.OR = [
                { training: { company_id: filters.userCompanyId } }, // Registros en sus propias capacitaciones
                { organization: { equals: companyName, mode: 'insensitive' } }, // Match exacto pero case-insensitive
                { registered_by: filters.userId }                    // Seguridad: sus propios registros creados
            ];
            
            console.log('[findAll] Applied robust OR filter for Admin Contratista using organization:', companyName);
        }
        // For super_super_admin and super_admin, no company filtering - they see everything

        const registrations = await prisma.registration.findMany({
            where,
            orderBy: { registered_at: 'desc' },
            include: {
                training: { 
                    select: { 
                        id: true,
                        title: true, 
                        start_date: true,
                        company_id: true
                    } 
                }
            }
        });

        console.log('[findAll] Returning', registrations.length, 'registrations');

        return registrations;
    }

    // NOTE: Excel operations (importFromExcel / exportToExcel) would require XLSX library
    // We'll scaffold these to return Not Implemented or keep them out of scope for MVP setup

    async update(id: string, data: UpdateRegistrationDto) {
        const registration = await prisma.registration.findUnique({
            where: { id }
        });

        if (!registration) {
            throw new Error('Registro no encontrado');
        }

        // Verificar duplicados si cambia email
        if (data.email && data.email !== registration.email) {
            const emailExists = await prisma.registration.findFirst({
                where: {
                    training_id: registration.training_id,
                    email: data.email,
                    NOT: { id }
                }
            });
            if (emailExists) {
                throw new Error(JSON.stringify({
                    field: 'email',
                    message: `El correo ${data.email} ya está registrado en este curso`
                }));
            }
        }

        // Verificar duplicados si cambia teléfono
        if (data.phone && data.phone !== registration.phone) {
            const phoneExists = await prisma.registration.findFirst({
                where: {
                    training_id: registration.training_id,
                    phone: data.phone,
                    NOT: { id }
                }
            });
            if (phoneExists) {
                throw new Error(JSON.stringify({
                    field: 'phone',
                    message: `El teléfono ${data.phone} ya está registrado en este curso`
                }));
            }
        }

        return prisma.registration.update({
            where: { id },
            data: {
                ...(data.name && { full_name: data.name }),
                ...(data.dni && { dni: data.dni }),
                ...(data.email && { email: data.email }),
                ...(data.phone && { phone: data.phone }),
            }
        });
    }
}
