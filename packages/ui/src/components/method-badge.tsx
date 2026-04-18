import * as React from 'react';
import { getMethodBadgeColor } from '@apiclient/utils';
import type { HttpMethod } from '@apiclient/utils';
import { cn } from '../lib/cn';

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase',
        getMethodBadgeColor(method),
        className
      )}
    >
      {method}
    </span>
  );
}
