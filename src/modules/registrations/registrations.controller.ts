import { Request, Response } from 'express';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto, UpdateRegistrationDto, ValidationDto } from './dto/registrations.dto';

export class RegistrationsController {
    private registrationsService = new RegistrationsService();

    create = async (req: Request, res: Response) => {
        try {
            const createDto: CreateRegistrationDto = req.body;
            const userId = (req as any).user!.id;

            const registration = await this.registrationsService.create(createDto, userId);
            res.status(201).json({ success: true, data: registration, message: 'Trabajador inscrito correctamente' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    findAll = async (req: Request, res: Response) => {
        try {
            const { trainingId, status } = req.query;
            const userRole = (req as any).user!.role;
            const userCompanyId = (req as any).user!.companyId;

            const registrations = await this.registrationsService.findAll({ trainingId, status, userRole, userCompanyId });
            res.json({ success: true, data: registrations });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    validateLevel2 = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const data: ValidationDto = req.body;
            const userId = (req as any).user!.id;

            const registration = await this.registrationsService.validate(id, data.status, userId, data.rejectionReason);
            res.json({ success: true, data: registration, message: `Inscripción ${data.status} por Nivel 2` });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    approveLevel1 = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const userId = (req as any).user!.id;

            const registration = await this.registrationsService.approveFinal(id, userId);
            res.json({ success: true, data: registration, message: 'Inscripción aprobada por Nivel 1' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    bulkRegister = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Debe subir un archivo Excel' });
            }
            // Excel processing logic goes here
            return res.status(501).json({ success: false, message: 'Importación masiva en desarrollo (Falta integración con Excel)' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const updateDto: UpdateRegistrationDto = req.body;

            const updatedRegistration = await this.registrationsService.update(id, updateDto);
            res.status(200).json({ success: true, data: updatedRegistration, message: 'Participante actualizado correctamente' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
