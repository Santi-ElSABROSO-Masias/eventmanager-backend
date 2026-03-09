import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

export class UsersController {
    private usersService = new UsersService();

    create = async (req: Request, res: Response) => {
        try {
            const createDto: CreateUserDto = req.body;
            const user = await this.usersService.create(createDto);

            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            console.error("Zod Validation Error Payload:", error);
            res.status(400).json({ success: false, message: error.message || 'Error de validación', errors: error.errors });
        }
    };

    findAll = async (req: Request, res: Response) => {
        try {
            const users = await this.usersService.findAll();

            res.json({
                success: true,
                data: users
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    findOne = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const user = await this.usersService.findOne(id);

            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const updateDto: UpdateUserDto = req.body;

            const user = await this.usersService.update(id, updateDto);

            res.json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            await this.usersService.delete(id);

            res.json({
                success: true,
                message: 'Usuario desactivado correctamente'
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
