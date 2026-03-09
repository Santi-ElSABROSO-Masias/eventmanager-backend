import { z } from 'zod';

export const createRegistrationSchema = z.object({
    training_id: z.string().uuid(),
    full_name: z.string().min(3),
    dni: z.string().min(8).max(20),
    email: z.string().email(),
    phone: z.string().min(6),
    organization: z.string().min(2),
    area: z.string().optional(),
    role: z.string().optional(),
    brevete: z.string().optional(),
});

export const bulkRegistrationSchema = z.object({
    trainingId: z.string().uuid(),
    // file is handled by multer
});

export const validationSchema = z.object({
    status: z.enum(['aprobado', 'rechazado']),
    rejectionReason: z.string().optional(),
});

export const approveSchema = z.object({
    // No body needed strictly, but could take metadata if required
});

export type CreateRegistrationDto = z.infer<typeof createRegistrationSchema>;
export type BulkRegistrationDto = z.infer<typeof bulkRegistrationSchema>;
export type ValidationDto = z.infer<typeof validationSchema>;
