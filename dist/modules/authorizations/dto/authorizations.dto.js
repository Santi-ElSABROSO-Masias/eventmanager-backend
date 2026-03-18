"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApprovalSchema = exports.createVehicleSchema = exports.createDrivingLicenseSchema = exports.createHighRiskWorkSchema = void 0;
const zod_1 = require("zod");
exports.createHighRiskWorkSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    worker_id: zod_1.z.string(),
    worker_name: zod_1.z.string(),
    dni: zod_1.z.string(),
    company: zod_1.z.string(),
    work_type: zod_1.z.string(),
    location: zod_1.z.string(),
    date_needed: zod_1.z.string().datetime(),
    date_requested: zod_1.z.string().datetime().optional(),
    status: zod_1.z.string().optional(),
    rejection_reason: zod_1.z.string().optional(),
    medical_cert_url: zod_1.z.string().url().optional(),
    training_cert_url: zod_1.z.string().url().optional(),
});
exports.createDrivingLicenseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    worker_id: zod_1.z.string(),
    worker_name: zod_1.z.string(),
    dni: zod_1.z.string(),
    company: zod_1.z.string(),
    license_number: zod_1.z.string(),
    license_category: zod_1.z.string(),
    expiration_date: zod_1.z.string().datetime(),
    status: zod_1.z.string().optional(),
    rejection_reason: zod_1.z.string().optional(),
    license_front_url: zod_1.z.string().url().optional(),
    license_back_url: zod_1.z.string().url().optional(),
});
exports.createVehicleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    plate_number: zod_1.z.string(),
    company: zod_1.z.string(),
    vehicle_type: zod_1.z.string(),
    brand: zod_1.z.string(),
    model: zod_1.z.string(),
    year: zod_1.z.number().int(),
    soat_url: zod_1.z.string().url().optional(),
    soat_expiration: zod_1.z.string().datetime().optional(),
    rtv_url: zod_1.z.string().url().optional(),
    rtv_expiration: zod_1.z.string().datetime().optional(),
    property_card_url: zod_1.z.string().url().optional(),
    status: zod_1.z.string().optional(),
    rejection_reason: zod_1.z.string().optional(),
});
exports.authApprovalSchema = zod_1.z.object({
    status: zod_1.z.enum(['approved', 'rejected']),
    rejection_reason: zod_1.z.string().optional(),
    fechaCapacitacion: zod_1.z.string().optional(),
    fechaEMO: zod_1.z.string().optional(),
    vigencia: zod_1.z.string().optional(),
    tiposTrabajo: zod_1.z.array(zod_1.z.string()).optional()
});
