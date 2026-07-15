import { store } from '../store/memory.store.js';
export class ImportRepository { constructor(public readonly data = store) {} }
