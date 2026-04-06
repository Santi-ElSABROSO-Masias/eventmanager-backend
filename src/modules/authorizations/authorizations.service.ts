import prisma from '../../config/db';
import { supabase } from '../../config/supabase';
import {
    CreateHighRiskWorkDto, UpdateHighRiskWorkDto,
    CreateDrivingLicenseDto, UpdateDrivingLicenseDto,
    CreateVehicleDto, UpdateVehicleDto,
    AuthApprovalDto
} from './dto/authorizations.dto';
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
                rejection_reason: data.rejection_reason,
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
                rejection_reason: data.rejection_reason,
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
                rejection_reason: data.rejection_reason,
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

    async updateHighRiskWork(id: string, data: UpdateHighRiskWorkDto) {
        const record = await prisma.highRiskWorkAuth.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        const updateData: any = {
            worker_id: data.worker_id,
            worker_name: data.worker_name,
            dni: data.dni,
            company: data.company,
            work_type: data.work_type,
            location: data.location,
            date_needed: data.date_needed ? new Date(data.date_needed) : undefined,
            medical_cert_url: data.medical_cert_url,
            training_cert_url: data.training_cert_url,
        };

        if (data.documents) {
            let jsonPayload: any = {};
            try { if (record.rejection_reason) jsonPayload = JSON.parse(record.rejection_reason); } catch { }
            jsonPayload.documentos = data.documents;
            updateData.rejection_reason = JSON.stringify(jsonPayload);
        }

        return prisma.highRiskWorkAuth.update({
            where: { id },
            data: updateData
        });
    }

    async updateDrivingLicense(id: string, data: UpdateDrivingLicenseDto) {
        const record = await prisma.drivingLicenseAuth.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        const updateData: any = {
            worker_id: data.worker_id,
            worker_name: data.worker_name,
            dni: data.dni,
            company: data.company,
            license_number: data.license_number,
            license_category: data.license_category,
            expiration_date: data.expiration_date ? new Date(data.expiration_date) : undefined,
            license_front_url: data.license_front_url,
            license_back_url: data.license_back_url,
        };

        if (data.documents) {
            let jsonPayload: any = {};
            try { if (record.rejection_reason) jsonPayload = JSON.parse(record.rejection_reason); } catch { }
            jsonPayload.documentos = data.documents;
            updateData.rejection_reason = JSON.stringify(jsonPayload);
        }

        return prisma.drivingLicenseAuth.update({
            where: { id },
            data: updateData
        });
    }

    async updateVehicle(id: string, data: UpdateVehicleDto) {
        const record = await prisma.vehicleAccreditation.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        const updateData: any = {
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
        };

        if (data.documents) {
            let jsonPayload: any = {};
            try { if (record.rejection_reason) jsonPayload = JSON.parse(record.rejection_reason); } catch { }
            jsonPayload.documentos = data.documents;
            updateData.rejection_reason = JSON.stringify(jsonPayload);
        }

        return prisma.vehicleAccreditation.update({
            where: { id },
            data: updateData
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

    // --- Helper: Extract storage paths from document URLs ---
    private extractStoragePaths(rejectionReason: string | null): string[] {
        if (!rejectionReason) {
            console.log('[AuthorizationsService] rejection_reason es null o vacío. Se asume que no hay archivos. (Fix 3)');
            return [];
        }
        try {
            const parsed = JSON.parse(rejectionReason);
            const documentos = parsed.documentos || [];
            const paths: string[] = [];
            for (const doc of documentos) {
                // FIX 2: Buscar la URL en múltiples propiedades posibles
                const targetUrl = doc.archivoUrl || doc.url || doc.fileUrl;
                if (targetUrl && typeof targetUrl === 'string') {
                    // URL format: .../storage/v1/object/public/autorizaciones/Category/filename.pdf
                    const marker = '/autorizaciones/';
                    const idx = targetUrl.indexOf(marker);
                    if (idx !== -1) {
                        const rawPath = targetUrl.substring(idx + marker.length);
                        // FIX 1: Decodificar URI (%20, etc.)
                        const decodedPath = decodeURIComponent(rawPath);
                        console.log(`[AuthorizationsService] Path extraído y decodificado de forma segura: ${decodedPath}`);
                        paths.push(decodedPath);
                    }
                }
            }
            console.log(`[AuthorizationsService] Total explícito de paths a iterar y borrar: ${paths.length}`);
            return paths;
        } catch (error: any) {
            console.error('[AuthorizationsService] Error parseando rejection_reason:', error.message);
            return [];
        }
    }

    private async deleteStorageFiles(paths: string[]): Promise<void> {
        if (paths.length === 0) return;
        console.log('[AuthorizationsService] Eliminando archivos de Storage:', paths);
        const { error } = await supabase.storage.from('autorizaciones').remove(paths);
        if (error) {
            console.error('[AuthorizationsService] Error al eliminar archivos de Storage:', error.message);
            // No lanzamos error para no bloquear la eliminación del registro
        }
    }

    // --- Delete Methods ---
    async deleteHighRiskWork(id: string) {
        const record = await prisma.highRiskWorkAuth.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        // FIX 3: Validar que rejection_reason exista antes de extraer
        if (record.rejection_reason) {
            const storagePaths = this.extractStoragePaths(record.rejection_reason);
            if (storagePaths.length > 0) {
                console.log(`[AuthorizationsService] Procediendo a eliminar ${storagePaths.length} archivos de High Risk Work en el bucket...`);
                await this.deleteStorageFiles(storagePaths);
            }
        } else {
            console.log(`[AuthorizationsService] Registro borrador en High Risk Work sin archivos subidos detectables. Omitiendo la eliminación en bucket.`);
        }

        return prisma.highRiskWorkAuth.delete({ where: { id } });
    }

    async deleteDrivingLicense(id: string) {
        const record = await prisma.drivingLicenseAuth.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        // FIX 3: Validar que rejection_reason exista antes de extraer
        if (record.rejection_reason) {
            const storagePaths = this.extractStoragePaths(record.rejection_reason);
            if (storagePaths.length > 0) {
                console.log(`[AuthorizationsService] Procediendo a eliminar ${storagePaths.length} archivos de Driving License en el bucket...`);
                await this.deleteStorageFiles(storagePaths);
            }
        } else {
            console.log(`[AuthorizationsService] Registro borrador en Driving License sin archivos subidos detectables. Omitiendo la eliminación en bucket.`);
        }

        return prisma.drivingLicenseAuth.delete({ where: { id } });
    }

    async deleteVehicle(id: string) {
        const record = await prisma.vehicleAccreditation.findUnique({ where: { id } });
        if (!record) throw new Error('Solicitud no encontrada');

        // FIX 3: Validar que rejection_reason exista antes de extraer
        if (record.rejection_reason) {
            const storagePaths = this.extractStoragePaths(record.rejection_reason);
            if (storagePaths.length > 0) {
                console.log(`[AuthorizationsService] Procediendo a eliminar ${storagePaths.length} archivos de Vehicle Accreditation en el bucket...`);
                await this.deleteStorageFiles(storagePaths);
            }
        } else {
            console.log(`[AuthorizationsService] Registro borrador en Vehicle Accreditation sin archivos subidos detectables. Omitiendo la eliminación en bucket.`);
        }

        return prisma.vehicleAccreditation.delete({ where: { id } });
    }
}
