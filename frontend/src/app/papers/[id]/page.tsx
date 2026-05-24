'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Download, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { QuestionPaper } from '@/components/paper/QuestionPaper';
import { GenerationProgress } from '@/components/paper/GenerationProgress';
import { Button } from '@/components/ui/Button';
import { usePaperStore } from '@/store/paperStore';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';
import { api } from '@/services/api';

export default function PaperPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const paperId = params?.id ?? null;

  const { status, progress, message, error, paper, setPaperId, reset, setProgress } = usePaperStore();

  useEffect(() => {
    setPaperId(paperId);
  }, [paperId, setPaperId]);

  useGenerationStatus(paperId);

  const handleRegenerate = async () => {
    if (!paperId) return;
    reset();
    setProgress('queued', 5, 'Re-queued');
    await api.regeneratePaper(paperId).catch(() => undefined);
  };

  const downloadPdf = () => {
    if (paperId) window.open(api.pdfUrl(paperId), '_blank');
  };

  const completed = status === 'completed' && paper;

  return (
    <AppShell
      title="Create New"
      icon={<Sparkles className="h-4 w-4 text-ink-faint" />}
      onBack={() => router.push('/assignments')}
    >
      <div className="px-4 py-6 sm:px-8">
        {/* Dark header banner */}
        {completed && (
          <div className="mx-auto mb-6 max-w-3xl rounded-2xl bg-ink px-5 py-4 text-white shadow-soft sm:px-6">
            <p className="text-sm font-medium leading-relaxed sm:text-[15px]">{paper.intro}</p>
            <div className="mt-3 flex flex-wrap gap-2 no-print">
              <Button size="sm" variant="secondary" onClick={downloadPdf}>
                <Download className="h-4 w-4" />
                Download as PDF
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={handleRegenerate}
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {completed ? (
          <div className="animate-fade-up">
            <QuestionPaper paper={paper} />
          </div>
        ) : (
          <div className="py-10">
            <GenerationProgress
              status={status}
              progress={progress}
              message={message}
              error={error}
              onRetry={handleRegenerate}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
