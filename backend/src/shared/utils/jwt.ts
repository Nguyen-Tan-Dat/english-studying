import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
export type AccessClaims = { sub: string; roles: Array<'LEARNER' | 'ADMIN'>; type: 'access' };
export function signAccessToken(user: { id: string; roles: Array<'LEARNER' | 'ADMIN'> }) {
  return jwt.sign({ roles: user.roles, type: 'access' }, env.JWT_SECRET, { subject: user.id, expiresIn: env.ACCESS_TOKEN_TTL_SECONDS });
}
export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, env.JWT_SECRET) as AccessClaims;
}
