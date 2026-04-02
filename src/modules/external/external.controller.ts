import { Request, Response } from 'express';
import { ExternalService } from './external.service';

const externalService = new ExternalService();

export class ExternalController {
    async getDni(req: Request, res: Response) {
        try {
            const dni = req.params.dni as string;
            
            if (!/^\d{8}$/.test(dni)) {
                return res.status(400).json({ success: false, message: 'DNI inválido. Debe tener 8 dígitos.' });
            }

            const data = await externalService.getDniData(dni);
            res.json({ success: true, data });
        } catch (error: any) {
            console.error('[ExternalController] lookup error:', error.message);
            res.status(500).json({ success: false, message: error.message || 'Error interno al consultar DNI.' });
        }
    }
}
