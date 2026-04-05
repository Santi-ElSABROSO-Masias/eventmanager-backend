import { Request, Response } from 'express';
import { AuthorizationsService } from './authorizations.service';
import { CreateHighRiskWorkDto, CreateDrivingLicenseDto, CreateVehicleDto, AuthApprovalDto } from './dto/authorizations.dto';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { supabase } from '../../config/supabase';

export class AuthorizationsController {
    private authService = new AuthorizationsService();

    // --- File Uploads ---
    uploadFile = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) throw new Error('No se recibió archivo');

            const supabaseUrl = env.SUPABASE_URL || '';
            const supabaseKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY || '';
            if (!supabaseUrl || !supabaseKey) throw new Error('Faltan credenciales de Supabase en el Backend');

            const supabaseClient = supabase; // Usar el cliente compartido

            const { category } = req.body;
            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = category ? `${category}/${fileName}` : `${fileName}`;

            const { data, error } = await supabaseClient.storage
                .from('autorizaciones')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) throw error;

            const { data: urlData } = supabaseClient.storage
                .from('autorizaciones')
                .getPublicUrl(filePath);

            res.json({ success: true, url: urlData.publicUrl, name: file.originalname });
        } catch (error: any) {
            console.error('Upload Error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // --- High Risk Work ---
    createHighRiskWork = async (req: Request, res: Response) => {
        try {
            const data: CreateHighRiskWorkDto = req.body;
            const userId = (req as any).user!.id;
            const result = await this.authService.createHighRiskWork(data, userId);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getHighRiskWorks = async (req: Request, res: Response) => {
        try {
            const userRole = (req as any).user?.role;
            const userCompanyId = (req as any).user?.companyId;
            
            const filters: any = {};
            if (userRole === 'admin_contratista' && userCompanyId) {
                filters.company = `Empresa ID: ${userCompanyId}`;
            }
            
            const result = await this.authService.getHighRiskWorks(filters);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    approveHighRiskWork = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const data: AuthApprovalDto = req.body;
            const userId = (req as any).user!.id;
            const result = await this.authService.approveHighRiskWork(id, data, userId);

            if (result.pdfBuffer) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=Autorizacion_${id}.pdf`);
                res.status(200).send(result.pdfBuffer);
                return;
            }

            res.json({ success: true, data: result.record });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // --- Driving Licenses ---
    createDrivingLicense = async (req: Request, res: Response) => {
        try {
            const data: CreateDrivingLicenseDto = req.body;
            const userId = (req as any).user!.id;
            const result = await this.authService.createDrivingLicense(data, userId);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getDrivingLicenses = async (req: Request, res: Response) => {
        try {
            const userRole = (req as any).user?.role;
            const userCompanyId = (req as any).user?.companyId;
            
            const filters: any = {};
            if (userRole === 'admin_contratista' && userCompanyId) {
                filters.company = `Empresa ID: ${userCompanyId}`;
            }
            
            const result = await this.authService.getDrivingLicenses(filters);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    approveDrivingLicense = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const data: AuthApprovalDto = req.body;
            const userId = (req as any).user!.id;
            const result = await this.authService.approveDrivingLicense(id, data, userId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // --- Vehicle Accreditation ---
    createVehicle = async (req: Request, res: Response) => {
        try {
            const data: CreateVehicleDto = req.body;
            const userId = (req as any).user!.id;
            const result = await this.authService.createVehicle(data, userId);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getVehicles = async (req: Request, res: Response) => {
        try {
            const userRole = (req as any).user?.role;
            const userCompanyId = (req as any).user?.companyId;
            
            const filters: any = {};
            if (userRole === 'admin_contratista' && userCompanyId) {
                filters.company = `Empresa ID: ${userCompanyId}`;
            }
            
            const result = await this.authService.getVehicles(filters);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    approveVehicle = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const data: AuthApprovalDto = req.body;
            const userId = (req as any).user!.id;
            const result = await this.authService.approveVehicle(id, data, userId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
