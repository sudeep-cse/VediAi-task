'use client';

import { useRef, useState, DragEvent } from 'react';
import { UploadCloud, FileCheck2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAssignmentForm } from '@/store/assignmentStore';
import { cn } from '@/lib/utils';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fileName, setFile } = useAssignmentForm();

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('File exceeds 10MB limit');
      return;
    }
    // For text-like files we extract content to feed the AI as source material.
    const isText = /(text\/|json|csv)/.test(file.type) || /\.(txt|md|csv)$/i.test(file.name);
    const text = isText ? (await file.text()).slice(0, 8000) : '';
    setFile(file.name, text);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-colors',
          dragging ? 'border-accent-ring bg-accent-soft/40' : 'border-line bg-canvas/40 hover:bg-canvas/70',
        )}
      >
        {fileName ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
            <FileCheck2 className="h-5 w-5 text-easy" />
            <span className="max-w-[220px] truncate text-sm font-medium text-ink">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null, '');
              }}
              className="text-ink-faint hover:text-hard"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card">
              <UploadCloud className="h-5 w-5 text-ink-soft" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Choose a file or drag &amp; drop it here</p>
            <p className="mt-1 text-xs text-ink-faint">JPEG, PNG, upto 10MB</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Browse Files
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md,.csv,image/png,image/jpeg"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <p className="mt-2 text-center text-xs text-ink-faint">
        Upload images of your preferred document/image
      </p>
      {error && <p className="mt-1 text-center text-xs font-medium text-hard">{error}</p>}
    </div>
  );
}
