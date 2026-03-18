"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsController = void 0;
const exams_service_1 = require("./exams.service");
class ExamsController {
    examsService = new exams_service_1.ExamsService();
    create = async (req, res) => {
        try {
            const createDto = req.body;
            const exam = await this.examsService.create(createDto);
            res.status(201).json({ success: true, data: exam });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    addQuestion = async (req, res) => {
        try {
            const examId = req.params.id;
            const data = req.body;
            const question = await this.examsService.addQuestion(examId, data);
            res.status(201).json({ success: true, data: question });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    publish = async (req, res) => {
        try {
            const examId = req.params.id;
            const exam = await this.examsService.publish(examId);
            res.json({ success: true, data: exam, message: 'Examen publicado correctamente' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    getResults = async (req, res) => {
        try {
            const examId = req.params.id;
            const results = await this.examsService.getResults(examId);
            res.json({ success: true, data: results });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    // ---- PUBLIC ENDPOINTS ----
    getPublicExam = async (req, res) => {
        try {
            const link = req.params.link;
            const exam = await this.examsService.getPublicExam(link);
            res.json({ success: true, data: exam });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    };
    submitAnswers = async (req, res) => {
        try {
            const link = req.params.link;
            const data = req.body;
            const result = await this.examsService.submitAnswers(link, data);
            res.json({
                success: true,
                message: 'Respuestas enviadas correctamente',
                data: {
                    score: result.score,
                    passed: result.passed
                }
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
exports.ExamsController = ExamsController;
