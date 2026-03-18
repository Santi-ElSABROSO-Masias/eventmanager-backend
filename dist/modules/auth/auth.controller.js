"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    authService = new auth_service_1.AuthService();
    login = async (req, res) => {
        try {
            const loginDto = req.body;
            const result = await this.authService.login(loginDto);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    };
    register = async (req, res) => {
        try {
            const registerDto = req.body;
            const result = await this.authService.register(registerDto);
            res.status(201).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
    getMe = async (req, res) => {
        try {
            const userPayload = req.user;
            if (!userPayload) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            const user = await this.authService.getMe(userPayload.id);
            res.json({
                success: true,
                data: user
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    };
}
exports.AuthController = AuthController;
