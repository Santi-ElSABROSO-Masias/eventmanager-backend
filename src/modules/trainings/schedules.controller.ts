import { Request, Response } from 'express';
import { SchedulesService } from './schedules.service';
import { GenerateScheduleDto } from './dto/schedules.dto';

export class SchedulesController {
    private schedulesService = new SchedulesService();

    generate = async (req: Request, res: Response) => {
        try {
            const generateDto: GenerateScheduleDto = req.body;
            const userId = (req as any).user!.id;

            const schedule = await this.schedulesService.generate(generateDto, userId);
            res.status(201).json({ success: true, data: schedule, message: 'Cronograma generado en borrador' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    findAll = async (req: Request, res: Response) => {
        try {
            const schedules = await this.schedulesService.findAll();
            res.json({ success: true, data: schedules });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    publish = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const userId = (req as any).user!.id;

            const schedule = await this.schedulesService.publish(id, userId);
            res.json({ success: true, data: schedule, message: 'Cronograma publicado correctamente' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
