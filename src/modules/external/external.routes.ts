import { Router } from 'express';
import { ExternalController } from './external.controller';

const router = Router();
const controller = new ExternalController();

// GET /api/external/dni/:dni
router.get('/dni/:dni', (req, res) => controller.getDni(req, res));

export default router;
