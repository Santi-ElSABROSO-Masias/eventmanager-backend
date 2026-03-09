import { z } from 'zod';

export const createTrainingSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    start_date: z.string().datetime(),
    start_time: z.string(), // Consider using regex for time format "HH:mm"
    end_time: z.string(),
    max_capacity: z.number().int().min(1).default(60),
    duration_hours: z.number().optional(),
    color: z.string().optional(),
    group_number: z.number().int().optional(),
    registration_deadline: z.string().datetime(),
    meeting_link: z.string().url().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
    is_active: z.boolean().default(true),
    is_published: z.boolean().default(false),
    template_id: z.string().uuid().optional(),
    company_id: z.string().uuid().optional(),
});

export const updateTrainingSchema = createTrainingSchema.partial();

export const extendDeadlineSchema = z.object({
    newDeadline: z.string().datetime(),
    reason: z.string().min(5),
});

export const duplicateSchema = z.object({
    newDate: z.string().datetime(),
    newTime: z.string().optional(),
});

export type CreateTrainingDto = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingDto = z.infer<typeof updateTrainingSchema>;
export type ExtendDeadlineDto = z.infer<typeof extendDeadlineSchema>;
export type DuplicateDto = z.infer<typeof duplicateSchema>;
