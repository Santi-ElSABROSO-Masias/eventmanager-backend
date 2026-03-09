import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

export class AuthController {
    private authService = new AuthService();

    login = async (req: Request, res: Response) => {
        try {
            const loginDto: LoginDto = req.body;
            const result = await this.authService.login(loginDto);

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    };

    register = async (req: Request, res: Response) => {
        try {
            const registerDto: RegisterDto = req.body;
            const result = await this.authService.register(registerDto);

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    getMe = async (req: Request, res: Response) => {
        try {
            const userPayload = (req as any).user;
            if (!userPayload) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const user = await this.authService.getMe(userPayload.id);

            res.json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    };
}
