"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const registrations_controller_1 = require("./registrations.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_middleware_1 = require("../../middlewares/roles.middleware");
const registrations_dto_1 = require("./dto/registrations.dto");
const router = (0, express_1.Router)();
const registrationsController = new registrations_controller_1.RegistrationsController();
// Configuración básica de Multer en memoria
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
router.use(auth_middleware_1.authenticate);
// Listar inscritos (El controlador filtra qué ve cada rol)
router.get('/', (0, roles_middleware_1.authorize)('super_super_admin', 'super_admin', 'admin_contratista'), registrationsController.findAll);
// Inscribir trabajador (Admin Contratista o superiores)
router.post('/', (0, roles_middleware_1.authorize)('super_super_admin', 'super_admin', 'admin_contratista'), (0, validation_middleware_1.validate)(registrations_dto_1.createRegistrationSchema), registrationsController.create);
// Inscribir masivamente (Excel)
router.post('/bulk', (0, roles_middleware_1.authorize)('super_super_admin', 'super_admin', 'admin_contratista'), upload.single('file'), registrationsController.bulkRegister);
// Editar un participante
router.patch('/:id', (0, roles_middleware_1.authorize)('super_super_admin', 'admin_contratista'), (0, validation_middleware_1.validate)(registrations_dto_1.updateRegistrationSchema), registrationsController.update);
// Validaciones Multinivel
// Nivel 2: Capacitador revisa documentos
router.put('/:id/validate', (0, roles_middleware_1.authorize)('super_admin', 'super_super_admin'), (0, validation_middleware_1.validate)(registrations_dto_1.validationSchema), registrationsController.validateLevel2);
// Nivel 1: Gerencia SSO aprueba finalmente (ruta original PUT)
router.put('/:id/approve', (0, roles_middleware_1.authorize)('super_super_admin'), registrationsController.approveLevel1);
// Nivel 1: Ruta PATCH requerida por el frontend
router.patch('/:id/approve-level-1', (0, roles_middleware_1.authorize)('super_super_admin', 'super_admin', 'admin_contratista'), registrationsController.approveLevel1);
exports.default = router;
