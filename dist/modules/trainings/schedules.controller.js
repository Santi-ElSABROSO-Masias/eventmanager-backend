"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesController = void 0;
const schedules_service_1 = require("./schedules.service");
class SchedulesController {
    schedulesService = new schedules_service_1.SchedulesService();
    generate = async (req, res) => {
        try {
            const generateDto = req.body;
            const userId = req.user.id;
            const schedule = await this.schedulesService.generate(generateDto, userId);
            res.status(201).json({ success: true, data: schedule, message: 'Cronograma generado en borrador' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    findAll = async (req, res) => {
        try {
            const schedules = await this.schedulesService.findAll();
            res.json({ success: true, data: schedules });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    publish = async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user.id;
            const schedule = await this.schedulesService.publish(id, userId);
            res.json({ success: true, data: schedule, message: 'Cronograma publicado correctamente' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
exports.SchedulesController = SchedulesController;
