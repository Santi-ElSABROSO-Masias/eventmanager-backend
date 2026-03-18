"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userPayload = req.user;
        if (!userPayload || !userPayload.role) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }
        if (!allowedRoles.includes(userPayload.role)) {
            return res.status(403).json({ success: false, message: 'Acceso denegado: permisos insuficientes' });
        }
        next();
    };
};
exports.authorize = authorize;
