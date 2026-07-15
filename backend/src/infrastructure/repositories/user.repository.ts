import { store } from '../store/memory.store.js';
export class UserRepository { constructor(public readonly data = store) {} }
