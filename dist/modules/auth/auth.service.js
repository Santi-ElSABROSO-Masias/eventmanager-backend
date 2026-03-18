"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
class AuthService {
    async register(data) {
        const existingUser = await db_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('El correo electrónico ya está registrado');
        }
        const hashedPassword = await (0, hash_1.hashPassword)(data.password);
        const user = await db_1.default.user.create({
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
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            role: user.role,
            companyId: user.company_id
        });
        return { user, token };
    }
    async login(data) {
        const user = await db_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (!user || !user.is_active) {
            throw new Error('Credenciales inválidas o usuario inactivo');
        }
        const isMatch = await (0, hash_1.comparePassword)(data.password, user.password_hash);
        if (!isMatch) {
            throw new Error('Credenciales inválidas o usuario inactivo');
        }
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            role: user.role,
            companyId: user.company_id
        });
        const { password_hash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async getMe(userId) {
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
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
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    }
}
exports.AuthService = AuthService;
