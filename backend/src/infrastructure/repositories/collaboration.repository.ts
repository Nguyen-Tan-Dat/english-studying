import { store } from '../store/memory.store.js';
export class CollaborationRepository { constructor(public readonly data = store) {} }
