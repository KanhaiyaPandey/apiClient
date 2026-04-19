'use client';

import { Send, X } from 'lucide-react';
import { useTabsStore } from '@/store/tabs.store';
import { useRequest } from '@/hooks/useRequest';
import { Button, cn } from '@apiclient/ui';
import type { HttpMethod } from '@apiclient/utils';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-500',
  POST: 'text-amber-500',
  PUT: 'text-blue-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-red-500',
  HEAD: 'text-gray-400',
  OPTIONS: 'text-gray-400',
};

export function UrlBar() {
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId));
  const { setMethod, setUrl } = useTabsStore();
  const { send, cancel } = useRequest();

  if (!activeTab) return null;

  const { request, isLoading } = activeTab;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) send();
  };

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
      {/* Method selector */}
      <select
        value={request.method}
        onChange={(e) => setMethod(e.target.value as HttpMethod)}
        className={cn(
          'h-8 cursor-pointer appearance-none rounded border border-border bg-muted/50 px-2',
          'font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-ring',
          METHOD_COLORS[request.method]
        )}
      >
        {METHODS.map((m) => (
          <option key={m} value={m} className={METHOD_COLORS[m]}>
            {m}
          </option>
        ))}
      </select>

      {/* URL input */}
      <input
        type="text"
        value={request.url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="https://api.example.com/endpoint"
        spellCheck={false}
        autoComplete="off"
        className={cn(
          'h-8 flex-1 rounded border border-border bg-muted/50 px-3',
          'font-mono text-sm text-foreground placeholder:text-muted-foreground/40',
          'focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring'
        )}
      />

      {/* Send / Cancel */}
      {isLoading ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={cancel}
          className="gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={send}
          disabled={!request.url.trim()}
          className="gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          Send
        </Button>
      )}
    </div>
  );
}
