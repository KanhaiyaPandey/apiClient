import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
  type RawAxiosRequestHeaders,
} from 'axios';
import type { ProxyRequestInput } from '../validators/proxy';
import type { ApiResponse } from '@apiclient/utils';

// Block requests to private/internal IPs (SSRF prevention)
const BLOCKED_HOSTS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^::1$/,
  /^0\.0\.0\.0$/,
];

function isBlockedHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return BLOCKED_HOSTS.some((pattern) => pattern.test(hostname));
  } catch {
    return true; // invalid URL → block
  }
}

function applyAuthHeaders(
  headers: Record<string, string>,
  auth: ProxyRequestInput['auth']
): Record<string, string> {
  const result = { ...headers };

  switch (auth.type) {
    case 'bearer':
      result['Authorization'] = `Bearer ${auth.token}`;
      break;
    case 'basic': {
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      result['Authorization'] = `Basic ${encoded}`;
      break;
    }
    case 'api-key':
      if (auth.in === 'header') {
        result[auth.key] = auth.value;
      }
      break;
    default:
      break;
  }

  return result;
}

function applyAuthParams(
  params: Record<string, string>,
  auth: ProxyRequestInput['auth']
): Record<string, string> {
  if (auth.type === 'api-key' && auth.in === 'query') {
    return { ...params, [auth.key]: auth.value };
  }
  return params;
}

export async function executeProxyRequest(
  input: ProxyRequestInput,
  requestId: string
): Promise<ApiResponse> {
  if (process.env.ALLOW_INTERNAL_REQUESTS !== 'true' && isBlockedHost(input.url)) {
    throw new Error('Requests to internal/private hosts are not allowed.');
  }

  const headers = applyAuthHeaders(input.headers as Record<string, string>, input.auth);
  const params = applyAuthParams(input.params as Record<string, string>, input.auth);

  // Set Content-Type based on body type
  if (input.bodyType === 'json' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  } else if (input.bodyType === 'x-www-form-urlencoded' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  const config: AxiosRequestConfig = {
    method: input.method,
    url: input.url,
    headers: headers as RawAxiosRequestHeaders,
    params,
    timeout: input.timeout,
    // Don't throw on non-2xx — we want to forward the status code
    validateStatus: () => true,
    // Return raw response string for accurate byte counting
    responseType: 'text',
    maxRedirects: 5,
  };

  // Attach body for methods that support it
  if (input.body && !['GET', 'HEAD'].includes(input.method)) {
    config.data = input.body;
  }

  const startTime = Date.now();
  let response: AxiosResponse<string>;

  try {
    response = await axios(config);
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.code === 'ECONNABORTED') {
        throw new Error(`Request timed out after ${input.timeout}ms`);
      }
      if (err.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused to ${input.url}`);
      }
    }
    throw err;
  }

  const elapsed = Date.now() - startTime;
  const bodyText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  const size = Buffer.byteLength(bodyText, 'utf8');

  // Normalize response headers to a flat Record<string,string>
  const responseHeaders: Record<string, string> = {};
  Object.entries(response.headers).forEach(([key, value]) => {
    if (value !== undefined) {
      responseHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }
  });

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: bodyText,
    size,
    time: elapsed,
    requestId,
  };
}
