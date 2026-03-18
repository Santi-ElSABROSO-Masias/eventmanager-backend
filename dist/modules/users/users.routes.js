"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_middleware_1 = require("../../middlewares/roles.middleware");
const users_dto_1 = require("./dto/users.dto");
const router = (0, express_1.Router)();
const usersController = new users_controller_1.UsersController();
// Todos los endpoints de usuarios requieren autenticación y rol de gerencia_sso (Admin Nivel 1)
router.use(auth_middleware_1.authenticate);
router.use((0, roles_middleware_1.authorize)('super_super_admin'));
router.get('/', usersController.findAll);
router.post('/', (0, validation_middleware_1.validate)(users_dto_1.createUserSchema), usersController.create);
router.get('/:id', usersController.findOne);
router.put('/:id', (0, validation_middleware_1.validate)(users_dto_1.updateUserSchema), usersController.update);
router.delete('/:id', usersController.delete);
exports.default = router;
