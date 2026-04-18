import axios from 'axios';
import type { ProxyRequest, ProxyResponse } from '@apiclient/utils';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  timeout: 35_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach correlation id ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  config.headers['X-Client'] = 'apiclient-web/1.0';
  return config;
});

// ── Response interceptor — unwrap errors ────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ?? err.message ?? 'Network error';
    return Promise.reject(new Error(message));
  }
);

export async function executeRequest(
  payload: ProxyRequest,
  signal?: AbortSignal
): Promise<ProxyResponse> {
  const { data } = await apiClient.post<ProxyResponse>('/api/proxy', payload, { signal });
  return data;
}

export async function fetchCollections() {
  const { data } = await apiClient.get('/api/collections');
  return data.data;
}

export async function createCollection(name: string, description?: string) {
  const { data } = await apiClient.post('/api/collections', { name, description });
  return data.data;
}

export async function deleteCollection(id: string) {
  await apiClient.delete(`/api/collections/${id}`);
}

export async function saveRequestToCollection(collectionId: string, request: unknown) {
  const { data } = await apiClient.post(`/api/collections/${collectionId}/requests`, request);
  return data.data;
}

export async function fetchHistory(limit = 50) {
  const { data } = await apiClient.get(`/api/history?limit=${limit}`);
  return data.data;
}
