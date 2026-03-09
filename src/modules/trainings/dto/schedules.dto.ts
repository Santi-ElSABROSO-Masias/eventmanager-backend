import { z } from 'zod';

export const generateScheduleSchema = z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2024),
    templateIds: z.array(z.string().uuid()).optional(), // Optional list of templates to use for generation
});

export type GenerateScheduleDto = z.infer<typeof generateScheduleSchema>;
