"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveSchema = exports.validationSchema = exports.bulkRegistrationSchema = exports.createRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.createRegistrationSchema = zod_1.z.object({
    training_id: zod_1.z.string().uuid(),
    full_name: zod_1.z.string().min(3),
    dni: zod_1.z.string().min(8).max(20),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(6),
    organization: zod_1.z.string().min(2),
    area: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    brevete: zod_1.z.string().optional(),
});
exports.bulkRegistrationSchema = zod_1.z.object({
    trainingId: zod_1.z.string().uuid(),
    // file is handled by multer
});
exports.validationSchema = zod_1.z.object({
    status: zod_1.z.enum(['aprobado', 'rechazado']),
    rejectionReason: zod_1.z.string().optional(),
});
exports.approveSchema = zod_1.z.object({
// No body needed strictly, but could take metadata if required
});
