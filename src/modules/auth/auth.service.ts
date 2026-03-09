import prisma from '../../config/db';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

export class AuthService {
    async register(data: RegisterDto) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('El correo electrónico ya está registrado');
        }

        const hashedPassword = await hashPassword(data.password);

        const user = await prisma.user.create({
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

        const token = generateToken({
            id: user.id,
            role: user.role,
            companyId: user.company_id
        });

        return { user, token };
    }

    async login(data: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user || !user.is_active) {
            throw new Error('Credenciales inválidas o usuario inactivo');
        }

        const isMatch = await comparePassword(data.password, user.password_hash);

        if (!isMatch) {
            throw new Error('Credenciales inválidas o usuario inactivo');
        }

        const token = generateToken({
            id: user.id,
            role: user.role,
            companyId: user.company_id
        });

        const { password_hash, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
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
