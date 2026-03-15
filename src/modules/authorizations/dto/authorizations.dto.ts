import { z } from 'zod';

export const createHighRiskWorkSchema = z.object({
    id: z.string().uuid().optional(),
    worker_id: z.string().optional(),
    worker_name: z.string().optional(),
    dni: z.string().optional(),
    company: z.string().optional(),
    work_type: z.string().optional(),
    location: z.string().optional(),
    date_needed: z.string().datetime().optional(),
    date_requested: z.string().datetime().optional(),
    status: z.string().optional(),
    rejection_reason: z.string().optional(),
    medical_cert_url: z.string().url().optional(),
    training_cert_url: z.string().url().optional(),
});

export const createDrivingLicenseSchema = z.object({
    id: z.string().uuid().optional(),
    worker_id: z.string().optional(),
    worker_name: z.string().optional(),
    dni: z.string().optional(),
    company: z.string().optional(),
    license_number: z.string().optional(),
    license_category: z.string().optional(),
    expiration_date: z.string().datetime().optional(),
    status: z.string().optional(),
    rejection_reason: z.string().optional(),
    license_front_url: z.string().url().optional(),
    license_back_url: z.string().url().optional(),
});

export const createVehicleSchema = z.object({
    id: z.string().uuid().optional(),
    plate_number: z.string().optional(),
    company: z.string().optional(),
    vehicle_type: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.number().int().optional(),
    soat_url: z.string().url().optional(),
    soat_expiration: z.string().datetime().optional(),
    rtv_url: z.string().url().optional(),
    rtv_expiration: z.string().datetime().optional(),
    property_card_url: z.string().url().optional(),
    status: z.string().optional(),
    rejection_reason: z.string().optional(),
});

export const authApprovalSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    rejection_reason: z.string().optional(),
    fechaCapacitacion: z.string().optional(),
    fechaEMO: z.string().optional(),
    vigencia: z.string().optional(),
    tiposTrabajo: z.array(z.string()).optional()
});

export type CreateHighRiskWorkDto = z.infer<typeof createHighRiskWorkSchema>;
export type CreateDrivingLicenseDto = z.infer<typeof createDrivingLicenseSchema>;
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type AuthApprovalDto = z.infer<typeof authApprovalSchema>;
