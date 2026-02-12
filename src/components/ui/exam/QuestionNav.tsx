import { cn } from '@/lib/utils';

interface QuestionNavProps {
  questions: { id: string; number: number }[];
  currentIndex: number;
  answers: Record<string, string>;
  onSelect: (index: number) => void;
}

export function QuestionNav({ questions, currentIndex, answers, onSelect }: QuestionNavProps) {
  return (
    <div className="w-56 bg-exam-sidebar border-l border-border p-4 no-select">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Questions
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {questions.map((q, i) => {
          const isActive = i === currentIndex;
          const isAnswered = !!answers[q.id]?.trim();

          return (
            <button
              key={q.id}
              onClick={() => onSelect(i)}
              className={cn(
                'w-10 h-10 rounded-md text-xs font-bold transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : isAnswered
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {q.number}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success/15 border border-success/30" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
}
