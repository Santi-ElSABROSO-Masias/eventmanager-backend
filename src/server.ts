import { env } from './config/env';
import app from './app';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`Resolved CORS_ORIGIN: ${env.CORS_ORIGIN}`);
});

// Manejadores de errores no capturados para evitar crashes silenciosos
process.on('uncaughtException', (error) => {
    console.error('[CRASH] uncaughtException:', error.message);
    console.error('[CRASH] Stack:', error.stack);
});

process.on('unhandledRejection', (reason: any) => {
    console.error('[CRASH] unhandledRejection:', reason?.message || reason);
    if (reason?.stack) {
        console.error('[CRASH] Stack:', reason.stack);
    }
});
