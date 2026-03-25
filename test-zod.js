const { z } = require('zod');

const createTrainingSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    start_date: z.string().datetime(),
    start_time: z.string(),
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

const payload = {
    title: 'Capacitacion de Prueba',
    description: '',
    start_date: '2026-03-25T05:00:00.000Z',
    start_time: '08:00',
    end_time: '17:00',
    max_capacity: 60,
    duration_hours: undefined,
    color: '#0EA5E9',
    group_number: 1,
    registration_deadline: '2026-03-25T20:00:00.000Z',
    status: 'active',
    is_active: true,
    is_published: true,
};

const result = createTrainingSchema.safeParse(payload);
console.log(result.success ? "Success" : result.error.errors);
