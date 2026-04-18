'use client';

import { Navbar } from './navbar';
import { Sidebar } from '@/components/sidebar/sidebar';
import { MainPanel } from '@/components/request/main-panel';

export function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Navbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <MainPanel />
        </main>
      </div>
    </div>
  );
}
