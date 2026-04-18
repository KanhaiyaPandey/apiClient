import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { generateId } from '@apiclient/utils';
import type { Collection, ApiRequest } from '@apiclient/utils';

interface CollectionsState {
  collections: Collection[];

  addCollection: (name: string, description?: string) => Collection;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;

  addRequest: (collectionId: string, request: ApiRequest) => void;
  updateRequest: (collectionId: string, request: ApiRequest) => void;
  removeRequest: (collectionId: string, requestId: string) => void;
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    immer((set) => ({
      collections: [],

      addCollection: (name, description) => {
        const now = new Date().toISOString();
        const col: Collection = {
          id: generateId(),
          name,
          description,
          requests: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => {
          s.collections.push(col);
        });
        return col;
      },

      renameCollection: (id, name) => {
        set((s) => {
          const col = s.collections.find((c) => c.id === id);
          if (col) {
            col.name = name;
            col.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteCollection: (id) => {
        set((s) => {
          s.collections = s.collections.filter((c) => c.id !== id);
        });
      },

      addRequest: (collectionId, request) => {
        set((s) => {
          const col = s.collections.find((c) => c.id === collectionId);
          if (!col) return;
          col.requests.push({ ...request, id: request.id ?? generateId() });
          col.updatedAt = new Date().toISOString();
        });
      },

      updateRequest: (collectionId, request) => {
        set((s) => {
          const col = s.collections.find((c) => c.id === collectionId);
          if (!col) return;
          const idx = col.requests.findIndex((r) => r.id === request.id);
          if (idx !== -1) {
            col.requests[idx] = { ...request, updatedAt: new Date().toISOString() };
          }
          col.updatedAt = new Date().toISOString();
        });
      },

      removeRequest: (collectionId, requestId) => {
        set((s) => {
          const col = s.collections.find((c) => c.id === collectionId);
          if (!col) return;
          col.requests = col.requests.filter((r) => r.id !== requestId);
          col.updatedAt = new Date().toISOString();
        });
      },
    })),
    { name: 'apiclient-collections' }
  )
);
