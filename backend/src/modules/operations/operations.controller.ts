import type{Request,Response}from'express';import{operationsService as s}from'./operations.service.js';export const get=(q:Request,r:Response)=>r.json(s.get(q.user!.id,q.params.operationId));
