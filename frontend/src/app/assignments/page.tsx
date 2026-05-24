'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ListFilter, Search, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/assignments/EmptyState';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { AssignmentSummary } from '@/types';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      const res = await api.listAssignments();
      setAssignments(res.assignments);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => assignments.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())),
    [assignments, query],
  );

  const handleView = (a: AssignmentSummary) => {
    if (a.latestPaper) router.push(`/papers/${a.latestPaper}`);
  };

  const handleDelete = async (a: AssignmentSummary) => {
    setAssignments((prev) => prev.filter((x) => x._id !== a._id));
    await api.deleteAssignment(a._id).catch(() => load());
  };

  return (
    <AppShell title="Assignment" icon={<LayoutGrid className="h-4 w-4 text-ink-faint" />}>
      <div className="relative flex min-h-full flex-col">
        <div className="border-b border-line bg-white px-5 py-5 sm:px-8">
          <h1 className="text-xl font-bold text-ink">Assignments</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Manage and create assignments for your classes.</p>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-5 py-5 sm:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink-soft hover:bg-canvas">
                <ListFilter className="h-4 w-4" />
                Filter By
              </button>
              <div className="relative sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Assignment"
                  className="h-10 w-full rounded-full border border-line bg-white pl-9 pr-3 text-sm placeholder:text-ink-faint focus:border-accent-ring focus:outline-none focus:ring-2 focus:ring-accent-ring/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-24 md:grid-cols-2 xl:grid-cols-2">
              {filtered.map((a) => (
                <AssignmentCard key={a._id} assignment={a} onView={handleView} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {/* Floating create button */}
        {assignments.length > 0 && (
          <div className="pointer-events-none sticky bottom-0 flex justify-center pb-6">
            <Button className="pointer-events-auto shadow-soft" onClick={() => router.push('/create')}>
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:px-8 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 rounded-2xl border border-line bg-white p-5">
          <div className="skeleton h-5 w-40 rounded-md" />
          <div className="skeleton mt-4 h-4 w-24 rounded-md" />
          <div className="skeleton mt-6 h-3 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
