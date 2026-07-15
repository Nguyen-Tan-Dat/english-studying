import { store } from '../store/memory.store.js';
export class OperationRepository { constructor(public readonly data = store) {} }
