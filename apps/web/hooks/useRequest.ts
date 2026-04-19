import { useRef, useCallback } from 'react';
import { useTabsStore } from '@/store/tabs.store';
import { useHistoryStore } from '@/store/history.store';
import { useEnvStore } from '@/store/env.store';
import { executeRequest } from '@/lib/api-client';
import {
  resolveRequest,
  headersToRecord,
} from '@apiclient/utils';
import type { ProxyRequest } from '@apiclient/utils';

export function useRequest() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const { getActiveTab, setLoading, setResponse } = useTabsStore();
  const { addEntry } = useHistoryStore();
  const { getActiveEnvironment } = useEnvStore();

  const send = useCallback(async () => {
    const tab = getActiveTab();
    if (!tab) return;

    const { request } = tab;
    if (!request.url.trim()) return;

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setResponse(undefined);

    const env = getActiveEnvironment();
    const resolved = resolveRequest(request, env);

    const headers = headersToRecord(resolved.headers);
    const params = headersToRecord(resolved.params as any);

    // Build the proxy payload
    const payload: ProxyRequest = {
      method: resolved.method,
      url: resolved.url,
      headers,
      params,
      auth: resolved.auth,
      timeout: 30_000,
    };

    if (resolved.body.type !== 'none' && resolved.body.content) {
      payload.body =
        resolved.body.type === 'json'
          ? resolved.body.content
          : resolved.body.content;
      payload.bodyType = resolved.body.type;
    }

    if (resolved.body.type === 'form-data' && resolved.body.formData) {
      const formRecord: Record<string, string> = {};
      resolved.body.formData
        .filter((f) => f.enabled)
        .forEach((f) => (formRecord[f.key] = f.value));
      payload.body = formRecord;
      payload.bodyType = 'form-data';
    }

    try {
      const result = await executeRequest(payload, abortControllerRef.current.signal);

      if (result.success) {
        setResponse(result.data);
        addEntry(request, result.data);
      } else {
        setResponse({
          status: 0,
          statusText: 'Error',
          headers: {},
          body: result.error ?? 'Unknown error',
          size: 0,
          time: 0,
          requestId: '',
        });
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'CanceledError' || (err as Error).name === 'AbortError') {
        // Request was cancelled — do nothing
        return;
      }
      const message = err instanceof Error ? err.message : 'Request failed';
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: message,
        size: 0,
        time: 0,
        requestId: '',
      });
    } finally {
      setLoading(false);
    }
  }, [getActiveTab, getActiveEnvironment, setLoading, setResponse, addEntry]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, [setLoading]);

  return { send, cancel };
}
