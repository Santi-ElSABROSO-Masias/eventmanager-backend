import { Request, Response } from 'express';
import { AuthorizationsService } from './authorizations.service';
import { CreateHighRiskWorkDto, CreateDrivingLicenseDto, CreateVehicleDto, AuthApprovalDto } from './dto/authorizations.dto';

export class AuthorizationsController {
    private authService = new AuthorizationsService();

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
            const filters = {}; // add req.query mapping
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
            res.json({ success: true, data: result });
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
            const filters = {};
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
            const filters = {};
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
