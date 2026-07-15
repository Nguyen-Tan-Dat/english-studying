import type {Request,Response} from 'express'; import {usersService} from './users.service.js';
export const getMe=(req:Request,res:Response)=>res.json(usersService.get(req.user!.id));
export const updateMe=(req:Request,res:Response)=>res.json(usersService.update(req.user!.id,req.body));
export const stats=(req:Request,res:Response)=>res.json(usersService.stats(req.user!.id));
