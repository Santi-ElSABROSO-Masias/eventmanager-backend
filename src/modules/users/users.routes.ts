import { Router } from 'express';
import { UsersController } from './users.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { createUserSchema, updateUserSchema } from './dto/users.dto';

const router = Router();
const usersController = new UsersController();

// Todos los endpoints de usuarios requieren autenticación y rol de gerencia_sso (Admin Nivel 1)
router.use(authenticate);
router.use(authorize('super_super_admin'));

router.get('/', usersController.findAll);
router.post('/', validate(createUserSchema), usersController.create);
router.get('/:id', usersController.findOne);
router.put('/:id', validate(updateUserSchema), usersController.update);
router.delete('/:id', usersController.delete);

export default router;
