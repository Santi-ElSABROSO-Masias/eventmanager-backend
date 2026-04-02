import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

export class UploadController {
  async uploadPdf(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se recibió archivo PDF' });
      }

      // Validar estrictamente mimetype
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ success: false, message: 'Solo se permiten archivos PDF' });
      }

      const file = req.file;
      const fileExt = 'pdf';
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${timestamp}_${sanitizedName}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('autorizaciones')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('autorizaciones')
        .getPublicUrl(filePath);

      res.status(201).json({ 
        success: true, 
        url: urlData.publicUrl, 
        name: file.originalname,
        fileName: fileName 
      });
    } catch (error: any) {
      console.error('[UploadController] Error upload PDF:', error.message);
      res.status(500).json({ success: false, message: error.message || 'Error al subir el archivo a Supabase' });
    }
  }
}
