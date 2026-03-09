import { Request, Response } from 'express';
import { ExamsService } from './exams.service';
import { CreateExamDto, AddQuestionDto, SubmitExamDto } from './dto/exams.dto';

export class ExamsController {
    private examsService = new ExamsService();

    create = async (req: Request, res: Response) => {
        try {
            const createDto: CreateExamDto = req.body;
            const exam = await this.examsService.create(createDto);
            res.status(201).json({ success: true, data: exam });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    addQuestion = async (req: Request, res: Response) => {
        try {
            const examId = req.params.id as string;
            const data: AddQuestionDto = req.body;
            const question = await this.examsService.addQuestion(examId, data);
            res.status(201).json({ success: true, data: question });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    publish = async (req: Request, res: Response) => {
        try {
            const examId = req.params.id as string;
            const exam = await this.examsService.publish(examId);
            res.json({ success: true, data: exam, message: 'Examen publicado correctamente' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getResults = async (req: Request, res: Response) => {
        try {
            const examId = req.params.id as string;
            const results = await this.examsService.getResults(examId);
            res.json({ success: true, data: results });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // ---- PUBLIC ENDPOINTS ----
    getPublicExam = async (req: Request, res: Response) => {
        try {
            const link = req.params.link as string;
            const exam = await this.examsService.getPublicExam(link);
            res.json({ success: true, data: exam });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message });
        }
    };

    submitAnswers = async (req: Request, res: Response) => {
        try {
            const link = req.params.link as string;
            const data: SubmitExamDto = req.body;

            const result = await this.examsService.submitAnswers(link, data);
            res.json({
                success: true,
                message: 'Respuestas enviadas correctamente',
                data: {
                    score: result.score,
                    passed: result.passed
                }
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
