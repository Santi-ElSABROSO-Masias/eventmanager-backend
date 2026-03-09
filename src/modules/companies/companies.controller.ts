import { Request, Response } from 'express';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto, RequestQuotaDto, ApproveQuotaDto } from './dto/companies.dto';

export class CompaniesController {
    private companiesService = new CompaniesService();

    create = async (req: Request, res: Response) => {
        try {
            const createDto: CreateCompanyDto = req.body;
            const company = await this.companiesService.create(createDto);

            res.status(201).json({ success: true, data: company });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    findAll = async (req: Request, res: Response) => {
        try {
            const companies = await this.companiesService.findAll();
            res.json({ success: true, data: companies });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    findOne = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const company = await this.companiesService.findOne(id);

            if (!company) {
                return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
            }

            res.json({ success: true, data: company });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const updateDto: UpdateCompanyDto = req.body;

            const company = await this.companiesService.update(id, updateDto);
            res.json({ success: true, data: company });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    requestQuota = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const data: RequestQuotaDto = req.body;
            const userId = (req as any).user!.id;

            const company = await this.companiesService.requestQuota(id, data, userId);
            res.json({ success: true, data: company, message: 'Solicitud de cupos enviada' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    approveQuota = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const data: ApproveQuotaDto = req.body;
            const userId = (req as any).user!.id;

            const company = await this.companiesService.approveQuota(id, data, userId);
            res.json({ success: true, data: company, message: `Cupos ${data.status === 'approved' ? 'aprobados' : 'rechazados'}` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getQuotaHistory = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const history = await this.companiesService.getQuotaHistory(id);

            res.json({ success: true, data: history });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
