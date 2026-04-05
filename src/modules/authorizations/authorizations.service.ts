import prisma from '../../config/db';
import { CreateHighRiskWorkDto, CreateDrivingLicenseDto, CreateVehicleDto, AuthApprovalDto } from './dto/authorizations.dto';
import { generateAuthorizationPDF } from './utils/pdfGenerator';
import { randomUUID } from 'crypto';

// --- Document Validation Helpers ---
const validateDocuments = (documents: any[] | undefined, requiredCount: number, moduleName: string): void => {
    if (!documents || documents.length === 0) {
        throw new Error(`Documentación incompleta. Faltan ${requiredCount} documento(s) obligatorio(s). Por favor, sube todos los documentos requeridos para ${moduleName} antes de enviar.`);
    }
    
    if (documents.length < requiredCount) {
        const missing = requiredCount - documents.length;
        throw new Error(`Documentación incompleta. Faltan ${missing} documento(s) obligatorio(s) de ${requiredCount}. Por favor, sube todos los documentos requeridos para ${moduleName} antes de enviar.`);
    }
};

export class AuthorizationsService {
    // --- High Risk Work ---
    async createHighRiskWork(data: CreateHighRiskWorkDto, userId: string) {
        // ✅ Validar documentos obligatorios para Trabajos de Alto Riesgo (mínimo 1)
        validateDocuments(data.documents, 1, 'Trabajos de Alto Riesgo');
        
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
        const where: any = {};
        if (filters.company) where.company = filters.company;
        
        const records = await prisma.highRiskWorkAuth.findMany({
            where: where,
            orderBy: { date_requested: 'desc' },
            include: { requester: { select: { name: true } } }
        });

        // Enriquecer con nombres de empresa y extraer documentos
        const companyIds = new Set<string>();
        records.forEach(r => {
            const match = r.company.match(/Empresa ID: ([a-f0-9\-]+)/i);
            if (match) companyIds.add(match[1]);
        });

        const companies = await prisma.company.findMany({
            where: { id: { in: Array.from(companyIds) } },
            select: { id: true, name: true }
        });
        const companyMap = new Map(companies.map(c => [c.id, c.name]));

        return records.map(r => {
            let documents: any[] = [];
            try {
                if (r.rejection_reason) {
                    const parsed = JSON.parse(r.rejection_reason);
                    documents = parsed.documentos || [];
                }
            } catch { }

            return {
                ...r,
                documents,
                company_name: (() => {
                    const match = r.company.match(/Empresa ID: ([a-f0-9\-]+)/i);
                    return match && companyMap.has(match[1]) ? companyMap.get(match[1]) : r.company;
                })()
            };
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
        // ✅ Validar documentos obligatorios para Licencias de Manejo (5 documentos base)
        validateDocuments(data.documents, 5, 'Licencias de Manejo');
        
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
        const where: any = {};
        if (filters.company) where.company = filters.company;
        
        const records = await prisma.drivingLicenseAuth.findMany({
            where: where,
            orderBy: { expiration_date: 'asc' },
        });

        // Enriquecer con nombres de empresa y extraer documentos
        const companyIds = new Set<string>();
        records.forEach(r => {
            const match = r.company.match(/Empresa ID: ([a-f0-9\-]+)/i);
            if (match) companyIds.add(match[1]);
        });

        const companies = await prisma.company.findMany({
            where: { id: { in: Array.from(companyIds) } },
            select: { id: true, name: true }
        });
        const companyMap = new Map(companies.map(c => [c.id, c.name]));

        return records.map(r => {
            let documents: any[] = [];
            try {
                if (r.rejection_reason) {
                    const parsed = JSON.parse(r.rejection_reason);
                    documents = parsed.documentos || [];
                }
            } catch { }

            return {
                ...r,
                documents,
                company_name: (() => {
                    const match = r.company.match(/Empresa ID: ([a-f0-9\-]+)/i);
                    return match && companyMap.has(match[1]) ? companyMap.get(match[1]) : r.company;
                })()
            };
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
        // ✅ Validar documentos obligatorios para Acreditación Vehicular (4 documentos)
        validateDocuments(data.documents, 4, 'Acreditación Vehicular');
        
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
        const where: any = {};
        if (filters.company) where.company = filters.company;
        
        const records = await prisma.vehicleAccreditation.findMany({
            where: where,
        });

        // Enriquecer con nombres de empresa y extraer documentos
        const companyIds = new Set<string>();
        records.forEach(r => {
            const match = r.company.match(/Empresa ID: ([a-f0-9\-]+)/i);
            if (match) companyIds.add(match[1]);
        });

        const companies = await prisma.company.findMany({
            where: { id: { in: Array.from(companyIds) } },
            select: { id: true, name: true }
        });
        const companyMap = new Map(companies.map(c => [c.id, c.name]));

        return records.map(r => {
            let documents: any[] = [];
            try {
                if (r.rejection_reason) {
                    const parsed = JSON.parse(r.rejection_reason);
                    documents = parsed.documentos || [];
                }
            } catch { }

            return {
                ...r,
                documents,
                company_name: (() => {
                    const match = r.company.match(/Empresa ID: ([a-f0-9\-]+)/i);
                    return match && companyMap.has(match[1]) ? companyMap.get(match[1]) : r.company;
                })()
            };
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

    async updateHighRiskWorkDocuments(id: string, documents: any[]) {
        const record = await prisma.highRiskWorkAuth.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        // Actualizar rejection_reason (que contiene los datos extendidos incluyendo documentos)
        let jsonPayload: any = {};
        try { if (record.rejection_reason) jsonPayload = JSON.parse(record.rejection_reason); } catch { }

        jsonPayload.documentos = documents;

        const updated = await prisma.highRiskWorkAuth.update({
            where: { id },
            data: {
                rejection_reason: JSON.stringify(jsonPayload)
            }
        });

        return updated;
    }

    async updateDrivingLicenseDocuments(id: string, documents: any[]) {
        const record = await prisma.drivingLicenseAuth.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        let jsonPayload: any = {};
        try { if (record.rejection_reason) jsonPayload = JSON.parse(record.rejection_reason); } catch { }

        jsonPayload.documentos = documents;

        const updated = await prisma.drivingLicenseAuth.update({
            where: { id },
            data: {
                rejection_reason: JSON.stringify(jsonPayload)
            }
        });

        return updated;
    }

    async updateVehicleDocuments(id: string, documents: any[]) {
        const record = await prisma.vehicleAccreditation.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        let jsonPayload: any = {};
        try { if (record.rejection_reason) jsonPayload = JSON.parse(record.rejection_reason); } catch { }

        jsonPayload.documentos = documents;

        const updated = await prisma.vehicleAccreditation.update({
            where: { id },
            data: {
                rejection_reason: JSON.stringify(jsonPayload)
            }
        });

        return updated;
    }
}
