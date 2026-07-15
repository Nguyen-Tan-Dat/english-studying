import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';
const cookie = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/v1/auth', maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86_400_000 };
export const register = (req: Request,res: Response) => { const result=authService.register(req.body); res.cookie('lexigo_refresh',result.refreshToken,cookie).status(201).json(result.payload); };
export const login = async (req: Request,res: Response) => { const result=await authService.login(req.body); res.cookie('lexigo_refresh',result.refreshToken,cookie).json(result.payload); };
export const refresh = (req: Request,res: Response) => { const result=authService.refresh(req.cookies.lexigo_refresh); res.cookie('lexigo_refresh',result.refreshToken,cookie).json(result.payload); };
export const logout = (req: Request,res: Response) => { authService.logout(req.cookies.lexigo_refresh); res.clearCookie('lexigo_refresh',{path:'/api/v1/auth'}).status(204).send(); };
