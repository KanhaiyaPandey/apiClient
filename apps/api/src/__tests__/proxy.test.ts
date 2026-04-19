import { describe, it, expect } from 'vitest';
import { proxyRequestSchema } from '../validators/proxy';

describe('proxyRequestSchema', () => {
  it('validates a minimal GET request', () => {
    const result = proxyRequestSchema.parse({
      method: 'GET',
      url: 'https://api.example.com/users',
    });
    expect(result.method).toBe('GET');
    expect(result.auth.type).toBe('none');
    expect(result.timeout).toBe(30000);
  });

  it('rejects an invalid URL', () => {
    expect(() =>
      proxyRequestSchema.parse({ method: 'GET', url: 'not-a-url' })
    ).toThrow();
  });

  it('rejects an invalid method', () => {
    expect(() =>
      proxyRequestSchema.parse({ method: 'CONNECT', url: 'https://api.example.com' })
    ).toThrow();
  });

  it('validates bearer auth', () => {
    const result = proxyRequestSchema.parse({
      method: 'GET',
      url: 'https://api.example.com',
      auth: { type: 'bearer', token: 'mytoken' },
    });
    expect(result.auth).toEqual({ type: 'bearer', token: 'mytoken' });
  });

  it('clamps timeout to allowed range', () => {
    expect(() =>
      proxyRequestSchema.parse({
        method: 'GET',
        url: 'https://api.example.com',
        timeout: 99,
      })
    ).toThrow();

    expect(() =>
      proxyRequestSchema.parse({
        method: 'GET',
        url: 'https://api.example.com',
        timeout: 999999,
      })
    ).toThrow();
  });
});
