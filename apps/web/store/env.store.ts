import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { generateId } from '@apiclient/utils';
import type { Environment, KeyValuePair } from '@apiclient/utils';

interface EnvState {
  environments: Environment[];
  activeEnvId: string | null;

  addEnvironment: (name: string) => void;
  deleteEnvironment: (id: string) => void;
  renameEnvironment: (id: string, name: string) => void;
  setActiveEnvironment: (id: string | null) => void;
  getActiveEnvironment: () => Environment | undefined;

  addVariable: (envId: string, variable?: Partial<KeyValuePair>) => void;
  updateVariable: (envId: string, varId: string, patch: Partial<KeyValuePair>) => void;
  deleteVariable: (envId: string, varId: string) => void;
}

const defaultEnvs: Environment[] = [
  {
    id: 'env-dev',
    name: 'Development',
    isActive: true,
    variables: [
      { id: generateId(), key: 'base_url', value: 'http://localhost:3000', enabled: true },
      { id: generateId(), key: 'api_key', value: 'dev-key-123', enabled: true },
    ],
  },
  {
    id: 'env-prod',
    name: 'Production',
    isActive: false,
    variables: [
      { id: generateId(), key: 'base_url', value: 'https://api.myapp.com', enabled: true },
      { id: generateId(), key: 'api_key', value: '', enabled: true },
    ],
  },
];

export const useEnvStore = create<EnvState>()(
  persist(
    immer((set, get) => ({
      environments: defaultEnvs,
      activeEnvId: 'env-dev',

      addEnvironment: (name) => {
        const env: Environment = {
          id: generateId(),
          name,
          isActive: false,
          variables: [],
        };
        set((s) => {
          s.environments.push(env);
        });
      },

      deleteEnvironment: (id) => {
        set((s) => {
          s.environments = s.environments.filter((e) => e.id !== id);
          if (s.activeEnvId === id) s.activeEnvId = null;
        });
      },

      renameEnvironment: (id, name) => {
        set((s) => {
          const env = s.environments.find((e) => e.id === id);
          if (env) env.name = name;
        });
      },

      setActiveEnvironment: (id) => {
        set((s) => {
          s.activeEnvId = id;
        });
      },

      getActiveEnvironment: () => {
        const { environments, activeEnvId } = get();
        return environments.find((e) => e.id === activeEnvId);
      },

      addVariable: (envId, variable) => {
        set((s) => {
          const env = s.environments.find((e) => e.id === envId);
          if (!env) return;
          env.variables.push({
            id: generateId(),
            key: '',
            value: '',
            enabled: true,
            ...variable,
          });
        });
      },

      updateVariable: (envId, varId, patch) => {
        set((s) => {
          const env = s.environments.find((e) => e.id === envId);
          if (!env) return;
          const v = env.variables.find((v) => v.id === varId);
          if (v) Object.assign(v, patch);
        });
      },

      deleteVariable: (envId, varId) => {
        set((s) => {
          const env = s.environments.find((e) => e.id === envId);
          if (!env) return;
          env.variables = env.variables.filter((v) => v.id !== varId);
        });
      },
    })),
    { name: 'apiclient-environments' }
  )
);
