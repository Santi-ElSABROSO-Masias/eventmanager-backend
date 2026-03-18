"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const db_1 = __importDefault(require("../../config/db"));
class ValidationService {
    async getInfoByToken(token) {
        const registration = await db_1.default.registration.findUnique({
            where: { validation_token: token },
            include: {
                training: {
                    select: { title: true, start_date: true, start_time: true, end_time: true }
                }
            }
        });
        if (!registration) {
            throw new Error('Enlace de validación inválido o expirado');
        }
        if (registration.validation_completed) {
            throw new Error('Esta validación de identidad ya fue completada exitosamente');
        }
        return {
            fullName: registration.full_name,
            dni: registration.dni,
            training: registration.training,
        };
    }
    async uploadDni(token, file) {
        const registration = await db_1.default.registration.findUnique({
            where: { validation_token: token }
        });
        if (!registration) {
            throw new Error('Enlace de validación inválido o expirado');
        }
        if (registration.validation_completed) {
            throw new Error('La validación ya fue completada');
        }
        // TODO: Subir archivo a Cloudinary / S3 y obtener la URL
        // Simularemos la URL por el MVP
        const mockUrl = `https://storage.example.com/dnis/${registration.dni}_${Date.now()}.jpg`;
        return db_1.default.registration.update({
            where: { id: registration.id },
            data: {
                dni_photo_url: mockUrl,
                identity_validated: true,
                validation_completed: true,
                validation_date: new Date(),
                validation_token: null, // Invalidar token para 1 solo uso
            }
        });
    }
}
exports.ValidationService = ValidationService;
