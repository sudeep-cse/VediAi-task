import {
  AssignmentInput,
  AssignmentSummary,
  CreateAssignmentResponse,
  PaperStatusPayload,
  StructuredPaper,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`, body?.details);
  }
  return res.json() as Promise<T>;
}

export const api = {
  baseUrl: API_URL,

  createAssignment(input: AssignmentInput): Promise<CreateAssignmentResponse> {
    return request('/assignments', { method: 'POST', body: JSON.stringify(input) });
  },

  listAssignments(): Promise<{ assignments: AssignmentSummary[] }> {
    return request('/assignments');
  },

  deleteAssignment(id: string): Promise<{ ok: boolean }> {
    return request(`/assignments/${id}`, { method: 'DELETE' });
  },

  getPaper(id: string): Promise<{ status: string; paper: StructuredPaper | null; cached?: boolean; error?: string }> {
    return request(`/papers/${id}`);
  },

  getPaperStatus(id: string): Promise<PaperStatusPayload> {
    return request(`/papers/${id}/status`);
  },

  regeneratePaper(id: string): Promise<{ paperId: string; jobId: string }> {
    return request(`/papers/${id}/regenerate`, { method: 'POST' });
  },

  pdfUrl(id: string): string {
    return `${API_URL}/papers/${id}/pdf`;
  },
};
