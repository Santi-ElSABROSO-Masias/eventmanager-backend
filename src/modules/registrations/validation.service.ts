import prisma from '../../config/db';

export class ValidationService {
    async getInfoByToken(token: string) {
        const registration = await prisma.registration.findUnique({
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

    async uploadDni(token: string, file: Express.Multer.File) {
        const registration = await prisma.registration.findUnique({
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

        return prisma.registration.update({
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
