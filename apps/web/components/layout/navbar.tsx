'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Zap } from 'lucide-react';
import { Button } from '@apiclient/ui';
import { EnvSelector } from '@/components/shared/env-selector';

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
          <Zap className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-mono text-sm font-semibold tracking-tight">APIClient</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <EnvSelector />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
