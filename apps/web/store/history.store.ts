import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { generateId } from '@apiclient/utils';
import type { HistoryEntry, ApiRequest, ApiResponse } from '@apiclient/utils';

const MAX_HISTORY = 100;

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (request: ApiRequest, response: ApiResponse) => void;
  clearHistory: () => void;
  removeEntry: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    immer((set) => ({
      entries: [],

      addEntry: (request, response) => {
        set((s) => {
          s.entries.unshift({
            id: generateId(),
            request,
            response,
            timestamp: new Date().toISOString(),
          });
          if (s.entries.length > MAX_HISTORY) {
            s.entries.length = MAX_HISTORY;
          }
        });
      },

      clearHistory: () => {
        set((s) => {
          s.entries = [];
        });
      },

      removeEntry: (id) => {
        set((s) => {
          s.entries = s.entries.filter((e) => e.id !== id);
        });
      },
    })),
    { name: 'apiclient-history' }
  )
);
