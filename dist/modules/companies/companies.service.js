"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const db_1 = __importDefault(require("../../config/db"));
class CompaniesService {
    async create(data) {
        const existingCompany = await db_1.default.company.findUnique({
            where: { name: data.name }
        });
        if (existingCompany) {
            throw new Error('Ya existe una empresa con ese nombre');
        }
        return db_1.default.company.create({
            data: {
                name: data.name,
                contact_email: data.contact_email,
                quota_max: data.quota_max,
            }
        });
    }
    async findAll() {
        return db_1.default.company.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });
    }
    async findOne(id) {
        return db_1.default.company.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, name: true, email: true, role: true, is_active: true }
                }
            }
        });
    }
    async update(id, data) {
        const company = await db_1.default.company.findUnique({ where: { id } });
        if (!company)
            throw new Error('Empresa no encontrada');
        return db_1.default.company.update({
            where: { id },
            data
        });
    }
    async requestQuota(id, data, userId) {
        const company = await db_1.default.company.findUnique({ where: { id } });
        if (!company)
            throw new Error('Empresa no encontrada');
        return db_1.default.company.update({
            where: { id },
            data: {
                quota_requested: data.requestedQuota,
                quota_request_reason: data.reason,
                quota_request_status: 'pending'
            }
        });
    }
    async approveQuota(id, data, userId) {
        const company = await db_1.default.company.findUnique({ where: { id } });
        if (!company)
            throw new Error('Empresa no encontrada');
        if (data.status === 'rejected') {
            return db_1.default.company.update({
                where: { id },
                data: {
                    quota_request_status: 'rejected',
                    quota_requested: 0,
                }
            });
        }
        // Aprobado
        const newQuota = data.approvedQuota !== undefined ? data.approvedQuota : (company.quota_max + company.quota_requested);
        const [updatedCompany] = await db_1.default.$transaction([
            db_1.default.company.update({
                where: { id },
                data: {
                    quota_max: newQuota,
                    quota_requested: 0,
                    quota_request_status: 'approved'
                }
            }),
            db_1.default.quotaHistory.create({
                data: {
                    company_id: id,
                    action: 'increase',
                    quota_before: company.quota_max,
                    quota_after: newQuota,
                    changed_by: userId,
                    reason: data.reason || 'Aprobación de cupos extra'
                }
            })
        ]);
        return updatedCompany;
    }
    async getQuotaHistory(id) {
        return db_1.default.quotaHistory.findMany({
            where: { company_id: id },
            orderBy: { created_at: 'desc' },
            include: {
                user: { select: { name: true, email: true } }
            }
        });
    }
}
exports.CompaniesService = CompaniesService;
