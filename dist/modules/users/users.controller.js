"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("./users.service");
class UsersController {
    usersService = new users_service_1.UsersService();
    create = async (req, res) => {
        try {
            const createDto = req.body;
            const user = await this.usersService.create(createDto);
            res.status(201).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error("Zod Validation Error Payload:", error);
            res.status(400).json({ success: false, message: error.message || 'Error de validación', errors: error.errors });
        }
    };
    findAll = async (req, res) => {
        try {
            const users = await this.usersService.findAll();
            res.json({
                success: true,
                data: users
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    findOne = async (req, res) => {
        try {
            const id = req.params.id;
            const user = await this.usersService.findOne(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            res.json({
                success: true,
                data: user
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    update = async (req, res) => {
        try {
            const id = req.params.id;
            const updateDto = req.body;
            const user = await this.usersService.update(id, updateDto);
            res.json({
                success: true,
                data: user
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    delete = async (req, res) => {
        try {
            const id = req.params.id;
            await this.usersService.delete(id);
            res.json({
                success: true,
                message: 'Usuario desactivado correctamente'
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
exports.UsersController = UsersController;
