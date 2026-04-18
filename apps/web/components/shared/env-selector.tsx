'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useEnvStore } from '@/store/env.store';
import { cn } from '@apiclient/ui';

export function EnvSelector() {
  const { environments, activeEnvId, setActiveEnvironment } = useEnvStore();
  const active = environments.find((e) => e.id === activeEnvId);

  return (
    <div className="relative">
      <select
        value={activeEnvId ?? ''}
        onChange={(e) => setActiveEnvironment(e.target.value || null)}
        className={cn(
          'flex h-7 cursor-pointer appearance-none items-center gap-1 rounded border border-border',
          'bg-background pl-7 pr-6 font-mono text-xs text-foreground',
          'hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring'
        )}
      >
        <option value="">No environment</option>
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
      <Globe className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
