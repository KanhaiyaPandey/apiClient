// ─── HTTP Method ─────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key';

export interface BearerAuth {
  type: 'bearer';
  token: string;
}

export interface BasicAuth {
  type: 'basic';
  username: string;
  password: string;
}

export interface ApiKeyAuth {
  type: 'api-key';
  key: string;
  value: string;
  in: 'header' | 'query';
}

export interface NoAuth {
  type: 'none';
}

export type Auth = BearerAuth | BasicAuth | ApiKeyAuth | NoAuth;

// ─── Key-Value Pair ───────────────────────────────────────────────────────────

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// ─── Request Body ─────────────────────────────────────────────────────────────

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';

export interface RequestBody {
  type: BodyType;
  content: string; // JSON string or raw text
  formData?: KeyValuePair[];
}

// ─── Full API Request ─────────────────────────────────────────────────────────

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: RequestBody;
  auth: Auth;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  size: number;        // bytes
  time: number;        // ms
  requestId: string;
}

// ─── Collection ───────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: ApiRequest[];
  createdAt: string;
  updatedAt: string;
}

// ─── Environment ──────────────────────────────────────────────────────────────

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
  isActive: boolean;
}

// ─── History Entry ────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  request: ApiRequest;
  response: ApiResponse;
  timestamp: string;
}

// ─── Tab ──────────────────────────────────────────────────────────────────────

export interface RequestTab {
  id: string;
  name: string;
  request: ApiRequest;
  response?: ApiResponse;
  isLoading: boolean;
  isSaved: boolean;
}

// ─── Proxy Request/Response ───────────────────────────────────────────────────

export interface ProxyRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string | Record<string, string>;
  bodyType?: BodyType;
  auth?: Auth;
  timeout?: number;
}

export interface ProxyResponse {
  success: boolean;
  data: ApiResponse;
  error?: string;
}
