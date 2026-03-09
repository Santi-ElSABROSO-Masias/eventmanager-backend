import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../src/config/db';

async function main() {
    const hash = await bcrypt.hash('admin123', 10);

    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@catalina.com' },
        update: {},
        create: {
            email: 'admin@catalina.com',
            password_hash: hash,
            name: 'Gerencia SSO Default',
            role: Role.super_super_admin,
        },
    });

    const contratista = await prisma.user.upsert({
        where: { email: 'contrata@catalina.com' },
        update: {},
        create: {
            email: 'contrata@catalina.com',
            password_hash: hash,
            name: 'Administrador Demo',
            role: Role.admin_contratista,
        },
    });

    console.log('Test users created:', { superAdmin: superAdmin.email, contratista: contratista.email });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
