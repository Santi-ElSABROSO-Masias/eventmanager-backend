import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validation.middleware';
import { loginSchema, registerSchema } from './dto/auth.dto';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.get('/me', authenticate, authController.getMe);

export default router;
