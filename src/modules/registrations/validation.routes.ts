import { Router } from 'express';
import multer from 'multer';
import { ValidationController } from './validation.controller';

const router = Router();
const validationController = new ValidationController();

// Configuración básica de Multer en memoria
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint público para que el trabajador obtenga sus datos desde su correo
router.get('/:token', validationController.getInfo);

// Endpoint público para subir la foto (Fase 1: solo DNI, Fase futura: Selfie)
router.post('/:token/upload-dni', upload.single('dniPhoto'), validationController.uploadDni);

export default router;
