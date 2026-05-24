'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function EmptyIllustration() {
  return (
    <svg width="160" height="150" viewBox="0 0 160 150" fill="none" aria-hidden>
      <circle cx="92" cy="62" r="56" fill="#EFEFED" />
      <rect x="58" y="22" width="62" height="78" rx="8" fill="#fff" stroke="#E3E3E0" strokeWidth="2" />
      <rect x="70" y="40" width="22" height="4" rx="2" fill="#C9C9C5" />
      <rect x="70" y="52" width="38" height="3" rx="1.5" fill="#E3E3E0" />
      <rect x="70" y="61" width="34" height="3" rx="1.5" fill="#E3E3E0" />
      <rect x="70" y="70" width="38" height="3" rx="1.5" fill="#E3E3E0" />
      {/* magnifier */}
      <circle cx="96" cy="74" r="22" fill="#fff" stroke="#B9B6F2" strokeWidth="3" />
      <line x1="112" y1="90" x2="126" y2="104" stroke="#B9B6F2" strokeWidth="5" strokeLinecap="round" />
      {/* red X */}
      <path d="M88 66l16 16M104 66l-16 16" stroke="#F0432B" strokeWidth="4.5" strokeLinecap="round" />
      {/* accents */}
      <path d="M40 36c-8 4-10 12-4 16" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 96l3 3 3-3-3-3z" fill="#F2541B" />
      <circle cx="134" cy="78" r="3" fill="#3B6CF6" />
    </svg>
  );
}

export function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center animate-fade-up">
      <EmptyIllustration />
      <h2 className="mt-6 text-lg font-bold text-ink">No assignments yet</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        Create your first assignment to start collecting and grading student submissions. You can
        set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <Button className="mt-6" onClick={() => router.push('/create')}>
        <Plus className="h-4 w-4" />
        Create Your First Assignment
      </Button>
    </div>
  );
}
