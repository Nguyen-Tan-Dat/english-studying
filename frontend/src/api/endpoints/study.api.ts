import { api } from '../client';
import type { PronunciationAttempt, StudyAnswerResult, StudyCompletion, StudyMode, StudySession } from '../types';

const idempotency = () => ({ 'Idempotency-Key': crypto.randomUUID() });

export const studyApi = {
  create: (body: { mode: StudyMode; source: { type: 'TOPIC_NODE' | 'SAVED_QUERY' | 'WRONG_ANSWERS'; id: string }; limit: number; shuffle: boolean }) =>
    api.post<StudySession>('/study/sessions', body).then((response) => response.data),
  get: (sessionId: string) => api.get<StudySession>(`/study/sessions/${sessionId}`).then((response) => response.data),
  answer: (sessionId: string, body: { item_id: string; answer: Record<string, unknown>; response_ms?: number }) =>
    api.post<StudyAnswerResult>(`/study/sessions/${sessionId}/answers`, body).then((response) => response.data),
  complete: (sessionId: string) =>
    api.post<StudyCompletion>(`/study/sessions/${sessionId}/complete`, undefined, { headers: idempotency() }).then((response) => response.data),
  pronunciation: (conceptId: string, audio: Blob, filename = 'pronunciation.webm') => {
    const body = new FormData();
    body.append('concept_id', conceptId);
    body.append('audio', audio, filename);
    return api.post<PronunciationAttempt>('/study/pronunciation-attempts', body).then((response) => response.data);
  },
  pronunciationAttempt: (attemptId: string) =>
    api.get<PronunciationAttempt>(`/study/pronunciation-attempts/${attemptId}`).then((response) => response.data)
};
