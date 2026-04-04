import { Request, Response } from 'express';
import { UploadService } from './upload.service';

const uploadService = new UploadService();

export class UploadController {
  async uploadPdf(req: Request, res: Response) {
    try {
      console.log('[UploadController] Recibida solicitud para subir PDF');
      
      if (!req.file) {
        console.error('[UploadController] Error: No se adjuntó archivo');
        return res.status(400).json({ success: false, message: 'No se recibió archivo PDF' });
      }

      const { category } = req.body;
      const result = await uploadService.uploadPdf(req.file, category);

      console.log('[UploadController] Éxito: Archivo subido y URL pública generada');
      res.status(201).json({ 
        success: true, 
        ...result 
      });
    } catch (error: any) {
      console.error('[UploadController] Catch Global Error:', error.message);
      if (error.stack) console.error(error.stack);
      
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Error interno al procesar el archivo en el servidor',
        error: error.message
      });
    }
  }
}
