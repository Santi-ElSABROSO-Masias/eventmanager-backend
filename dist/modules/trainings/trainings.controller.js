"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingsController = void 0;
const trainings_service_1 = require("./trainings.service");
class TrainingsController {
    trainingsService = new trainings_service_1.TrainingsService();
    create = async (req, res) => {
        try {
            const createDto = req.body;
            const userId = req.user.id;
            const training = await this.trainingsService.create(createDto, userId);
            res.status(201).json({ success: true, data: training });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    findAll = async (req, res) => {
        try {
            const { status, companyId } = req.query;
            const trainings = await this.trainingsService.findAll({ status, companyId });
            res.json({ success: true, data: trainings });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    findOne = async (req, res) => {
        try {
            const id = req.params.id;
            const training = await this.trainingsService.findOne(id);
            if (!training) {
                return res.status(404).json({ success: false, message: 'Capacitación no encontrada' });
            }
            res.json({ success: true, data: training });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    update = async (req, res) => {
        try {
            const id = req.params.id;
            const updateDto = req.body;
            const training = await this.trainingsService.update(id, updateDto);
            res.json({ success: true, data: training });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    delete = async (req, res) => {
        try {
            const id = req.params.id;
            await this.trainingsService.delete(id);
            res.json({ success: true, message: 'Capacitación eliminada lógicamente (inactivada)' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    extendDeadline = async (req, res) => {
        try {
            const id = req.params.id;
            const extendDto = req.body;
            const userId = req.user.id;
            const training = await this.trainingsService.extendDeadline(id, extendDto, userId);
            res.json({ success: true, data: training, message: 'Deadline extendido correctamente' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    duplicate = async (req, res) => {
        try {
            const id = req.params.id;
            const duplicateDto = req.body;
            const userId = req.user.id;
            const newTraining = await this.trainingsService.duplicate(id, duplicateDto, userId);
            res.status(201).json({ success: true, data: newTraining, message: 'Capacitación duplicada' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
exports.TrainingsController = TrainingsController;
