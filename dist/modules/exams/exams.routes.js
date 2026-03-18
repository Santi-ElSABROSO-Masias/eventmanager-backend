"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exams_controller_1 = require("./exams.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_middleware_1 = require("../../middlewares/roles.middleware");
const exams_dto_1 = require("./dto/exams.dto");
const router = (0, express_1.Router)();
const examsController = new exams_controller_1.ExamsController();
// ---- ENDPOINTS PÚBLICOS (Trabajadores) ----
router.get('/public/:link', examsController.getPublicExam);
router.post('/public/:link/submit', (0, validation_middleware_1.validate)(exams_dto_1.submitExamSchema), examsController.submitAnswers);
// ---- ENDPOINTS PRIVADOS (Administradores/Capacitadores) ----
router.use(auth_middleware_1.authenticate);
// Solo Capacitadores y Gerencia SSO pueden crear y gestionar exámenes
router.post('/', (0, roles_middleware_1.authorize)('super_admin', 'super_super_admin'), (0, validation_middleware_1.validate)(exams_dto_1.createExamSchema), examsController.create);
router.post('/:id/questions', (0, roles_middleware_1.authorize)('super_admin', 'super_super_admin'), (0, validation_middleware_1.validate)(exams_dto_1.addQuestionSchema), examsController.addQuestion);
router.put('/:id/publish', (0, roles_middleware_1.authorize)('super_admin', 'super_super_admin'), examsController.publish);
router.get('/:id/results', (0, roles_middleware_1.authorize)('super_admin', 'super_super_admin'), examsController.getResults);
exports.default = router;
