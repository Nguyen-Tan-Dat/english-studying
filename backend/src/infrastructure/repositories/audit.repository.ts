import { store } from '../store/memory.store.js';
export class AuditRepository { constructor(public readonly data = store) {} }
