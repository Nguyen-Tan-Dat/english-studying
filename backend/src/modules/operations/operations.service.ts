import{store}from'../../infrastructure/store/memory.store.js';export const operationsService={get:(u:string,id:string)=>store.getOperation(u,id)};
