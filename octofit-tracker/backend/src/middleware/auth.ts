import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string };
    }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }
  return secret;
}

export function createAccessToken(userId: string): string {
  return jwt.sign({}, getJwtSecret(), { subject: userId, expiresIn: '1h' });
}

export const requireAuth: RequestHandler = (request, response, next) => {
  const authorization = request.get('authorization');
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    response.status(401).json({ error: 'A bearer token is required' });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('sub' in payload) ||
      typeof payload.sub !== 'string'
    ) {
      response.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    request.auth = { userId: payload.sub };
    next();
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' });
  }
};
