"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateSchema = exports.extendDeadlineSchema = exports.updateTrainingSchema = exports.createTrainingSchema = void 0;
const zod_1 = require("zod");
exports.createTrainingSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    start_date: zod_1.z.string().datetime(),
    start_time: zod_1.z.string(), // Consider using regex for time format "HH:mm"
    end_time: zod_1.z.string(),
    max_capacity: zod_1.z.number().int().min(1).default(60),
    duration_hours: zod_1.z.number().optional(),
    color: zod_1.z.string().optional(),
    group_number: zod_1.z.number().int().optional(),
    registration_deadline: zod_1.z.string().datetime(),
    meeting_link: zod_1.z.string().url().optional(),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']).default('active'),
    is_active: zod_1.z.boolean().default(true),
    is_published: zod_1.z.boolean().default(false),
    template_id: zod_1.z.string().uuid().optional(),
    company_id: zod_1.z.string().uuid().optional(),
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
