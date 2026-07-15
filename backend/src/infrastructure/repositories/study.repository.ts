import { store } from '../store/memory.store.js';
export class StudyRepository { constructor(public readonly data = store) {} }
