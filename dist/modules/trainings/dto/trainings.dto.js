"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateSchema = exports.extendDeadlineSchema = exports.updateTrainingSchema = exports.createTrainingSchema = void 0;
const zod_1 = require("zod");
exports.createTrainingSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    // FIX 2: Aceptar formatos "yyyy-MM-ddThh:mm" e ISO completo
    start_date: zod_1.z.string().refine((date) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?Z?$/.test(date), 'Fecha debe estar en formato ISO (yyyy-MM-ddThh:mm o completo)'),
    start_time: zod_1.z.string(), // Consider using regex for time format "HH:mm"
    end_time: zod_1.z.string(),
    max_capacity: zod_1.z.number().int().min(1).default(60),
    duration_hours: zod_1.z.number().optional(),
    // FIX 3: Aceptar null o undefined para campos opcionales
    color: zod_1.z.string().nullable().optional(),
    group_number: zod_1.z.number().int().nullable().optional(),
    registration_deadline: zod_1.z.string().refine((date) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?Z?$/.test(date), 'Fecha debe estar en formato ISO (yyyy-MM-ddThh:mm o completo)'),
    meeting_link: zod_1.z.string().url().nullable().optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']).default('active'),
    is_active: zod_1.z.boolean().default(true),
    is_published: zod_1.z.boolean().default(false),
    template_id: zod_1.z.string().uuid().nullable().optional(),
    company_id: zod_1.z.string().uuid().nullable().optional(),
});
exports.updateTrainingSchema = exports.createTrainingSchema.partial();
exports.extendDeadlineSchema = zod_1.z.object({
    newDeadline: zod_1.z.string().datetime(),
    reason: zod_1.z.string().min(5),
});
exports.duplicateSchema = zod_1.z.object({
    newDate: zod_1.z.string().datetime(),
    newTime: zod_1.z.string().optional(),
});
