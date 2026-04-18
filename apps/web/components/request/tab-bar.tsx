'use client';

import { Plus, X } from 'lucide-react';
import { useTabsStore } from '@/store/tabs.store';
import { Button, MethodBadge, cn } from '@apiclient/ui';

export function TabBar() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabsStore();

  return (
    <div className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border bg-card">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'group relative flex min-w-0 max-w-[180px] cursor-pointer select-none items-center gap-1.5 border-r border-border px-3',
              'transition-colors',
              isActive
                ? 'bg-background text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <MethodBadge method={tab.request.method} />
            <span className="min-w-0 flex-1 truncate font-mono text-xs">
              {tab.name}
            </span>

            {/* Loading dot */}
            {tab.isLoading && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            )}

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className={cn(
                'ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded transition-opacity',
                'text-muted-foreground hover:text-foreground',
                isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-60'
              )}
              aria-label="Close tab"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      {/* New tab */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => addTab()}
        className="ml-1 shrink-0 self-center text-muted-foreground hover:text-foreground"
        aria-label="New tab"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
