'use client';

import { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { useTabsStore } from '@/store/tabs.store';
import { useClipboard } from '@apiclient/hooks';
import { JsonEditor } from '@/components/shared/json-editor';
import { StatusBadge } from '@apiclient/ui';
import { Button, cn } from '@apiclient/ui';
import { formatBytes, formatDuration, generateCurl } from '@apiclient/utils';

type ResponseTab = 'body' | 'headers';

export function ResponseViewer() {
  const [active, setActive] = useState<ResponseTab>('body');
  const [showCurl, setShowCurl] = useState(false);
  const { copy, copied } = useClipboard();

  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId));

  if (!activeTab) return null;
  const { response, isLoading, request } = activeTab;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 text-sm text-muted-foreground">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Sending request…
      </div>
    );
  }

  // Empty state
  if (!response) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <Code2 className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">No response yet</p>
        <p className="text-xs text-muted-foreground/60">
          Enter a URL and press Send to see the response
        </p>
      </div>
    );
  }

  const isNetworkError = response.status === 0;
  const headerEntries = Object.entries(response.headers);
  const curlSnippet = generateCurl(request);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Status bar */}
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border px-3">
        {isNetworkError ? (
          <span className="font-mono text-xs font-semibold text-red-500">Network Error</span>
        ) : (
          <>
            <StatusBadge status={response.status} />
            <span className="font-mono text-xs text-muted-foreground">{response.statusText}</span>
            <span className="font-mono text-xs text-muted-foreground">·</span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatDuration(response.time)}
            </span>
            <span className="font-mono text-xs text-muted-foreground">·</span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatBytes(response.size)}
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Copy response body */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => copy(response.body)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Copy response"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          {/* cURL snippet toggle */}
          <Button
            variant={showCurl ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowCurl((v) => !v)}
            className="h-6 gap-1 px-2 text-[10px]"
          >
            <Code2 className="h-3 w-3" />
            cURL
          </Button>
        </div>
      </div>

      {/* cURL snippet */}
      {showCurl && (
        <div className="shrink-0 border-b border-border bg-muted/30">
          <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {curlSnippet}
          </pre>
        </div>
      )}

      {/* Response tabs */}
      <div className="flex items-center border-b border-border bg-card/50 px-3">
        {(['body', 'headers'] as ResponseTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              'border-b-2 px-3 py-2 font-mono text-xs capitalize transition-colors',
              active === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
            {tab === 'headers' && headerEntries.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1 text-[10px]">
                {headerEntries.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-auto">
        {active === 'body' && (
          isNetworkError ? (
            <div className="p-4 font-mono text-sm text-red-400">{response.body}</div>
          ) : (
            <JsonEditor
              value={response.body}
              onChange={() => {}}
              readOnly
              minHeight="200px"
              placeholder="(empty response)"
            />
          )
        )}

        {active === 'headers' && (
          <div className="divide-y divide-border">
            {headerEntries.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">No response headers</p>
            ) : (
              headerEntries.map(([key, value]) => (
                <div key={key} className="flex gap-2 px-3 py-2">
                  <span className="w-1/3 shrink-0 truncate font-mono text-xs text-muted-foreground">
                    {key}
                  </span>
                  <span className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">
                    {value}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
