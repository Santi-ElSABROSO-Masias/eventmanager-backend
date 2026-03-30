"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsController = void 0;
const registrations_service_1 = require("./registrations.service");
class RegistrationsController {
    registrationsService = new registrations_service_1.RegistrationsService();
    create = async (req, res) => {
        try {
            const createDto = req.body;
            const userId = req.user.id;
            const registration = await this.registrationsService.create(createDto, userId);
            res.status(201).json({ success: true, data: registration, message: 'Trabajador inscrito correctamente' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    findAll = async (req, res) => {
        try {
            const { trainingId, status } = req.query;
            const userRole = req.user.role;
            const userCompanyId = req.user.companyId;
            const registrations = await this.registrationsService.findAll({ trainingId, status, userRole, userCompanyId });
            res.json({ success: true, data: registrations });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    validateLevel2 = async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const userId = req.user.id;
            const registration = await this.registrationsService.validate(id, data.status, userId, data.rejectionReason);
            res.json({ success: true, data: registration, message: `Inscripción ${data.status} por Nivel 2` });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    approveLevel1 = async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user.id;
            const { meetingLink } = req.body;
            const registration = await this.registrationsService.approveFinal(id, userId, meetingLink);
            res.json({ success: true, data: registration, message: 'Inscripción aprobada por Nivel 1' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    bulkRegister = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Debe subir un archivo Excel' });
            }
            // Excel processing logic goes here
            return res.status(501).json({ success: false, message: 'Importación masiva en desarrollo (Falta integración con Excel)' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    update = async (req, res) => {
        try {
            const id = req.params.id;
            const updateDto = req.body;
            const updatedRegistration = await this.registrationsService.update(id, updateDto);
            res.status(200).json({ success: true, data: updatedRegistration, message: 'Participante actualizado correctamente' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
exports.RegistrationsController = RegistrationsController;
