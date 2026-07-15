import { api } from '../client';
import type { Operation } from '../types';

export const operationsApi = {
  get: (operationId: string) => api.get<Operation>(`/operations/${operationId}`).then((response) => response.data)
};
