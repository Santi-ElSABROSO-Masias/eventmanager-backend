import { z } from 'zod';

export const createHighRiskWorkSchema = z.object({
    worker_id: z.string().uuid(),
    worker_name: z.string().min(2),
    dni: z.string().min(8).max(20),
    company: z.string().min(2),
    work_type: z.string().min(2),
    location: z.string().min(2),
    date_needed: z.string().datetime(),
    medical_cert_url: z.string().url().optional(),
    training_cert_url: z.string().url().optional(),
});

export const createDrivingLicenseSchema = z.object({
    worker_id: z.string().uuid(),
    worker_name: z.string().min(2),
    dni: z.string().min(8).max(20),
    company: z.string().min(2),
    license_number: z.string().min(2),
    license_category: z.string().min(1),
    expiration_date: z.string().datetime(),
    license_front_url: z.string().url().optional(),
    license_back_url: z.string().url().optional(),
});

export const createVehicleSchema = z.object({
    plate_number: z.string().min(5).max(20),
    company: z.string().min(2),
    vehicle_type: z.string().min(2),
    brand: z.string().min(2),
    model: z.string().min(2),
    year: z.number().int().min(1900),
    soat_url: z.string().url().optional(),
    soat_expiration: z.string().datetime().optional(),
    rtv_url: z.string().url().optional(),
    rtv_expiration: z.string().datetime().optional(),
    property_card_url: z.string().url().optional(),
});

export const authApprovalSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    rejection_reason: z.string().optional()
});

export type CreateHighRiskWorkDto = z.infer<typeof createHighRiskWorkSchema>;
export type CreateDrivingLicenseDto = z.infer<typeof createDrivingLicenseSchema>;
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type AuthApprovalDto = z.infer<typeof authApprovalSchema>;
