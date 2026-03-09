import prisma from '../../config/db';
import { CreateCompanyDto, UpdateCompanyDto, RequestQuotaDto, ApproveQuotaDto } from './dto/companies.dto';

export class CompaniesService {
    async create(data: CreateCompanyDto) {
        const existingCompany = await prisma.company.findUnique({
            where: { name: data.name }
        });

        if (existingCompany) {
            throw new Error('Ya existe una empresa con ese nombre');
        }

        return prisma.company.create({
            data: {
                name: data.name,
                contact_email: data.contact_email,
                quota_max: data.quota_max,
            }
        });
    }

    async findAll() {
        return prisma.company.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });
    }

    async findOne(id: string) {
        return prisma.company.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, name: true, email: true, role: true, is_active: true }
                }
            }
        });
    }

    async update(id: string, data: UpdateCompanyDto) {
        const company = await prisma.company.findUnique({ where: { id } });
        if (!company) throw new Error('Empresa no encontrada');

        return prisma.company.update({
            where: { id },
            data
        });
    }

    async requestQuota(id: string, data: RequestQuotaDto, userId: string) {
        const company = await prisma.company.findUnique({ where: { id } });
        if (!company) throw new Error('Empresa no encontrada');

        return prisma.company.update({
            where: { id },
            data: {
                quota_requested: data.requestedQuota,
                quota_request_reason: data.reason,
                quota_request_status: 'pending'
            }
        });
    }

    async approveQuota(id: string, data: ApproveQuotaDto, userId: string) {
        const company = await prisma.company.findUnique({ where: { id } });
        if (!company) throw new Error('Empresa no encontrada');

        if (data.status === 'rejected') {
            return prisma.company.update({
                where: { id },
                data: {
                    quota_request_status: 'rejected',
                    quota_requested: 0,
                }
            });
        }

        // Aprobado
        const newQuota = data.approvedQuota !== undefined ? data.approvedQuota : (company.quota_max + company.quota_requested);

        const [updatedCompany] = await prisma.$transaction([
            prisma.company.update({
                where: { id },
                data: {
                    quota_max: newQuota,
                    quota_requested: 0,
                    quota_request_status: 'approved'
                }
            }),
            prisma.quotaHistory.create({
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

    async getQuotaHistory(id: string) {
        return prisma.quotaHistory.findMany({
            where: { company_id: id },
            orderBy: { created_at: 'desc' },
            include: {
                user: { select: { name: true, email: true } }
            }
        });
    }
}
