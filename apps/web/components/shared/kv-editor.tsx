'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button, cn } from '@apiclient/ui';
import { generateId } from '@apiclient/utils';
import type { KeyValuePair } from '@apiclient/utils';

interface KVEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  className?: string;
}

export function KVEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  className,
}: KVEditorProps) {
  const add = () =>
    onChange([...pairs, { id: generateId(), key: '', value: '', enabled: true }]);

  const remove = (id: string) => onChange(pairs.filter((p) => p.id !== id));

  const update = (id: string, patch: Partial<KeyValuePair>) =>
    onChange(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {pairs.length > 0 && (
        <div className="mb-0.5 grid grid-cols-[20px_1fr_1fr_28px] gap-1 px-1">
          <span />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Key
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Value
          </span>
          <span />
        </div>
      )}

      {pairs.map((pair) => (
        <div key={pair.id} className="grid grid-cols-[20px_1fr_1fr_28px] items-center gap-1">
          {/* Enabled toggle */}
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={(e) => update(pair.id, { enabled: e.target.checked })}
            className="h-3.5 w-3.5 cursor-pointer rounded border-border accent-primary"
            aria-label="Enable row"
          />

          {/* Key */}
          <input
            value={pair.key}
            onChange={(e) => update(pair.id, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className={cn(
              'h-7 w-full rounded border border-transparent bg-muted/50 px-2',
              'font-mono text-xs text-foreground placeholder:text-muted-foreground/50',
              'focus:border-border focus:bg-background focus:outline-none',
              !pair.enabled && 'opacity-40'
            )}
          />

          {/* Value */}
          <input
            value={pair.value}
            onChange={(e) => update(pair.id, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className={cn(
              'h-7 w-full rounded border border-transparent bg-muted/50 px-2',
              'font-mono text-xs text-foreground placeholder:text-muted-foreground/50',
              'focus:border-border focus:bg-background focus:outline-none',
              !pair.enabled && 'opacity-40'
            )}
          />

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(pair.id)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove row"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={add}
        className="mt-1 w-fit gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add row
      </Button>
    </div>
  );
}
