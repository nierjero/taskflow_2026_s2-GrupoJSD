import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config';
import { unauthorized } from '../lib/http';

export interface TokenPayload {
  userId: number;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    next(unauthorized());
    return;
  }
  // Se obtiene fuera del try: una clave mal configurada es un error del
  // servidor, no un token inválido del cliente.
  const secret = getJwtSecret();
  try {
    const decoded = jwt.verify(header.slice(7), secret) as TokenPayload;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}