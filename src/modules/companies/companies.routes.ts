import { Router } from 'express';
import { CompaniesController } from './companies.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { createCompanySchema, updateCompanySchema, requestQuotaSchema, approveQuotaSchema } from './dto/companies.dto';

const router = Router();
const companiesController = new CompaniesController();

router.use(authenticate);

// Listar y ver empresas (accesible por gerencia_sso, capacitadores y administradores contratistas)
router.get('/', authorize('super_super_admin', 'super_admin', 'admin_contratista'), companiesController.findAll);
router.get('/:id', authorize('super_super_admin', 'super_admin', 'admin_contratista'), companiesController.findOne);

// Acciones exclusivas de gerencia_sso
router.post('/', authorize('super_super_admin'), validate(createCompanySchema), companiesController.create);
router.put('/:id', authorize('super_super_admin'), validate(updateCompanySchema), companiesController.update);
router.put('/:id/approve-quota', authorize('super_super_admin'), validate(approveQuotaSchema), companiesController.approveQuota);

// Solicitud de cupos (Por administrador contratista)
router.post('/:id/request-quota', authorize('super_super_admin', 'admin_contratista'), validate(requestQuotaSchema), companiesController.requestQuota);
router.get('/:id/quota-history', authorize('super_super_admin', 'admin_contratista'), companiesController.getQuotaHistory);

export default router;
