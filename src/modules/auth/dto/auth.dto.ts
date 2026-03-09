import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Debe ser un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.string().email('Debe ser un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(2, 'El nombre es requerido'),
    role: z.enum(['super_super_admin', 'super_admin', 'admin_contratista']),
    companyId: z.string().uuid().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
