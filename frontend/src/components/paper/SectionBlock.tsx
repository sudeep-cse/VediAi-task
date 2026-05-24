import { ParsedSection } from '@/types';
import { QuestionItem } from './QuestionItem';

export function SectionBlock({ section }: { section: ParsedSection }) {
  return (
    <section className="mt-8">
      <h3 className="text-center font-serif text-lg font-bold tracking-wide text-ink">
        Section {section.id}
      </h3>
      <div className="mt-3">
        <p className="font-bold text-ink">{section.title}</p>
        {section.instruction && (
          <p className="mt-0.5 text-[13px] italic text-ink-muted">{section.instruction}</p>
        )}
      </div>
      <ol className="mt-3 space-y-2.5">
        {section.questions.map((q) => (
          <QuestionItem key={q.number} question={q} />
        ))}
      </ol>
    </section>
  );
}
