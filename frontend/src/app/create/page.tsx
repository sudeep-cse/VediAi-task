'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, CalendarPlus, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, FieldLabel, FieldError } from '@/components/ui/Input';
import { Stepper } from '@/components/create/Stepper';
import { FileUpload } from '@/components/create/FileUpload';
import { QuestionTypeRow } from '@/components/create/QuestionTypeRow';
import { useAssignmentForm } from '@/store/assignmentStore';
import { usePaperStore } from '@/store/paperStore';
import { api, ApiError } from '@/services/api';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const form = useAssignmentForm();
  const resetPaper = usePaperStore((s) => s.reset);
  const setPaperId = usePaperStore((s) => s.setPaperId);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalQuestions = form.totalQuestions();
  const totalMarks = form.totalMarks();

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!form.validate()) return;

    setSubmitting(true);
    try {
      const res = await api.createAssignment({
        title: form.title,
        schoolName: form.schoolName,
        className: form.className,
        subject: form.subject,
        dueDate: form.dueDate,
        questionTypes: form.questionTypes,
        additionalInfo: form.additionalInfo,
        sourceText: form.sourceText,
      });
      resetPaper();
      setPaperId(res.paperId);
      router.push(`/papers/${res.paperId}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create assignment';
      setSubmitError(message);
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Assignment">
      <div className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6 sm:px-6">
        <div className="mb-1">
          <h1 className="text-xl font-bold text-ink">Create Assignment</h1>
          <p className="text-sm text-ink-muted">Set up a new assignment for your students</p>
        </div>

        <div className="my-6">
          <Stepper step={1} total={2} />
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-ink">Assignment Details</h2>
            <p className="text-sm text-ink-muted">Basic information about your assignment</p>
          </div>

          {/* Context fields (shown on the generated paper) */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <FieldLabel>Assignment Title</FieldLabel>
              <Input
                value={form.title}
                error={!!form.errors.title}
                onChange={(e) => form.setField('title', e.target.value)}
                placeholder="e.g. Quiz on Electricity"
              />
              <FieldError>{form.errors.title}</FieldError>
            </div>
            <div>
              <FieldLabel>Subject</FieldLabel>
              <Input
                value={form.subject}
                error={!!form.errors.subject}
                onChange={(e) => form.setField('subject', e.target.value)}
                placeholder="e.g. Science"
              />
              <FieldError>{form.errors.subject}</FieldError>
            </div>
            <div>
              <FieldLabel>Class</FieldLabel>
              <Input
                value={form.className}
                error={!!form.errors.className}
                onChange={(e) => form.setField('className', e.target.value)}
                placeholder="e.g. Class 8"
              />
              <FieldError>{form.errors.className}</FieldError>
            </div>
            <div>
              <FieldLabel>School</FieldLabel>
              <Input
                value={form.schoolName}
                error={!!form.errors.schoolName}
                onChange={(e) => form.setField('schoolName', e.target.value)}
                placeholder="School name"
              />
              <FieldError>{form.errors.schoolName}</FieldError>
            </div>
          </div>

          {/* File upload */}
          <FileUpload />

          {/* Due date */}
          <div className="mt-6">
            <FieldLabel>Due Date</FieldLabel>
            <Input
              value={form.dueDate}
              error={!!form.errors.dueDate}
              onChange={(e) => form.setField('dueDate', e.target.value)}
              placeholder="DD-MM-YYYY"
              trailing={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint">
                  <CalendarPlus className="h-4 w-4" />
                </span>
              }
            />
            <FieldError>{form.errors.dueDate}</FieldError>
          </div>

          {/* Question types */}
          <div className="mt-6">
            <div className="mb-2 hidden items-center sm:flex">
              <FieldLabel className="mb-0 flex-1">Question Type</FieldLabel>
              <span className="w-[160px] pl-2 text-center text-sm font-semibold text-ink-soft">No. of Questions</span>
              <span className="w-[120px] text-center text-sm font-semibold text-ink-soft">Marks</span>
            </div>
            <FieldLabel className="sm:hidden">Question Type</FieldLabel>

            <div className="space-y-3">
              {form.questionTypes.map((row, i) => (
                <QuestionTypeRow key={i} index={i} row={row} />
              ))}
            </div>

            <button
              onClick={form.addQuestionType}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-accent"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                <Plus className="h-3.5 w-3.5" />
              </span>
              Add Question Type
            </button>

            <FieldError>{form.errors.questionTypes}</FieldError>

            <div className="mt-4 space-y-1 text-right text-sm font-semibold text-ink-soft">
              <p>Total Questions : {totalQuestions}</p>
              <p>Total Marks : {totalMarks}</p>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6">
            <FieldLabel>Additional Information (For better output)</FieldLabel>
            <Textarea
              value={form.additionalInfo}
              onChange={(e) => form.setField('additionalInfo', e.target.value)}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
            />
          </div>

          {submitError && (
            <p className="mt-4 rounded-xl bg-hard/5 px-3 py-2 text-sm font-medium text-hard">{submitError}</p>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 border-t border-line bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Button variant="secondary" onClick={() => router.push('/assignments')} disabled={submitting}>
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
