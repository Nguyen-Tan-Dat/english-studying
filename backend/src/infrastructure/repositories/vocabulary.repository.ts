import { store } from '../store/memory.store.js';
export class VocabularyRepository { constructor(public readonly data = store) {} }
