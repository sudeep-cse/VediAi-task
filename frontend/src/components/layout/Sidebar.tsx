'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  FileText,
  BookOpen,
  Clock,
  Settings,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const NAV: NavItem[] = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'My Groups', href: '/groups', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: FileText, badge: 10 },
  { label: "AI Teacher's Toolkit", href: '/toolkit', icon: BookOpen },
  { label: 'My Library', href: '/library', icon: Clock },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/assignments'
      ? pathname.startsWith('/assignments') || pathname.startsWith('/papers') || pathname === '/'
      : pathname === href;

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-line bg-white">
      <div className="flex items-center justify-between px-5 pt-5">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-ink-muted" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-4 pt-6">
        <Button
          variant="create"
          className="w-full"
          onClick={() => router.push('/create')}
        >
          <Sparkles className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-canvas text-ink' : 'text-ink-muted hover:bg-canvas/70 hover:text-ink',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', active && 'text-ink')} />
              <span className="flex-1">{label}</span>
              {badge !== undefined && (
                <span className="rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas/70 hover:text-ink"
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>

        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-line bg-canvas/60 px-3 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
            DP
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">Delhi Public School</p>
            <p className="truncate text-xs text-ink-muted">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
