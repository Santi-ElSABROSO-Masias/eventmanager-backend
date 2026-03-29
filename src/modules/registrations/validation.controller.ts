import { Request, Response } from 'express';
import { ValidationService } from './validation.service';

export class ValidationController {
    private validationService = new ValidationService();

    getInfo = async (req: Request, res: Response) => {
        try {
            const token = req.params.token as string;
            const info = await this.validationService.getInfoByToken(token);

            res.json({ success: true, data: info });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message });
        }
    };

    uploadDni = async (req: Request, res: Response) => {
        try {
            const token = req.params.token as string;

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Debe proporcionar una imagen de su DNI' });
            }

            if (req.file && req.file.size < 100 * 1024) {
              return res.status(400).json({
                success: false,
                field: 'dni_photo',
                message: 'La imagen es muy pequeña. Sube una foto clara y legible de tu DNI (mín. 100KB)'
              });
            }

            const registration = await this.validationService.uploadDni(token, req.file);

            res.json({
                success: true,
                message: 'Identidad validada exitosamente. Su registro está pendiente de aprobación.',
                data: registration.identity_validated
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
