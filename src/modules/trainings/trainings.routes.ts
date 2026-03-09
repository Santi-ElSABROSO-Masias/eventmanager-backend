import { Router } from 'express';
import { TrainingsController } from './trainings.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { createTrainingSchema, updateTrainingSchema, extendDeadlineSchema, duplicateSchema } from './dto/trainings.dto';

const router = Router();
const trainingsController = new TrainingsController();

router.use(authenticate);

router.get('/', trainingsController.findAll);
router.get('/:id', trainingsController.findOne);

// Acciones exclusivas de gerencia_sso
router.post('/', authorize('super_super_admin'), validate(createTrainingSchema), trainingsController.create);
router.put('/:id', authorize('super_super_admin'), validate(updateTrainingSchema), trainingsController.update);
router.delete('/:id', authorize('super_super_admin'), trainingsController.delete);

// Acciones específicas
router.put('/:id/extend-deadline', authorize('super_super_admin'), validate(extendDeadlineSchema), trainingsController.extendDeadline);
router.post('/:id/duplicate', authorize('super_super_admin'), validate(duplicateSchema), trainingsController.duplicate);

export default router;
