'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

interface AppShellProps {
  title: string;
  icon?: ReactNode;
  topbarRight?: ReactNode;
  onBack?: () => void;
  children: ReactNode;
}

export function AppShell({ title, icon, topbarRight, onBack, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className={cn('absolute left-0 top-0 h-full animate-fade-up')}>
            <Sidebar onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          icon={icon}
          onBack={onBack}
          onOpenMenu={() => setMenuOpen(true)}
          right={topbarRight}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
