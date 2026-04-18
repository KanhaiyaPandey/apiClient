'use client';

import { useState } from 'react';
import { useTabsStore } from '@/store/tabs.store';
import { KVEditor } from '@/components/shared/kv-editor';
import { BodyPanel } from './body-panel';
import { AuthPanel } from './auth-panel';
import { cn } from '@apiclient/ui';
import type { KeyValuePair } from '@apiclient/utils';

type PanelTab = 'params' | 'headers' | 'body' | 'auth';

const TABS: { id: PanelTab; label: string; getCount?: (tab: any) => number }[] = [
  {
    id: 'params',
    label: 'Params',
    getCount: (tab) => tab?.request.params.filter((p: KeyValuePair) => p.enabled && p.key).length,
  },
  {
    id: 'headers',
    label: 'Headers',
    getCount: (tab) =>
      tab?.request.headers.filter((h: KeyValuePair) => h.enabled && h.key).length,
  },
  {
    id: 'body',
    label: 'Body',
    getCount: (tab) => (tab?.request.body.type !== 'none' ? 1 : 0),
  },
  {
    id: 'auth',
    label: 'Auth',
    getCount: (tab) => (tab?.request.auth.type !== 'none' ? 1 : 0),
  },
];

export function RequestBuilder() {
  const [active, setActive] = useState<PanelTab>('params');
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId));
  const { setHeaders, setParams } = useTabsStore();

  if (!activeTab) return null;

  return (
    <div className="flex flex-col border-b border-border">
      {/* Sub-tab bar */}
      <div className="flex items-center border-b border-border bg-card/50 px-3">
        {TABS.map((tab) => {
          const count = tab.getCount?.(activeTab) ?? 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-2 font-mono text-xs transition-colors',
                active === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary/20 px-1 text-[10px] font-bold text-primary">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="overflow-auto" style={{ maxHeight: 260 }}>
        {active === 'params' && (
          <div className="p-3">
            <KVEditor
              pairs={activeTab.request.params}
              onChange={setParams}
              keyPlaceholder="Parameter"
              valuePlaceholder="Value"
            />
          </div>
        )}
        {active === 'headers' && (
          <div className="p-3">
            <KVEditor
              pairs={activeTab.request.headers}
              onChange={setHeaders}
              keyPlaceholder="Header"
              valuePlaceholder="Value"
            />
          </div>
        )}
        {active === 'body' && <BodyPanel />}
        {active === 'auth' && <AuthPanel />}
      </div>
    </div>
  );
}
