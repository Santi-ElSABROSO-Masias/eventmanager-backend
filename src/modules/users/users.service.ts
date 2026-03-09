import prisma from '../../config/db';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { hashPassword } from '../../utils/hash';

export class UsersService {
    async create(data: CreateUserDto) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('El correo electrónico ya está registrado');
        }

        const hashedPassword = await hashPassword(data.password);

        return prisma.user.create({
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
        return prisma.user.findMany({
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

    async findOne(id: string) {
        return prisma.user.findUnique({
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

    async update(id: string, data: UpdateUserDto) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        return prisma.user.update({
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

    async delete(id: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        return prisma.user.update({
            where: { id },
            data: { is_active: false },
        });
    }
}
