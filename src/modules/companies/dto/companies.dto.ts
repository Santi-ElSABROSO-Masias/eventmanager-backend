import { z } from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(2, 'El nombre de la empresa es requerido'),
    contact_email: z.string().email('Debe ser un correo electrónico válido').optional(),
    quota_max: z.number().int().min(0).default(0),
});

export const updateCompanySchema = z.object({
    name: z.string().min(2).optional(),
    contact_email: z.string().email().optional(),
    quota_max: z.number().int().min(0).optional(),
});

export const requestQuotaSchema = z.object({
    requestedQuota: z.number().int().min(1, 'Debe solicitar al menos 1 cupo'),
    reason: z.string().min(5, 'Debe proporcionar un motivo para la solicitud'),
});

export const approveQuotaSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    approvedQuota: z.number().int().min(0).optional(),
    reason: z.string().optional(),
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
export type RequestQuotaDto = z.infer<typeof requestQuotaSchema>;
export type ApproveQuotaDto = z.infer<typeof approveQuotaSchema>;
