import { Router } from 'express';
import { AuthorizationsController } from './authorizations.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { 
    createHighRiskWorkSchema, updateHighRiskWorkSchema,
    createDrivingLicenseSchema, updateDrivingLicenseSchema,
    createVehicleSchema, updateVehicleSchema,
    authApprovalSchema 
} from './dto/authorizations.dto';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

const router = Router();
const authController = new AuthorizationsController();

router.use(authenticate);

// --- File Uploads ---
router.post('/upload', authorize('super_super_admin', 'admin_contratista'), upload.single('file'), authController.uploadFile);

// --- High Risk Work ---
router.post('/high-risk', authorize('super_super_admin', 'admin_contratista'), validate(createHighRiskWorkSchema), authController.createHighRiskWork);
router.get('/high-risk', authorize('super_super_admin', 'admin_contratista'), authController.getHighRiskWorks);
router.put('/high-risk/:id/approve', authorize('super_admin', 'super_super_admin'), validate(authApprovalSchema), authController.approveHighRiskWork);
router.put('/high-risk/:id', authorize('super_super_admin', 'super_admin', 'admin_contratista'), validate(updateHighRiskWorkSchema), authController.updateHighRiskWork);
router.patch('/high-risk/:id/documents', authorize('super_super_admin', 'admin_contratista'), authController.updateHighRiskWorkDocuments);

// --- Driving Licenses ---
router.post('/driving-licenses', authorize('super_super_admin', 'admin_contratista'), validate(createDrivingLicenseSchema), authController.createDrivingLicense);
router.get('/driving-licenses', authorize('super_super_admin', 'admin_contratista'), authController.getDrivingLicenses);
router.put('/driving-licenses/:id/approve', authorize('super_admin', 'super_super_admin'), validate(authApprovalSchema), authController.approveDrivingLicense);
router.put('/driving-licenses/:id', authorize('super_super_admin', 'super_admin', 'admin_contratista'), validate(updateDrivingLicenseSchema), authController.updateDrivingLicense);
router.patch('/driving-licenses/:id/documents', authorize('super_super_admin', 'admin_contratista'), authController.updateDrivingLicenseDocuments);

// --- Vehicle Accreditation ---
router.post('/vehicles', authorize('super_super_admin', 'admin_contratista'), validate(createVehicleSchema), authController.createVehicle);
router.get('/vehicles', authorize('super_super_admin', 'admin_contratista'), authController.getVehicles);
router.put('/vehicles/:id/approve', authorize('super_admin', 'super_super_admin'), validate(authApprovalSchema), authController.approveVehicle);
router.put('/vehicles/:id', authorize('super_super_admin', 'super_admin', 'admin_contratista'), validate(updateVehicleSchema), authController.updateVehicle);
router.patch('/vehicles/:id/documents', authorize('super_super_admin', 'admin_contratista'), authController.updateVehicleDocuments);

export default router;
