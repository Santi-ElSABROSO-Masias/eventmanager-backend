import { Router } from 'express';
import multer from 'multer';
import { RegistrationsController } from './registrations.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { createRegistrationSchema, validationSchema } from './dto/registrations.dto';

const router = Router();
const registrationsController = new RegistrationsController();

// Configuración básica de Multer en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

router.use(authenticate);

// Listar inscritos (El controlador filtra qué ve cada rol)
router.get('/', authorize('super_super_admin', 'super_admin', 'admin_contratista'), registrationsController.findAll);

// Inscribir trabajador (Admin Contratista o superiores)
router.post('/', authorize('super_super_admin', 'super_admin', 'admin_contratista'), validate(createRegistrationSchema), registrationsController.create);

// Inscribir masivamente (Excel)
router.post('/bulk', authorize('super_super_admin', 'super_admin', 'admin_contratista'), upload.single('file'), registrationsController.bulkRegister);

// Validaciones Multinivel
// Nivel 2: Capacitador revisa documentos
router.put('/:id/validate', authorize('super_admin', 'super_super_admin'), validate(validationSchema), registrationsController.validateLevel2);

// Nivel 1: Gerencia SSO aprueba finalmente
router.put('/:id/approve', authorize('super_super_admin'), registrationsController.approveLevel1);

export default router;
