import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export interface Word {
  id: string;
  german: string;
  article?: string;
  translation: string;
  type?: string;
  lesson?: number;
  createdAt: string;
}

export interface KasusQuestion {
  sentenceWithBlank: string;
  sentenceFull: string;
  correctArticle: string;
  correctCase: string;
  noun: string;
  explanation: string;
  isNewWord: boolean;
  translation?: string;
}

export const kasusApi = {
  getQuestion: () => api.get<KasusQuestion>('/kasus/question').then(r => r.data),
};

export interface Verb {
  id: string;
  infinitiv: string;
  praesens?: string;
  imperfekt: string;
  partizip2: string;
  hilfsverb: string;
  translation?: string;
  createdAt: string;
}

export const verbApi = {
  getAll: () => api.get<Verb[]>('/verbs').then(r => r.data),
  bulkImport: (lines: string[]) =>
    api.post<{ added: number; skipped: number }>('/verbs/import', { lines }).then(r => r.data),
  delete: (id: string) => api.delete(`/verbs/${id}`),
  deleteAll: () => api.delete('/verbs'),
};

export const wordApi = {
  getAll: () => api.get<Word[]>('/words').then(r => r.data),
  create: (data: Omit<Word, 'id' | 'interval' | 'ef' | 'reps' | 'dueAt' | 'createdAt'>) =>
    api.post<Word>('/words', data).then(r => r.data),
  bulkImport: (lines: string[]) =>
    api.post<{ added: number; skipped: number }>('/words/import', { lines }).then(r => r.data),
  delete: (id: string) => api.delete(`/words/${id}`),
  deleteAll: () => api.delete('/words'),
};
