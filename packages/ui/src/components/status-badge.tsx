import * as React from 'react';
import { getStatusCategory } from '@apiclient/utils';
import { cn } from '../lib/cn';

interface StatusBadgeProps {
  status: number;
  className?: string;
}

const statusColors: Record<string, string> = {
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  redirect: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  client: 'bg-red-500/10 text-red-500 border-red-500/20',
  server: 'bg-red-700/10 text-red-700 border-red-700/20',
  unknown: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const category = getStatusCategory(status);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-semibold',
        statusColors[category],
        className
      )}
    >
      {status}
    </span>
  );
}
