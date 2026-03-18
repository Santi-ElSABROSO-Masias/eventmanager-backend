"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trainings_controller_1 = require("./trainings.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_middleware_1 = require("../../middlewares/roles.middleware");
const trainings_dto_1 = require("./dto/trainings.dto");
const router = (0, express_1.Router)();
const trainingsController = new trainings_controller_1.TrainingsController();
router.use(auth_middleware_1.authenticate);
router.get('/', trainingsController.findAll);
router.get('/:id', trainingsController.findOne);
// Acciones exclusivas de gerencia_sso
router.post('/', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(trainings_dto_1.createTrainingSchema), trainingsController.create);
router.put('/:id', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(trainings_dto_1.updateTrainingSchema), trainingsController.update);
router.delete('/:id', (0, roles_middleware_1.authorize)('super_super_admin'), trainingsController.delete);
// Acciones específicas
router.put('/:id/extend-deadline', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(trainings_dto_1.extendDeadlineSchema), trainingsController.extendDeadline);
router.post('/:id/duplicate', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(trainings_dto_1.duplicateSchema), trainingsController.duplicate);
exports.default = router;
