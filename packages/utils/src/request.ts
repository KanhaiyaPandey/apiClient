import type { ApiRequest, KeyValuePair, Environment, Auth, HttpMethod } from './types';

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Environment Variable Resolution ─────────────────────────────────────────

/**
 * Resolves {{variable_name}} placeholders in a string using the active environment.
 */
export function resolveVariables(text: string, env?: Environment): string {
  if (!env || !text) return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmed = key.trim();
    const variable = env.variables.find((v) => v.enabled && v.key === trimmed);
    return variable ? variable.value : match;
  });
}

/**
 * Resolves all variable references in a full ApiRequest.
 */
export function resolveRequest(request: ApiRequest, env?: Environment): ApiRequest {
  if (!env) return request;

  const resolve = (s: string) => resolveVariables(s, env);

  return {
    ...request,
    url: resolve(request.url),
    headers: request.headers.map((h) => ({
      ...h,
      key: resolve(h.key),
      value: resolve(h.value),
    })),
    params: request.params.map((p) => ({
      ...p,
      key: resolve(p.key),
      value: resolve(p.value),
    })),
    body: {
      ...request.body,
      content: resolve(request.body.content),
      formData: request.body.formData?.map((f) => ({
        ...f,
        key: resolve(f.key),
        value: resolve(f.value),
      })),
    },
  };
}

// ─── URL Builder ──────────────────────────────────────────────────────────────

/**
 * Appends enabled query params to a URL.
 */
export function buildUrl(baseUrl: string, params: KeyValuePair[]): string {
  const enabled = params.filter((p) => p.enabled && p.key.trim());
  if (enabled.length === 0) return baseUrl;

  try {
    const [urlPart, existingQuery] = baseUrl.split('?');
    const searchParams = new URLSearchParams(existingQuery || '');
    enabled.forEach((p) => searchParams.set(p.key, p.value));
    return `${urlPart}?${searchParams.toString()}`;
  } catch {
    return baseUrl;
  }
}

// ─── Header Helpers ───────────────────────────────────────────────────────────

export function headersToRecord(headers: KeyValuePair[]): Record<string, string> {
  return headers
    .filter((h) => h.enabled && h.key.trim())
    .reduce(
      (acc, h) => ({ ...acc, [h.key]: h.value }),
      {} as Record<string, string>
    );
}

export function recordToHeaders(record: Record<string, string>): KeyValuePair[] {
  return Object.entries(record).map(([key, value]) => ({
    id: generateId(),
    key,
    value,
    enabled: true,
  }));
}

// ─── Auth Header Injection ─────────────────────────────────────────────────── 

export function applyAuth(
  headers: Record<string, string>,
  auth: Auth
): Record<string, string> {
  const result = { ...headers };

  switch (auth.type) {
    case 'bearer':
      result['Authorization'] = `Bearer ${auth.token}`;
      break;
    case 'basic': {
      const encoded = btoa(`${auth.username}:${auth.password}`);
      result['Authorization'] = `Basic ${encoded}`;
      break;
    }
    case 'api-key':
      if (auth.in === 'header') {
        result[auth.key] = auth.value;
      }
      break;
    case 'none':
    default:
      break;
  }

  return result;
}

// ─── cURL Code Generator ──────────────────────────────────────────────────────

export function generateCurl(request: ApiRequest, env?: Environment): string {
  const resolved = resolveRequest(request, env);
  const url = buildUrl(resolved.url, resolved.params);
  const headers = headersToRecord(resolved.headers);
  const authHeaders = applyAuth(headers, resolved.auth);

  const parts: string[] = [`curl -X ${resolved.method}`];

  // Headers
  Object.entries(authHeaders).forEach(([key, value]) => {
    parts.push(`  -H '${key}: ${value.replace(/'/g, "'\\''")}'`);
  });

  // Body
  if (resolved.body.type !== 'none' && resolved.body.content) {
    if (resolved.body.type === 'json') {
      parts.push(`  -H 'Content-Type: application/json'`);
      parts.push(`  -d '${resolved.body.content.replace(/'/g, "'\\''")}'`);
    } else if (resolved.body.type === 'form-data' && resolved.body.formData) {
      resolved.body.formData
        .filter((f) => f.enabled)
        .forEach((f) => parts.push(`  -F '${f.key}=${f.value}'`));
    }
  }

  parts.push(`  '${url}'`);
  return parts.join(' \\\n');
}

// ─── Status Code Helpers ──────────────────────────────────────────────────────

export function getStatusCategory(status: number): 'success' | 'redirect' | 'client' | 'server' | 'unknown' {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'redirect';
  if (status >= 400 && status < 500) return 'client';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function getStatusColor(status: number): string {
  const cat = getStatusCategory(status);
  const map = {
    success: 'text-green-500',
    redirect: 'text-yellow-500',
    client: 'text-red-500',
    server: 'text-red-700',
    unknown: 'text-gray-500',
  };
  return map[cat];
}

// ─── Method Color Helpers ─────────────────────────────────────────────────────

export function getMethodColor(method: HttpMethod): string {
  const map: Record<HttpMethod, string> = {
    GET: 'text-green-500',
    POST: 'text-amber-500',
    PUT: 'text-blue-500',
    PATCH: 'text-purple-500',
    DELETE: 'text-red-500',
    HEAD: 'text-gray-400',
    OPTIONS: 'text-gray-400',
  };
  return map[method] ?? 'text-gray-400';
}

export function getMethodBadgeColor(method: HttpMethod): string {
  const map: Record<HttpMethod, string> = {
    GET: 'bg-green-500/10 text-green-500 border-green-500/20',
    POST: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    PUT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    PATCH: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
    HEAD: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    OPTIONS: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return map[method] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

// ─── Body Formatting ──────────────────────────────────────────────────────────

export function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function isValidJson(raw: string): boolean {
  try {
    JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// ─── Default Factories ────────────────────────────────────────────────────────

export function createDefaultRequest(partial?: Partial<ApiRequest>): ApiRequest {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    body: { type: 'none', content: '' },
    auth: { type: 'none' },
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createDefaultTab(request?: Partial<ApiRequest>): import('./types').RequestTab {
  const req = createDefaultRequest(request);
  return {
    id: generateId(),
    name: req.name,
    request: req,
    isLoading: false,
    isSaved: false,
  };
}
