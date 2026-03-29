"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
// CRITICAL: Confiar en el proxy (necesario para Easypanel y X-Forwarded-For en express-rate-limit)
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100
}));
// Middleware
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN || 'http://localhost:3000', // Restricción CORS estricta requerida por seguridad VPS
    credentials: true, // Permitir auth headers
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const companies_routes_1 = __importDefault(require("./modules/companies/companies.routes"));
const trainings_routes_1 = __importDefault(require("./modules/trainings/trainings.routes"));
const schedules_routes_1 = __importDefault(require("./modules/trainings/schedules.routes"));
const registrations_routes_1 = __importDefault(require("./modules/registrations/registrations.routes"));
const validation_routes_1 = __importDefault(require("./modules/registrations/validation.routes"));
const exams_routes_1 = __importDefault(require("./modules/exams/exams.routes"));
const authorizations_routes_1 = __importDefault(require("./modules/authorizations/authorizations.routes"));
// Import and use routes here
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/companies', companies_routes_1.default);
app.use('/api/trainings', trainings_routes_1.default);
app.use('/api/schedules', schedules_routes_1.default);
app.use('/api/registrations', registrations_routes_1.default);
app.use('/api/validation', validation_routes_1.default);
app.use('/api/exams', exams_routes_1.default);
app.use('/api/authorizations', authorizations_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
