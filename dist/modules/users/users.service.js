"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const hash_1 = require("../../utils/hash");
class UsersService {
    async create(data) {
        const existingUser = await db_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('El correo electrónico ya está registrado');
        }
        const hashedPassword = await (0, hash_1.hashPassword)(data.password);
        return db_1.default.user.create({
            data: {
                email: data.email,
                password_hash: hashedPassword,
                name: data.name,
                role: data.role,
                company_id: data.companyId || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                company_id: true,
                is_active: true,
                created_at: true,
            }
        });
    }
    async findAll() {
        return db_1.default.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                company_id: true,
                is_active: true,
                created_at: true,
            }
        });
    }
    async findOne(id) {
        return db_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                company_id: true,
                is_active: true,
                created_at: true,
            }
        });
    }
    async update(id, data) {
        const user = await db_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return db_1.default.user.update({
            where: { id },
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                company_id: data.companyId,
                is_active: data.is_active,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                company_id: true,
                is_active: true,
                updated_at: true,
            }
        });
    }
    async delete(id) {
        const user = await db_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return db_1.default.user.update({
            where: { id },
            data: { is_active: false },
        });
    }
}
exports.UsersService = UsersService;
