import { StructuredPaper } from '@/types';
import { SectionBlock } from './SectionBlock';

function Line({ label, width = 'w-44' }: { label: string; width?: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-medium text-ink">{label}</span>
      <span className={`inline-block border-b border-dashed border-ink-faint ${width}`} />
    </span>
  );
}

export function QuestionPaper({ paper }: { paper: StructuredPaper }) {
  const hasAnswers = paper.sections.some((s) => s.questions.some((q) => q.answer));

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-white px-6 py-8 shadow-card sm:px-10 sm:py-10">
      {/* Header */}
      <header className="text-center">
        <h1 className="font-serif text-2xl font-bold text-ink">{paper.schoolName}</h1>
        <p className="mt-1 text-base font-medium text-ink-soft">Subject: {paper.subject}</p>
        <p className="text-base font-medium text-ink-soft">Class: {paper.className}</p>
      </header>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm font-semibold text-ink">
        <span>Time Allowed: {paper.timeAllowed}</span>
        <span>Maximum Marks: {paper.maximumMarks}</span>
      </div>

      <p className="mt-3 text-sm font-medium text-ink-soft">{paper.generalInstructions}</p>

      {/* Student info */}
      <div className="mt-4 space-y-1.5 text-sm">
        <div>
          <Line label="Name:" />
        </div>
        <div>
          <Line label="Roll Number:" />
        </div>
        <div>
          <span className="font-medium text-ink">Class: {paper.className} </span>
          <Line label="Section:" width="w-28" />
        </div>
      </div>

      {/* Sections */}
      {paper.sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}

      <p className="mt-8 text-center text-sm font-bold text-ink">End of Question Paper</p>

      {/* Answer key */}
      {hasAnswers && (
        <div className="mt-10 border-t border-line pt-6">
          <h2 className="text-lg font-bold text-ink">Answer Key:</h2>
          <ol className="mt-3 space-y-2.5">
            {paper.sections.flatMap((s) =>
              s.questions
                .filter((q) => q.answer)
                .map((q) => (
                  <li key={q.number} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">{q.number}.</span>
                    <span className="flex-1 whitespace-pre-line">{q.answer}</span>
                  </li>
                )),
            )}
          </ol>
        </div>
      )}
    </article>
  );
}
