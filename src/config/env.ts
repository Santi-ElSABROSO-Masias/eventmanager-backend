import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('4000'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    JWT_EXPIRES_IN: z.string().default('1d'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    RESEND_API_KEY: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
