import { store } from '../../infrastructure/store/memory.store.js';
export class UsersService { get(id:string){return store.userResponse(store.getUser(id));} update(id:string,input:any){return store.updateUser(id,input);} stats(id:string){return store.getStats(id);} }
export const usersService=new UsersService();
