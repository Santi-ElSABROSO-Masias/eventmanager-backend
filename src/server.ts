import { env } from './config/env';
import app from './app';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`Resolved CORS_ORIGIN: ${env.CORS_ORIGIN}`);
});
