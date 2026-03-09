import { z } from 'zod';

export const createExamSchema = z.object({
    training_id: z.string().uuid(),
    time_limit: z.number().int().min(1).default(30),
    min_passing_score: z.number().int().min(0).max(100).default(70),
    access_type: z.enum(['public', 'restricted']).default('public'),
    requires_password: z.boolean().default(false),
    password: z.string().optional(),
    require_name: z.boolean().default(true),
    require_dni: z.boolean().default(true),
    require_email: z.boolean().default(false),
    require_organization: z.boolean().default(false),
});

export const addQuestionSchema = z.object({
    text: z.string().min(5),
    type: z.enum(['multiple']).default('multiple'),
    option_a: z.string().min(1),
    option_b: z.string().min(1),
    option_c: z.string().min(1),
    option_d: z.string().min(1),
    correct_answer: z.number().int().min(0).max(3),
    training_tag: z.string().optional(),
    order_index: z.number().int().optional(),
});

export const submitExamSchema = z.object({
    participant_name: z.string().min(3),
    dni: z.string().min(8),
    email: z.string().email().optional(),
    organization: z.string().optional(),
    answers: z.record(z.string().uuid(), z.number().int().min(0).max(3)), // { "questionId": 2 }
});

export type CreateExamDto = z.infer<typeof createExamSchema>;
export type AddQuestionDto = z.infer<typeof addQuestionSchema>;
export type SubmitExamDto = z.infer<typeof submitExamSchema>;
