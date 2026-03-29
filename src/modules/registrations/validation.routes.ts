import { Router } from 'express';
import multer from 'multer';
import { ValidationController } from './validation.controller';

const router = Router();
const validationController = new ValidationController();

// Configuración básica de Multer en memoria
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error(JSON.stringify({
      field: 'dni_photo',
      message: 'Solo se permiten imágenes JPG, PNG o WEBP'
    })), false);
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // máximo 10MB
  }
});

// Endpoint público para que el trabajador obtenga sus datos desde su correo
router.get('/:token', validationController.getInfo);

// Endpoint público para subir la foto (Fase 1: solo DNI, Fase futura: Selfie)
router.post('/:token/upload-dni', upload.single('dniPhoto'), validationController.uploadDni);

export default router;
