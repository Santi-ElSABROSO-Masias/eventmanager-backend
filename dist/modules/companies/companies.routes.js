"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companies_controller_1 = require("./companies.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_middleware_1 = require("../../middlewares/roles.middleware");
const companies_dto_1 = require("./dto/companies.dto");
const router = (0, express_1.Router)();
const companiesController = new companies_controller_1.CompaniesController();
router.use(auth_middleware_1.authenticate);
// Listar y ver empresas (accesible por gerencia_sso y administradores contratistas que ven su propia data)
// NOTA: Para producción agregar middleware para asegurar que administrador solo ve su propia empresa.
router.get('/', (0, roles_middleware_1.authorize)('super_super_admin'), companiesController.findAll);
router.get('/:id', companiesController.findOne);
// Acciones exclusivas de gerencia_sso
router.post('/', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(companies_dto_1.createCompanySchema), companiesController.create);
router.put('/:id', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(companies_dto_1.updateCompanySchema), companiesController.update);
router.put('/:id/approve-quota', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(companies_dto_1.approveQuotaSchema), companiesController.approveQuota);
// Solicitud de cupos (Por administrador contratista)
router.post('/:id/request-quota', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), (0, validation_middleware_1.validate)(companies_dto_1.requestQuotaSchema), companiesController.requestQuota);
router.get('/:id/quota-history', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), companiesController.getQuotaHistory);
exports.default = router;
