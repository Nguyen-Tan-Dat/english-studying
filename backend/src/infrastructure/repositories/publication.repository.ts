import { store } from '../store/memory.store.js';
export class PublicationRepository { constructor(public readonly data = store) {} }
