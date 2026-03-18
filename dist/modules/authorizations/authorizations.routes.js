"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorizations_controller_1 = require("./authorizations.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_middleware_1 = require("../../middlewares/roles.middleware");
const authorizations_dto_1 = require("./dto/authorizations.dto");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
});
const router = (0, express_1.Router)();
const authController = new authorizations_controller_1.AuthorizationsController();
router.use(auth_middleware_1.authenticate);
// --- File Uploads ---
router.post('/upload', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), upload.single('file'), authController.uploadFile);
// --- High Risk Work ---
router.post('/high-risk', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), (0, validation_middleware_1.validate)(authorizations_dto_1.createHighRiskWorkSchema), authController.createHighRiskWork);
router.get('/high-risk', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), authController.getHighRiskWorks);
router.put('/high-risk/:id/approve', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(authorizations_dto_1.authApprovalSchema), authController.approveHighRiskWork);
// --- Driving Licenses ---
router.post('/driving-licenses', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), (0, validation_middleware_1.validate)(authorizations_dto_1.createDrivingLicenseSchema), authController.createDrivingLicense);
router.get('/driving-licenses', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), authController.getDrivingLicenses);
router.put('/driving-licenses/:id/approve', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(authorizations_dto_1.authApprovalSchema), authController.approveDrivingLicense);
// --- Vehicle Accreditation ---
router.post('/vehicles', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), (0, validation_middleware_1.validate)(authorizations_dto_1.createVehicleSchema), authController.createVehicle);
router.get('/vehicles', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), authController.getVehicles);
router.put('/vehicles/:id/approve', (0, roles_middleware_1.authorize)('super_super_admin'), (0, validation_middleware_1.validate)(authorizations_dto_1.authApprovalSchema), authController.approveVehicle);
exports.default = router;
