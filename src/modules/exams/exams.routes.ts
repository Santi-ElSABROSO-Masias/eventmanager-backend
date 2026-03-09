import { Router } from 'express';
import { ExamsController } from './exams.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { createExamSchema, addQuestionSchema, submitExamSchema } from './dto/exams.dto';

const router = Router();
const examsController = new ExamsController();

// ---- ENDPOINTS PÚBLICOS (Trabajadores) ----
router.get('/public/:link', examsController.getPublicExam);
router.post('/public/:link/submit', validate(submitExamSchema), examsController.submitAnswers);

// ---- ENDPOINTS PRIVADOS (Administradores/Capacitadores) ----
router.use(authenticate);

// Solo Capacitadores y Gerencia SSO pueden crear y gestionar exámenes
router.post('/', authorize('super_admin', 'super_super_admin'), validate(createExamSchema), examsController.create);
router.post('/:id/questions', authorize('super_admin', 'super_super_admin'), validate(addQuestionSchema), examsController.addQuestion);
router.put('/:id/publish', authorize('super_admin', 'super_super_admin'), examsController.publish);
router.get('/:id/results', authorize('super_admin', 'super_super_admin'), examsController.getResults);

export default router;
