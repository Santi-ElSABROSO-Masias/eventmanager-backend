"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveQuotaSchema = exports.requestQuotaSchema = exports.updateCompanySchema = exports.createCompanySchema = void 0;
const zod_1 = require("zod");
exports.createCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'El nombre de la empresa es requerido'),
    contact_email: zod_1.z.string().email('Debe ser un correo electrónico válido').optional(),
    quota_max: zod_1.z.number().int().min(0).default(0),
});
exports.updateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    contact_email: zod_1.z.string().email().optional(),
    quota_max: zod_1.z.number().int().min(0).optional(),
});
exports.requestQuotaSchema = zod_1.z.object({
    requestedQuota: zod_1.z.number().int().min(1, 'Debe solicitar al menos 1 cupo'),
    reason: zod_1.z.string().min(5, 'Debe proporcionar un motivo para la solicitud'),
});
exports.approveQuotaSchema = zod_1.z.object({
    status: zod_1.z.enum(['approved', 'rejected']),
    approvedQuota: zod_1.z.number().int().min(0).optional(),
    reason: zod_1.z.string().optional(),
});
