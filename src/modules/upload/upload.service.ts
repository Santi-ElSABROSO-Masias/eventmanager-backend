import { supabase } from '../../config/supabase';

export class UploadService {
  async uploadPdf(file: Express.Multer.File, category?: string) {
    const bucketName = 'autorizaciones';
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = category ? `${category}/${fileName}` : `${fileName}`;

    console.log(`[UploadService] Preparando subida: bucket=${bucketName}, path=${filePath}, size=${file.size} bytes, category=${category}`);

    try {
      // Intentar la subida del Buffer a Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (error) {
        console.error('[UploadService] Error de Supabase Storage (upload):', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('[UploadService] Archivo subido exitosamente:', data.path);

      // Obtener la URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        console.error('[UploadService] No se pudo obtener la URL pública para:', filePath);
        throw new Error('Error al obtener la URL pública de Supabase.');
      }

      return {
        url: urlData.publicUrl,
        fileName: fileName,
        originalName: file.originalname
      };
    } catch (err: any) {
      console.error('[UploadService] Error crítico durante el proceso de subida:', err.message);
      if (err.stack) console.error(err.stack);
      throw err;
    }
  }
}
