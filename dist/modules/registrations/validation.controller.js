"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationController = void 0;
const validation_service_1 = require("./validation.service");
class ValidationController {
    validationService = new validation_service_1.ValidationService();
    getInfo = async (req, res) => {
        try {
            const token = req.params.token;
            const info = await this.validationService.getInfoByToken(token);
            res.json({ success: true, data: info });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    };
    uploadDni = async (req, res) => {
        try {
            const token = req.params.token;
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Debe proporcionar una imagen de su DNI' });
            }
            if (req.file && req.file.size < 100 * 1024) {
                return res.status(400).json({
                    success: false,
                    field: 'dni_photo',
                    message: 'La imagen es muy pequeña. Sube una foto clara y legible de tu DNI (mín. 100KB)'
                });
            }
            const registration = await this.validationService.uploadDni(token, req.file);
            res.json({
                success: true,
                message: 'Identidad validada exitosamente. Su registro está pendiente de aprobación.',
                data: registration.identity_validated
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
exports.ValidationController = ValidationController;
