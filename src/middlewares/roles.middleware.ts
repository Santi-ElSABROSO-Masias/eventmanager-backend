import { Request, Response, NextFunction } from 'express';

export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userPayload = (req as any).user;

        if (!userPayload || !userPayload.role) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }

        if (!allowedRoles.includes(userPayload.role)) {
            return res.status(403).json({ success: false, message: 'Acceso denegado: permisos insuficientes' });
        }

        next();
    };
};
