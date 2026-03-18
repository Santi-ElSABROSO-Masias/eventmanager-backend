"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Debe ser un correo electrónico válido'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Debe ser un correo electrónico válido'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: zod_1.z.string().min(2, 'El nombre es requerido'),
    role: zod_1.z.enum(['super_super_admin', 'super_admin', 'admin_contratista']),
    companyId: zod_1.z.string().uuid().optional(),
});
