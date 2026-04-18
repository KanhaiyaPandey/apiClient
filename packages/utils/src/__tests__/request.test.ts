import { describe, it, expect } from 'vitest';
import {
  resolveVariables,
  buildUrl,
  generateCurl,
  formatBytes,
  formatDuration,
  isValidJson,
  headersToRecord,
  applyAuth,
} from '../src/request';
import type { Environment, KeyValuePair, Auth } from '../src/types';

const mockEnv: Environment = {
  id: 'env-1',
  name: 'Development',
  isActive: true,
  variables: [
    { id: '1', key: 'base_url', value: 'https://api.example.com', enabled: true },
    { id: '2', key: 'token', value: 'abc123', enabled: true },
    { id: '3', key: 'disabled_var', value: 'should-not-resolve', enabled: false },
  ],
};

describe('resolveVariables', () => {
  it('resolves a single variable', () => {
    expect(resolveVariables('{{base_url}}/users', mockEnv)).toBe('https://api.example.com/users');
  });

  it('resolves multiple variables', () => {
    expect(resolveVariables('{{base_url}}/auth?token={{token}}', mockEnv)).toBe(
      'https://api.example.com/auth?token=abc123'
    );
  });

  it('leaves unresolvable variables unchanged', () => {
    expect(resolveVariables('{{unknown}}', mockEnv)).toBe('{{unknown}}');
  });

  it('does not resolve disabled variables', () => {
    expect(resolveVariables('{{disabled_var}}', mockEnv)).toBe('{{disabled_var}}');
  });

  it('returns unchanged text when no env', () => {
    expect(resolveVariables('{{base_url}}', undefined)).toBe('{{base_url}}');
  });
});

describe('buildUrl', () => {
  const params: KeyValuePair[] = [
    { id: '1', key: 'page', value: '1', enabled: true },
    { id: '2', key: 'limit', value: '10', enabled: true },
    { id: '3', key: 'disabled', value: 'x', enabled: false },
  ];

  it('appends enabled params', () => {
    const result = buildUrl('https://api.example.com/users', params);
    expect(result).toContain('page=1');
    expect(result).toContain('limit=10');
  });

  it('does not append disabled params', () => {
    const result = buildUrl('https://api.example.com/users', params);
    expect(result).not.toContain('disabled=x');
  });

  it('returns base URL when no params', () => {
    expect(buildUrl('https://api.example.com', [])).toBe('https://api.example.com');
  });
});

describe('headersToRecord', () => {
  it('converts enabled headers to a record', () => {
    const headers: KeyValuePair[] = [
      { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
      { id: '2', key: 'X-Disabled', value: 'no', enabled: false },
    ];
    const result = headersToRecord(headers);
    expect(result['Content-Type']).toBe('application/json');
    expect(result['X-Disabled']).toBeUndefined();
  });
});

describe('applyAuth', () => {
  it('applies bearer token', () => {
    const auth: Auth = { type: 'bearer', token: 'mytoken' };
    const result = applyAuth({}, auth);
    expect(result['Authorization']).toBe('Bearer mytoken');
  });

  it('applies basic auth as base64', () => {
    const auth: Auth = { type: 'basic', username: 'user', password: 'pass' };
    const result = applyAuth({}, auth);
    expect(result['Authorization']).toBe('Basic dXNlcjpwYXNz');
  });

  it('applies api-key to header', () => {
    const auth: Auth = { type: 'api-key', key: 'X-API-Key', value: 'key123', in: 'header' };
    const result = applyAuth({}, auth);
    expect(result['X-API-Key']).toBe('key123');
  });

  it('returns unchanged headers for no auth', () => {
    const auth: Auth = { type: 'none' };
    const result = applyAuth({ 'X-Custom': 'val' }, auth);
    expect(result).toEqual({ 'X-Custom': 'val' });
  });
});

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
  });
});

describe('formatDuration', () => {
  it('formats ms under 1 second', () => {
    expect(formatDuration(250)).toBe('250 ms');
  });

  it('formats seconds', () => {
    expect(formatDuration(1500)).toBe('1.50 s');
  });
});

describe('isValidJson', () => {
  it('returns true for valid JSON', () => {
    expect(isValidJson('{"key":"value"}')).toBe(true);
    expect(isValidJson('[1,2,3]')).toBe(true);
  });

  it('returns false for invalid JSON', () => {
    expect(isValidJson('not json')).toBe(false);
    expect(isValidJson('{key: value}')).toBe(false);
  });
});

describe('generateCurl', () => {
  it('generates a basic GET curl command', () => {
    const request = {
      id: '1',
      name: 'Test',
      method: 'GET' as const,
      url: 'https://api.example.com/users',
      headers: [],
      params: [],
      body: { type: 'none' as const, content: '' },
      auth: { type: 'none' as const },
      createdAt: '',
      updatedAt: '',
    };
    const curl = generateCurl(request);
    expect(curl).toContain('curl -X GET');
    expect(curl).toContain('https://api.example.com/users');
  });
});
