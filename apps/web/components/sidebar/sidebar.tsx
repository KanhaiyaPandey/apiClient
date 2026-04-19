'use client';

import { useState } from 'react';
import { BookOpen, Clock, ChevronRight, ChevronDown, Plus, Trash2, FolderPlus } from 'lucide-react';
import { useCollectionsStore } from '@/store/collections.store';
import { useHistoryStore } from '@/store/history.store';
import { useTabsStore } from '@/store/tabs.store';
import { MethodBadge, Button, cn } from '@apiclient/ui';
import type { Collection, ApiRequest } from '@apiclient/utils';

type SidebarPanel = 'collections' | 'history';

export function Sidebar() {
  const [panel, setPanel] = useState<SidebarPanel>('collections');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [newColName, setNewColName] = useState('');
  const [showNewCol, setShowNewCol] = useState(false);

  const { collections, addCollection, deleteCollection, removeRequest } = useCollectionsStore();
  const { entries, clearHistory } = useHistoryStore();
  const { addTab } = useTabsStore();

  const openRequest = (request: ApiRequest) => addTab(request);

  const handleAddCollection = () => {
    if (!newColName.trim()) return;
    addCollection(newColName.trim());
    setNewColName('');
    setShowNewCol(false);
  };

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Panel switcher */}
      <div className="flex h-9 shrink-0 items-stretch border-b border-border">
        <button
          onClick={() => setPanel('collections')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 text-xs transition-colors',
            panel === 'collections'
              ? 'bg-background text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Collections
        </button>
        <button
          onClick={() => setPanel('history')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 border-l border-border text-xs transition-colors',
            panel === 'history'
              ? 'bg-background text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          History
        </button>
      </div>

      {/* Panel content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* ── Collections ──────────────────────────────────────────────────── */}
        {panel === 'collections' && (
          <div className="flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Collections
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowNewCol(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="New collection"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* New collection input */}
            {showNewCol && (
              <div className="flex items-center gap-1 px-2 pb-2">
                <input
                  autoFocus
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCollection();
                    if (e.key === 'Escape') setShowNewCol(false);
                  }}
                  placeholder="Collection name"
                  className="h-7 flex-1 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button size="icon-sm" onClick={handleAddCollection} variant="secondary">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Collection list */}
            {collections.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No collections yet.
                <br />
                Create one to get started.
              </p>
            ) : (
              collections.map((col) => (
                <CollectionItem
                  key={col.id}
                  collection={col}
                  isOpen={!collapsed[col.id]}
                  onToggle={() => toggleCollapse(col.id)}
                  onOpenRequest={openRequest}
                  onDelete={() => deleteCollection(col.id)}
                  onDeleteRequest={(rid) => removeRequest(col.id, rid)}
                />
              ))
            )}
          </div>
        )}

        {/* ── History ──────────────────────────────────────────────────────── */}
        {panel === 'history' && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent
              </span>
              {entries.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearHistory}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Clear history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {entries.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No history yet.
              </p>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => openRequest(entry.request)}
                  className="group flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent/50"
                >
                  <MethodBadge method={entry.request.method} />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground group-hover:text-foreground">
                    {entry.request.url || '(no url)'}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 font-mono text-[10px]',
                      entry.response.status >= 200 && entry.response.status < 300
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  >
                    {entry.response.status || 'ERR'}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Collection item ────────────────────────────────────────────────────────────

interface CollectionItemProps {
  collection: Collection;
  isOpen: boolean;
  onToggle: () => void;
  onOpenRequest: (r: ApiRequest) => void;
  onDelete: () => void;
  onDeleteRequest: (id: string) => void;
}

function CollectionItem({
  collection,
  isOpen,
  onToggle,
  onOpenRequest,
  onDelete,
  onDeleteRequest,
}: CollectionItemProps) {
  return (
    <div>
      <div className="group flex items-center gap-1 px-2 py-1.5 hover:bg-accent/50">
        <button onClick={onToggle} className="flex flex-1 items-center gap-1 min-w-0">
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-xs font-medium">{collection.name}</span>
          <span className="ml-1 shrink-0 text-[10px] text-muted-foreground">
            ({collection.requests.length})
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="invisible text-muted-foreground group-hover:visible hover:text-destructive"
          aria-label="Delete collection"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {isOpen &&
        collection.requests.map((req) => (
          <div
            key={req.id}
            className="group flex items-center gap-2 pl-7 pr-2 py-1.5 hover:bg-accent/50"
          >
            <button
              onClick={() => onOpenRequest(req)}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <MethodBadge method={req.method} />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground group-hover:text-foreground">
                {req.name}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDeleteRequest(req.id)}
              className="invisible text-muted-foreground group-hover:visible hover:text-destructive"
              aria-label="Delete request"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
    </div>
  );
}
