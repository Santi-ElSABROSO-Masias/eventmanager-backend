import { z } from 'zod';

export const createHighRiskWorkSchema = z.object({
    id: z.string().uuid().optional(),
    worker_id: z.string(),
    worker_name: z.string(),
    dni: z.string(),
    company: z.string(),
    work_type: z.string(),
    location: z.string(),
    date_needed: z.string().datetime(),
    date_requested: z.string().datetime().optional(),
    status: z.string().optional(),
    rejection_reason: z.string().optional(),
    medical_cert_url: z.string().url().optional(),
    training_cert_url: z.string().url().optional(),
    documents: z.array(z.object({
        nombre: z.string(),
        archivoUrl: z.string().optional()
    })).optional(),
});

export const createDrivingLicenseSchema = z.object({
    id: z.string().uuid().optional(),
    worker_id: z.string(),
    worker_name: z.string(),
    dni: z.string(),
    company: z.string(),
    license_number: z.string(),
    license_category: z.string(),
    expiration_date: z.string().datetime(),
    status: z.string().optional(),
    rejection_reason: z.string().optional(),
    license_front_url: z.string().url().optional(),
    license_back_url: z.string().url().optional(),
    documents: z.array(z.object({
        nombre: z.string(),
        archivoUrl: z.string().optional()
    })).optional(),
});

export const createVehicleSchema = z.object({
    id: z.string().uuid().optional(),
    plate_number: z.string(),
    company: z.string(),
    vehicle_type: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.number().int(),
    soat_url: z.string().url().optional(),
    soat_expiration: z.string().datetime().optional(),
    rtv_url: z.string().url().optional(),
    rtv_expiration: z.string().datetime().optional(),
    property_card_url: z.string().url().optional(),
    status: z.string().optional(),
    rejection_reason: z.string().optional(),
    documents: z.array(z.object({
        nombre: z.string(),
        archivoUrl: z.string().optional()
    })).optional(),
});

export const authApprovalSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    rejection_reason: z.string().optional(),
    fechaCapacitacion: z.string().optional(),
    fechaEMO: z.string().optional(),
    vigencia: z.string().optional(),
    tiposTrabajo: z.array(z.string()).optional()
});

export const updateHighRiskWorkSchema = createHighRiskWorkSchema.partial();
export const updateDrivingLicenseSchema = createDrivingLicenseSchema.partial();
export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateHighRiskWorkDto = z.infer<typeof createHighRiskWorkSchema>;
export type UpdateHighRiskWorkDto = z.infer<typeof updateHighRiskWorkSchema>;
export type CreateDrivingLicenseDto = z.infer<typeof createDrivingLicenseSchema>;
export type UpdateDrivingLicenseDto = z.infer<typeof updateDrivingLicenseSchema>;
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>;
export type AuthApprovalDto = z.infer<typeof authApprovalSchema>;
