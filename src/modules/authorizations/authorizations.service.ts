import prisma from '../../config/db';
import { CreateHighRiskWorkDto, CreateDrivingLicenseDto, CreateVehicleDto, AuthApprovalDto } from './dto/authorizations.dto';
import { generateAuthorizationPDF } from './utils/pdfGenerator';
import { randomUUID } from 'crypto';

export class AuthorizationsService {
    // --- High Risk Work ---
    async createHighRiskWork(data: CreateHighRiskWorkDto, userId: string) {
        return prisma.highRiskWorkAuth.create({
            data: {
                worker_id: data.worker_id,
                worker_name: data.worker_name,
                dni: data.dni,
                company: data.company,
                work_type: data.work_type,
                location: data.location,
                date_needed: new Date(data.date_needed),
                medical_cert_url: data.medical_cert_url,
                training_cert_url: data.training_cert_url,
                requested_by: userId,
            }
        });
    }

    async getHighRiskWorks(filters: any) {
        return prisma.highRiskWorkAuth.findMany({
            where: filters, // Should filter by company if it's 'admin_contratista'
            orderBy: { date_requested: 'desc' },
            include: { requester: { select: { name: true } } }
        });
    }

    async approveHighRiskWork(id: string, data: AuthApprovalDto, userId: string) {
        const record = await prisma.highRiskWorkAuth.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        let rejection_reason = data.rejection_reason || record.rejection_reason;
        let pdfBuffer: Buffer | null = null;
        const TIPOS_REQUIEREN_EMO = ['Altura', 'Caliente', 'Espacio Confinado'];

        if (data.status === 'approved') {
            const tiposTrabajo = data.tiposTrabajo || [];
            const requiresEMO = tiposTrabajo.some((t: string) => TIPOS_REQUIEREN_EMO.includes(t));

            if (requiresEMO && (!data.fechaEMO || !data.vigencia)) {
                throw new Error('Fecha EMO y Vigencia son requeridos para estas habilitaciones');
            }

            let jsonPayload: any = {};
            try { if (rejection_reason) jsonPayload = JSON.parse(rejection_reason); } catch { }

            jsonPayload.estadoUI = 'APROBADO';
            if (data.fechaCapacitacion) jsonPayload.fechaCapacitacion = data.fechaCapacitacion;
            if (data.fechaEMO) jsonPayload.fechaEMO = data.fechaEMO;
            if (data.vigencia) jsonPayload.vigencia = data.vigencia;
            if (data.tiposTrabajo) jsonPayload.tiposTrabajo = data.tiposTrabajo;

            const historyLog = {
                id: randomUUID(),
                actor: 'Gerencia SSO',
                rol: 'Aprobador',
                accion: 'Aprobación Final con Vigencia',
                fecha: new Date().toISOString()
            };
            jsonPayload.historial = [...(jsonPayload.historial || []), historyLog];
            rejection_reason = JSON.stringify(jsonPayload);

            const vigenciaFinal = requiresEMO ? data.vigencia! : 'Hasta finalizar obra/tarea';

            pdfBuffer = generateAuthorizationPDF({
                nombre: record.worker_name,
                dni: record.dni,
                empresa: record.company,
                tiposTrabajo: tiposTrabajo.length > 0 ? tiposTrabajo : (jsonPayload.tiposTrabajo || []),
                vigencia: vigenciaFinal,
                codigoUnico: id.split('-').pop() || '0000',
                fechaEmision: new Date().toISOString().split('T')[0]
            });
        }

        const updated = await prisma.highRiskWorkAuth.update({
            where: { id },
            data: {
                status: data.status as any,
                rejection_reason,
                approved_by: userId,
                approved_at: new Date()
            }
        });

        return { record: updated, pdfBuffer };
    }

    // --- Driving Licenses ---
    async createDrivingLicense(data: CreateDrivingLicenseDto, userId: string) {
        return prisma.drivingLicenseAuth.create({
            data: {
                worker_id: data.worker_id,
                worker_name: data.worker_name,
                dni: data.dni,
                company: data.company,
                license_number: data.license_number,
                license_category: data.license_category,
                expiration_date: new Date(data.expiration_date),
                license_front_url: data.license_front_url,
                license_back_url: data.license_back_url,
                requested_by: userId,
            }
        });
    }

    async getDrivingLicenses(filters: any) {
        return prisma.drivingLicenseAuth.findMany({
            where: filters,
            orderBy: { expiration_date: 'asc' },
        });
    }

    async approveDrivingLicense(id: string, data: AuthApprovalDto, userId: string) {
        return prisma.drivingLicenseAuth.update({
            where: { id },
            data: {
                status: data.status,
                rejection_reason: data.rejection_reason,
                approved_by: userId,
                approved_at: new Date()
            }
        });
    }

    // --- Vehicle Accreditation ---
    async createVehicle(data: CreateVehicleDto, userId: string) {
        return prisma.vehicleAccreditation.create({
            data: {
                plate_number: data.plate_number,
                company: data.company,
                vehicle_type: data.vehicle_type,
                brand: data.brand,
                model: data.model,
                year: data.year,
                soat_url: data.soat_url,
                soat_expiration: data.soat_expiration ? new Date(data.soat_expiration) : undefined,
                rtv_url: data.rtv_url,
                rtv_expiration: data.rtv_expiration ? new Date(data.rtv_expiration) : undefined,
                property_card_url: data.property_card_url,
                requested_by: userId,
            }
        });
    }

    async getVehicles(filters: any) {
        return prisma.vehicleAccreditation.findMany({
            where: filters,
        });
    }

    async approveVehicle(id: string, data: AuthApprovalDto, userId: string) {
        return prisma.vehicleAccreditation.update({
            where: { id },
            data: {
                status: data.status,
                rejection_reason: data.rejection_reason,
                approved_by: userId,
                approved_at: new Date()
            }
        });
    }
}
