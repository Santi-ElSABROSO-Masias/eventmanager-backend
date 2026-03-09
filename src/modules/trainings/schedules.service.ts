import prisma from '../../config/db';
import { GenerateScheduleDto } from './dto/schedules.dto';

export class SchedulesService {
    async generate(data: GenerateScheduleDto, userId: string) {
        const existingSchedule = await prisma.monthlySchedule.findFirst({
            where: { month: data.month, year: data.year }
        });

        if (existingSchedule) {
            throw new Error('Ya existe un cronograma para ese mes y año. Por favor edítelo.');
        }

        return prisma.monthlySchedule.create({
            data: {
                month: data.month,
                year: data.year,
                status: 'draft',
            }
        });

        // En una implementación completa: Iterar por los training_templates
        // y generar instancias de Training asociadas a este monthly_schedule_id.
    }

    async findAll() {
        return prisma.monthlySchedule.findMany({
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ],
            include: {
                _count: { select: { trainings: true } }
            }
        });
    }

    async publish(id: string, userId: string) {
        const schedule = await prisma.monthlySchedule.findUnique({ where: { id } });
        if (!schedule) throw new Error('Cronograma no encontrado');

        return prisma.monthlySchedule.update({
            where: { id },
            data: {
                status: 'published',
                published_at: new Date(),
                published_by: userId
            }
        });
    }
}
