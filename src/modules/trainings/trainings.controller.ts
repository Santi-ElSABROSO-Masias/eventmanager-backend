import { Request, Response } from 'express';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto, UpdateTrainingDto, ExtendDeadlineDto, DuplicateDto } from './dto/trainings.dto';

export class TrainingsController {
    private trainingsService = new TrainingsService();

    create = async (req: Request, res: Response) => {
        try {
            const createDto: CreateTrainingDto = req.body;
            const userId = (req as any).user!.id;

            const training = await this.trainingsService.create(createDto, userId);
            res.status(201).json({ success: true, data: training });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    findAll = async (req: Request, res: Response) => {
        try {
            const { status, companyId } = req.query;

            const trainings = await this.trainingsService.findAll({ status, companyId });
            res.json({ success: true, data: trainings });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    findOne = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const training = await this.trainingsService.findOne(id);

            if (!training) {
                return res.status(404).json({ success: false, message: 'Capacitación no encontrada' });
            }
            res.json({ success: true, data: training });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const updateDto: UpdateTrainingDto = req.body;

            const training = await this.trainingsService.update(id, updateDto);
            res.json({ success: true, data: training });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            await this.trainingsService.delete(id);
            res.json({ success: true, message: 'Capacitación eliminada lógicamente (inactivada)' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    extendDeadline = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const extendDto: ExtendDeadlineDto = req.body;
            const userId = (req as any).user!.id;

            const training = await this.trainingsService.extendDeadline(id, extendDto, userId);
            res.json({ success: true, data: training, message: 'Deadline extendido correctamente' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    duplicate = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const duplicateDto: DuplicateDto = req.body;
            const userId = (req as any).user!.id;

            const newTraining = await this.trainingsService.duplicate(id, duplicateDto, userId);
            res.status(201).json({ success: true, data: newTraining, message: 'Capacitación duplicada' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
