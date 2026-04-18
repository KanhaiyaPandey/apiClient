import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import {
  createDefaultTab,
  createDefaultRequest,
  generateId,
} from '@apiclient/utils';
import type {
  RequestTab,
  ApiRequest,
  ApiResponse,
  HttpMethod,
  KeyValuePair,
  RequestBody,
  Auth,
} from '@apiclient/utils';

interface TabsState {
  tabs: RequestTab[];
  activeTabId: string;

  // Tab management
  addTab: (request?: Partial<ApiRequest>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  duplicateTab: (tabId: string) => void;
  renameTab: (tabId: string, name: string) => void;

  // Request field mutations (all operate on the active tab unless tabId given)
  setMethod: (method: HttpMethod, tabId?: string) => void;
  setUrl: (url: string, tabId?: string) => void;
  setHeaders: (headers: KeyValuePair[], tabId?: string) => void;
  setParams: (params: KeyValuePair[], tabId?: string) => void;
  setBody: (body: RequestBody, tabId?: string) => void;
  setAuth: (auth: Auth, tabId?: string) => void;

  // Execution state
  setLoading: (loading: boolean, tabId?: string) => void;
  setResponse: (response: ApiResponse | undefined, tabId?: string) => void;

  // Persistence helpers
  markSaved: (tabId: string) => void;
  getActiveTab: () => RequestTab | undefined;
}

function getTargetId(tabs: RequestTab[], activeTabId: string, tabId?: string) {
  return tabId ?? activeTabId;
}

const initialTab = createDefaultTab();

export const useTabsStore = create<TabsState>()(
  persist(
    immer((set, get) => ({
      tabs: [initialTab],
      activeTabId: initialTab.id,

      // ── Tab management ────────────────────────────────────────────────────

      addTab: (request) => {
        const tab = createDefaultTab(request);
        set((s) => {
          s.tabs.push(tab);
          s.activeTabId = tab.id;
        });
      },

      closeTab: (tabId) => {
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.id === tabId);
          if (idx === -1) return;

          s.tabs.splice(idx, 1);

          // Always keep at least one tab
          if (s.tabs.length === 0) {
            const newTab = createDefaultTab();
            s.tabs.push(newTab);
            s.activeTabId = newTab.id;
          } else if (s.activeTabId === tabId) {
            // Activate adjacent tab
            s.activeTabId = s.tabs[Math.min(idx, s.tabs.length - 1)].id;
          }
        });
      },

      setActiveTab: (tabId) => {
        set((s) => {
          s.activeTabId = tabId;
        });
      },

      duplicateTab: (tabId) => {
        set((s) => {
          const source = s.tabs.find((t) => t.id === tabId);
          if (!source) return;
          const copy: RequestTab = {
            ...source,
            id: generateId(),
            name: `${source.name} (copy)`,
            response: undefined,
            isSaved: false,
            request: {
              ...source.request,
              id: generateId(),
            },
          };
          const idx = s.tabs.findIndex((t) => t.id === tabId);
          s.tabs.splice(idx + 1, 0, copy);
          s.activeTabId = copy.id;
        });
      },

      renameTab: (tabId, name) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === tabId);
          if (tab) {
            tab.name = name;
            tab.request.name = name;
          }
        });
      },

      // ── Request mutations ─────────────────────────────────────────────────

      setMethod: (method, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) tab.request.method = method;
        });
      },

      setUrl: (url, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) {
            tab.request.url = url;
            tab.request.updatedAt = new Date().toISOString();
          }
        });
      },

      setHeaders: (headers, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) tab.request.headers = headers;
        });
      },

      setParams: (params, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) tab.request.params = params;
        });
      },

      setBody: (body, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) tab.request.body = body;
        });
      },

      setAuth: (auth, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) tab.request.auth = auth;
        });
      },

      setLoading: (loading, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) tab.isLoading = loading;
        });
      },

      setResponse: (response, tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === getTargetId(s.tabs, s.activeTabId, tabId));
          if (tab) tab.response = response;
        });
      },

      markSaved: (tabId) => {
        set((s) => {
          const tab = s.tabs.find((t) => t.id === tabId);
          if (tab) tab.isSaved = true;
        });
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId);
      },
    })),
    {
      name: 'apiclient-tabs',
      partialize: (s) => ({
        tabs: s.tabs.map((t) => ({ ...t, isLoading: false })),
        activeTabId: s.activeTabId,
      }),
    }
  )
);
