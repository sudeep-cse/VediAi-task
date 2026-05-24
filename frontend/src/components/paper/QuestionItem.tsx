import { ParsedQuestion } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';

export function QuestionItem({ question }: { question: ParsedQuestion }) {
  return (
    <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
      <span className="font-semibold text-ink">{question.number}.</span>
      <span className="flex-1">
        <DifficultyBadge difficulty={question.difficulty} />{' '}
        <span>{question.text}</span>{' '}
        <span className="whitespace-nowrap font-semibold text-ink-muted">
          [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
        </span>
      </span>
    </li>
  );
}
