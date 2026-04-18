'use client';

import { TabBar } from '@/components/request/tab-bar';
import { UrlBar } from '@/components/request/url-bar';
import { RequestBuilder } from '@/components/request/request-builder';
import { ResponseViewer } from '@/components/response/response-viewer';

export function MainPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TabBar />
      <UrlBar />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <RequestBuilder />
        <ResponseViewer />
      </div>
    </div>
  );
}
