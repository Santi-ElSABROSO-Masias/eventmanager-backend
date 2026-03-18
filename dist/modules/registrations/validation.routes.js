"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const validation_controller_1 = require("./validation.controller");
const router = (0, express_1.Router)();
const validationController = new validation_controller_1.ValidationController();
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
// Endpoint público para que el trabajador obtenga sus datos desde su correo
router.get('/:token', validationController.getInfo);
// Endpoint público para subir la foto (Fase 1: solo DNI, Fase futura: Selfie)
router.post('/:token/upload-dni', upload.single('dniPhoto'), validationController.uploadDni);
exports.default = router;
