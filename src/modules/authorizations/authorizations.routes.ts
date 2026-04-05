import { Router } from 'express';
import { AuthorizationsController } from './authorizations.controller';
import { validate } from '../../middlewares/validation.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';
import { createHighRiskWorkSchema, createDrivingLicenseSchema, createVehicleSchema, authApprovalSchema } from './dto/authorizations.dto';
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

// --- Driving Licenses ---
router.post('/driving-licenses', authorize('super_super_admin', 'admin_contratista'), validate(createDrivingLicenseSchema), authController.createDrivingLicense);
router.get('/driving-licenses', authorize('super_super_admin', 'admin_contratista'), authController.getDrivingLicenses);
router.put('/driving-licenses/:id/approve', authorize('super_admin', 'super_super_admin'), validate(authApprovalSchema), authController.approveDrivingLicense);

// --- Vehicle Accreditation ---
router.post('/vehicles', authorize('super_super_admin', 'admin_contratista'), validate(createVehicleSchema), authController.createVehicle);
router.get('/vehicles', authorize('super_super_admin', 'admin_contratista'), authController.getVehicles);
router.put('/vehicles/:id/approve', authorize('super_admin', 'super_super_admin'), validate(authApprovalSchema), authController.approveVehicle);

export default router;
