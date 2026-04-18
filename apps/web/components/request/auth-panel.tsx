'use client';

import { useTabsStore } from '@/store/tabs.store';
import { cn } from '@apiclient/ui';
import type { Auth, AuthType } from '@apiclient/utils';

const AUTH_OPTIONS: { value: AuthType; label: string }[] = [
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'api-key', label: 'API Key' },
];

const inputCls = cn(
  'h-7 w-full rounded border border-transparent bg-muted/50 px-2',
  'font-mono text-xs text-foreground placeholder:text-muted-foreground/50',
  'focus:border-border focus:bg-background focus:outline-none'
);

export function AuthPanel() {
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId));
  const setAuth = useTabsStore((s) => s.setAuth);

  if (!activeTab) return null;
  const { auth } = activeTab.request;

  const handleTypeChange = (type: AuthType) => {
    const defaults: Record<AuthType, Auth> = {
      none: { type: 'none' },
      bearer: { type: 'bearer', token: '' },
      basic: { type: 'basic', username: '', password: '' },
      'api-key': { type: 'api-key', key: 'X-API-Key', value: '', in: 'header' },
    };
    setAuth(defaults[type]);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Auth type selector */}
      <div className="flex items-center gap-2">
        <span className="w-20 shrink-0 text-xs text-muted-foreground">Auth Type</span>
        <select
          value={auth.type}
          onChange={(e) => handleTypeChange(e.target.value as AuthType)}
          className="h-7 cursor-pointer appearance-none rounded border border-border bg-muted/50 px-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {AUTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bearer */}
      {auth.type === 'bearer' && (
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-xs text-muted-foreground">Token</span>
          <input
            value={auth.token}
            onChange={(e) => setAuth({ ...auth, token: e.target.value })}
            placeholder="Enter bearer token"
            className={inputCls}
          />
        </div>
      )}

      {/* Basic auth */}
      {auth.type === 'basic' && (
        <>
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">Username</span>
            <input
              value={auth.username}
              onChange={(e) => setAuth({ ...auth, username: e.target.value })}
              placeholder="Username"
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">Password</span>
            <input
              type="password"
              value={auth.password}
              onChange={(e) => setAuth({ ...auth, password: e.target.value })}
              placeholder="Password"
              className={inputCls}
            />
          </div>
        </>
      )}

      {/* API Key */}
      {auth.type === 'api-key' && (
        <>
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">Key</span>
            <input
              value={auth.key}
              onChange={(e) => setAuth({ ...auth, key: e.target.value })}
              placeholder="Header or query key"
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">Value</span>
            <input
              value={auth.value}
              onChange={(e) => setAuth({ ...auth, value: e.target.value })}
              placeholder="Key value"
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">Add To</span>
            <select
              value={auth.in}
              onChange={(e) => setAuth({ ...auth, in: e.target.value as 'header' | 'query' })}
              className="h-7 cursor-pointer appearance-none rounded border border-border bg-muted/50 px-2 font-mono text-xs text-foreground focus:outline-none"
            >
              <option value="header">Header</option>
              <option value="query">Query Param</option>
            </select>
          </div>
        </>
      )}

      {auth.type === 'none' && (
        <p className="text-xs text-muted-foreground">
          No authentication configured for this request.
        </p>
      )}
    </div>
  );
}
