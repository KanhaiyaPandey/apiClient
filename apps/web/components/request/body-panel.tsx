'use client';

import { useTabsStore } from '@/store/tabs.store';
import { KVEditor } from '@/components/shared/kv-editor';
import { JsonEditor } from '@/components/shared/json-editor';
import { cn } from '@apiclient/ui';
import type { BodyType, KeyValuePair } from '@apiclient/utils';

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'form-data', label: 'Form Data' },
  { value: 'x-www-form-urlencoded', label: 'URL Encoded' },
  { value: 'raw', label: 'Raw' },
];

export function BodyPanel() {
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId));
  const setBody = useTabsStore((s) => s.setBody);

  if (!activeTab) return null;
  const { body } = activeTab.request;

  return (
    <div className="flex flex-col">
      {/* Type selector */}
      <div className="flex items-center gap-0 border-b border-border px-3">
        {BODY_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setBody({ ...body, type: t.value })}
            className={cn(
              'px-3 py-2 font-mono text-xs transition-colors',
              body.type === t.value
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body editor */}
      <div className="min-h-[180px]">
        {body.type === 'none' && (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
            No body for this request
          </div>
        )}

        {body.type === 'json' && (
          <JsonEditor
            value={body.content}
            onChange={(content) => setBody({ ...body, content })}
            placeholder={'{\n  "key": "value"\n}'}
          />
        )}

        {(body.type === 'form-data' || body.type === 'x-www-form-urlencoded') && (
          <div className="p-3">
            <KVEditor
              pairs={body.formData ?? []}
              onChange={(formData: KeyValuePair[]) => setBody({ ...body, formData })}
              keyPlaceholder="Field name"
              valuePlaceholder="Field value"
            />
          </div>
        )}

        {body.type === 'raw' && (
          <textarea
            value={body.content}
            onChange={(e) => setBody({ ...body, content: e.target.value })}
            placeholder="Enter raw body..."
            spellCheck={false}
            className="min-h-[180px] w-full resize-none bg-transparent p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}
