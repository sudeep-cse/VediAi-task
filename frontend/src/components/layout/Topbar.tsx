'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Menu } from 'lucide-react';
import { ReactNode } from 'react';

interface TopbarProps {
  title: string;
  icon?: ReactNode;
  onBack?: () => void;
  onOpenMenu?: () => void;
  right?: ReactNode;
}

export function Topbar({ title, icon, onBack, onOpenMenu, right }: TopbarProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button onClick={onOpenMenu} className="lg:hidden text-ink-soft" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => (onBack ? onBack() : router.back())}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {icon}
        <span className="text-sm font-semibold text-ink-soft">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        {right}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
