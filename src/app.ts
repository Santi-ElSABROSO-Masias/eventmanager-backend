import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';

const app: Express = express();

// CRITICAL: Confiar en el proxy (necesario para Easypanel y X-Forwarded-For en express-rate-limit)
app.set('trust proxy', 1);

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Middleware
app.use(cors({
    origin: env.CORS_ORIGIN || 'http://localhost:3000', // Restricción CORS estricta requerida por seguridad VPS
    credentials: true, // Permitir auth headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import companiesRoutes from './modules/companies/companies.routes';
import trainingsRoutes from './modules/trainings/trainings.routes';
import schedulesRoutes from './modules/trainings/schedules.routes';
import registrationsRoutes from './modules/registrations/registrations.routes';
import validationRoutes from './modules/registrations/validation.routes';
import examsRoutes from './modules/exams/exams.routes';
import authorizationsRoutes from './modules/authorizations/authorizations.routes';
import externalRoutes from './modules/external/external.routes';
import uploadRoutes from './modules/upload/upload.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';


// Import and use routes here
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/authorizations', authorizationsRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);

import multer from 'multer';

// Multer Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message) {
    try {
      const errorData = JSON.parse(err.message);
      return res.status(400).json({
        success: false,
        ...errorData
      });
    } catch {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
  next(err);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

export default app;
