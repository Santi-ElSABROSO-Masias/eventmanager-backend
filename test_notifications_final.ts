const { NotificationsService } = require('./src/modules/notifications/notifications.service');
const prisma = require('./src/config/db').default; // Assuming it's commonjs or similar? No, it's TS.
// Wait, I'll use npx ts-node to run the test script.

async function testService() {
    const service = new NotificationsService();
    try {
        console.log('--- Testing getUserNotifications ---');
        // Usamos un correo que sepamos que existe o uno dummy
        const notifications = await service.getUserNotifications('test@example.com');
        console.log('Success! Found', notifications.length, 'notifications.');
        console.log('First notification sample:', notifications[0] || 'None');
        
        console.log('\n--- Testing write access (optional) ---');
        // No crearemos datos reales a menos que sea necesario
        
    } catch (err) {
        console.error('Error during service test:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testService();
