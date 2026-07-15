import { store } from '../store/memory.store.js';
export class QueryRepository { constructor(public readonly data = store) {} }
