"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Debe ser un correo electrónico válido'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: zod_1.z.string().min(2, 'El nombre es requerido'),
    role: zod_1.z.enum(['super_super_admin', 'super_admin', 'admin_contratista']),
    companyId: zod_1.z.string().uuid().nullable().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    name: zod_1.z.string().min(2).optional(),
    role: zod_1.z.enum(['super_super_admin', 'super_admin', 'admin_contratista']).optional(),
    companyId: zod_1.z.string().uuid().nullable().optional(),
    is_active: zod_1.z.boolean().optional(),
});
