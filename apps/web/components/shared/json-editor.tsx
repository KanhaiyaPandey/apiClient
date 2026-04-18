'use client';

import { useCallback, useState } from 'react';
import { cn } from '@apiclient/ui';
import { formatJson, isValidJson } from '@apiclient/utils';
import { Button } from '@apiclient/ui';
import { WandSparkles } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
}

export function JsonEditor({
  value,
  onChange,
  placeholder = '{\n  \n}',
  readOnly = false,
  className,
  minHeight = '180px',
}: JsonEditorProps) {
  const [isInvalid, setIsInvalid] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      onChange(v);
      setIsInvalid(v.trim().length > 0 && !isValidJson(v));
    },
    [onChange]
  );

  const handleFormat = () => {
    if (isValidJson(value)) {
      onChange(formatJson(value));
      setIsInvalid(false);
    }
  };

  return (
    <div className={cn('relative flex flex-col', className)}>
      {!readOnly && (
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">JSON</span>
          <div className="flex items-center gap-2">
            {isInvalid && (
              <span className="font-mono text-[10px] text-red-500">Invalid JSON</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFormat}
              disabled={!isValidJson(value)}
              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <WandSparkles className="h-3 w-3" />
              Format
            </Button>
          </div>
        </div>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        style={{ minHeight }}
        className={cn(
          'w-full resize-none bg-transparent p-3 font-mono text-xs leading-relaxed text-foreground',
          'placeholder:text-muted-foreground/40 focus:outline-none',
          isInvalid && 'text-red-400',
          readOnly && 'cursor-default select-all'
        )}
      />
    </div>
  );
}
