"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesService = void 0;
const db_1 = __importDefault(require("../../config/db"));
class SchedulesService {
    async generate(data, userId) {
        const existingSchedule = await db_1.default.monthlySchedule.findFirst({
            where: { month: data.month, year: data.year }
        });
        if (existingSchedule) {
            throw new Error('Ya existe un cronograma para ese mes y año. Por favor edítelo.');
        }
        return db_1.default.monthlySchedule.create({
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
        return db_1.default.monthlySchedule.findMany({
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ],
            include: {
                _count: { select: { trainings: true } }
            }
        });
    }
    async publish(id, userId) {
        const schedule = await db_1.default.monthlySchedule.findUnique({ where: { id } });
        if (!schedule)
            throw new Error('Cronograma no encontrado');
        return db_1.default.monthlySchedule.update({
            where: { id },
            data: {
                status: 'published',
                published_at: new Date(),
                published_by: userId
            }
        });
    }
}
exports.SchedulesService = SchedulesService;
