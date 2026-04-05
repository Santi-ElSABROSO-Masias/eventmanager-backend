import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email('Debe ser un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(2, 'El nombre es requerido'),
    role: z.enum(['super_super_admin', 'super_admin', 'admin_contratista']),
    companyId: z.string().uuid().nullable().optional(),
});

export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    name: z.string().min(2).optional(),
    role: z.enum(['super_super_admin', 'super_admin', 'admin_contratista']).optional(),
    companyId: z.string().uuid().nullable().optional(),
    is_active: z.boolean().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
