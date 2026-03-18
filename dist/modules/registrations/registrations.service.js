"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const crypto_1 = __importDefault(require("crypto"));
class RegistrationsService {
    async create(data, userId) {
        const training = await db_1.default.training.findUnique({
            where: { id: data.training_id },
            include: { company: true }
        });
        if (!training) {
            throw new Error('Capacitación no encontrada');
        }
        if (new Date() > training.registration_deadline) {
            throw new Error('La fecha límite de inscripción ha pasado');
        }
        // Checking if already registered
        const existing = await db_1.default.registration.findUnique({
            where: {
                training_id_dni: { training_id: data.training_id, dni: data.dni }
            }
        });
        if (existing) {
            throw new Error('El trabajador ya está inscrito en esta capacitación');
        }
        const validationToken = crypto_1.default.randomBytes(32).toString('hex');
        return db_1.default.registration.create({
            data: {
                training_id: data.training_id,
                full_name: data.full_name,
                dni: data.dni,
                email: data.email,
                phone: data.phone,
                organization: data.organization,
                area: data.area,
                role: data.role,
                brevete: data.brevete,
                status: 'registrado',
                validation_token: validationToken,
                registered_by: userId,
            }
        });
    }
    async validate(id, status, userId, rejectionReason) {
        const registration = await db_1.default.registration.findUnique({ where: { id } });
        if (!registration)
            throw new Error('Inscripción no encontrada');
        // Nivel 2 (Capacitador / Super Admin Nivel 2) validates the identity documents
        if (status === 'rechazado') {
            return db_1.default.registration.update({
                where: { id },
                data: {
                    status: 'rechazado',
                    rejection_reason: rejectionReason,
                    approved_by_level2: userId,
                    approved_at_level2: new Date()
                }
            });
        }
        return db_1.default.registration.update({
            where: { id },
            data: {
                status: 'pendiente', // Avanza al Nivel 1
                approved_by_level2: userId,
                approved_at_level2: new Date()
            }
        });
    }
    async approveFinal(id, userId) {
        const registration = await db_1.default.registration.findUnique({ where: { id } });
        if (!registration)
            throw new Error('Inscripción no encontrada');
        if (registration.status !== 'pendiente') {
            throw new Error('La inscripción debe ser validada previamente por el Nivel 2 (estado: pendiente)');
        }
        return db_1.default.registration.update({
            where: { id },
            data: {
                status: 'aprobado',
                approved_by_level1: userId,
                approved_at_level1: new Date(),
                // Acá se desencadenaría el envío por correo si la generación de Teams Link es post-aprobación
            }
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters.trainingId)
            where.training_id = filters.trainingId;
        if (filters.status)
            where.status = filters.status;
        // Auth scoping
        if (filters.userRole === 'admin_contratista' && filters.userCompanyId) {
            where.training = { company_id: filters.userCompanyId };
        }
        return db_1.default.registration.findMany({
            where,
            orderBy: { registered_at: 'desc' },
            include: {
                training: { select: { title: true, start_date: true } }
            }
        });
    }
}
exports.RegistrationsService = RegistrationsService;
