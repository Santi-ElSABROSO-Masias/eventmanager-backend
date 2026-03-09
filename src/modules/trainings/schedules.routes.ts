import { Router } from 'express';
import { SchedulesController } from './schedules.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { generateScheduleSchema } from './dto/schedules.dto';

const router = Router();
const schedulesController = new SchedulesController();

router.use(authenticate);

// Listar todos - accesible por cualquiera autenticado
router.get('/', schedulesController.findAll);

// Acciones exclusivas gerencia_sso (Admin Nivel 1)
router.post('/generate', authorize('super_super_admin'), validate(generateScheduleSchema), schedulesController.generate);
router.put('/:id/publish', authorize('super_super_admin'), schedulesController.publish);

export default router;
