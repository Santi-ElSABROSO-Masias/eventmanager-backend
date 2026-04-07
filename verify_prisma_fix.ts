import prisma from './src/config/db';

async function verifyQuery() {
    try {
        console.log('Querying systemNotification table...');
        // Esta query fallaba antes con P2022. Si ahora funciona, el fix es exitoso.
        const result = await prisma.systemNotification.findMany({
            take: 1
        });
        console.log('SUCCESS! Query executed without P2022 error.');
        console.log('Result:', result);
    } catch (err) {
        console.error('STILL FAILING:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyQuery();
