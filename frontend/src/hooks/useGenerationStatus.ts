'use client';

import { useEffect } from 'react';
import { getSocket, subscribeToPaper, unsubscribeFromPaper } from '@/services/socket';
import { usePaperStore } from '@/store/paperStore';
import { api } from '@/services/api';
import { JobStatus, StructuredPaper } from '@/types';

/**
 * Connects a paperId to live generation updates.
 * Primary channel: Socket.io. Fallback: short polling (covers a missed socket
 * event or a page opened after completion).
 */
export function useGenerationStatus(paperId: string | null) {
  const { setProgress, setCompleted, setFailed } = usePaperStore();

  useEffect(() => {
    if (!paperId) return;
    const socket = getSocket();

    const onProgress = (data: { paperId: string; status: JobStatus; progress: number; message?: string }) => {
      if (data.paperId !== paperId) return;
      setProgress(data.status, data.progress, data.message);
    };
    const onCompleted = (data: { paperId: string; paper: StructuredPaper }) => {
      if (data.paperId !== paperId) return;
      setCompleted(data.paper);
    };
    const onFailed = (data: { paperId: string; error: string }) => {
      if (data.paperId !== paperId) return;
      setFailed(data.error);
    };

    socket.on('paper:progress', onProgress);
    socket.on('paper:completed', onCompleted);
    socket.on('paper:failed', onFailed);
    subscribeToPaper(paperId);

    // Initial fetch + polling fallback.
    let active = true;
    const poll = async () => {
      try {
        const res = await api.getPaper(paperId);
        if (!active) return;
        if (res.status === 'completed' && res.paper) {
          setCompleted(res.paper);
          return true;
        }
        if (res.status === 'failed') {
          setFailed(res.error ?? 'Generation failed');
          return true;
        }
        const st = await api.getPaperStatus(paperId);
        if (active) setProgress(st.status, st.progress, st.message);
      } catch {
        /* ignore transient errors */
      }
      return false;
    };

    poll();
    const interval = setInterval(async () => {
      const done = await poll();
      if (done) clearInterval(interval);
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
      socket.off('paper:progress', onProgress);
      socket.off('paper:completed', onCompleted);
      socket.off('paper:failed', onFailed);
      unsubscribeFromPaper(paperId);
    };
  }, [paperId, setProgress, setCompleted, setFailed]);
}
