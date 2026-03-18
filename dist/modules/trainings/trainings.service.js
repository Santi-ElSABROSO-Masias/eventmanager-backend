"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingsService = void 0;
const db_1 = __importDefault(require("../../config/db"));
class TrainingsService {
    async create(data, userId) {
        return db_1.default.training.create({
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
                meeting_link: data.meeting_link,
                status: data.status,
                is_active: data.is_active,
                is_published: data.is_published,
                template_id: data.template_id,
                company_id: data.company_id,
                created_by: userId,
            }
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.companyId)
            where.company_id = filters.companyId;
        // TODO: Add month/year filtering based on start_date
        return db_1.default.training.findMany({
            where,
            orderBy: { start_date: 'desc' },
            include: {
                _count: { select: { registrations: true } },
                company: { select: { name: true } }
            }
        });
    }
    async findOne(id) {
        return db_1.default.training.findUnique({
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
    async update(id, data) {
        const updateData = { ...data };
        if (data.start_date)
            updateData.start_date = new Date(data.start_date);
        if (data.registration_deadline)
            updateData.registration_deadline = new Date(data.registration_deadline);
        if (data.start_time)
            updateData.start_time = new Date(`1970-01-01T${data.start_time}:00Z`);
        if (data.end_time)
            updateData.end_time = new Date(`1970-01-01T${data.end_time}:00Z`);
        return db_1.default.training.update({
            where: { id },
            data: updateData
        });
    }
    async extendDeadline(id, data, userId) {
        return db_1.default.training.update({
            where: { id },
            data: {
                registration_deadline: new Date(data.newDeadline),
                deadline_extended_at: new Date(),
                deadline_extended_by: userId,
                deadline_extension_reason: data.reason
            }
        });
    }
    async duplicate(id, data, userId) {
        const original = await db_1.default.training.findUnique({ where: { id } });
        if (!original)
            throw new Error('Capacitación no encontrada');
        return db_1.default.training.create({
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
    async delete(id) {
        return db_1.default.training.update({
            where: { id },
            data: { status: 'inactive', is_active: false }
        });
    }
}
exports.TrainingsService = TrainingsService;
