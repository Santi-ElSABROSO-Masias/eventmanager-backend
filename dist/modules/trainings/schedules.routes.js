"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedules_controller_1 = require("./schedules.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_middleware_1 = require("../../middlewares/roles.middleware");
const schedules_dto_1 = require("./dto/schedules.dto");
const router = (0, express_1.Router)();
const schedulesController = new schedules_controller_1.SchedulesController();
router.use(auth_middleware_1.authenticate);
// Listar todos - accesible por cualquiera autenticado
router.get('/', schedulesController.findAll);
// Acciones exclusivas gerencia_sso (Admin Nivel 1)
router.post('/generate', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(schedules_dto_1.generateScheduleSchema), schedulesController.generate);
router.put('/:id/publish', (0, roles_middleware_1.authorize)('super_super_admin'), schedulesController.publish);
exports.default = router;
