import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

export function requireApiAuth(req: Request, res: Response, next: NextFunction) {
    const authState = getAuth(req);
    if (!authState.userId) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'error. you must provide a valid authentication token to access this endpoint.'
        });

        return;
    }

    next();
}
