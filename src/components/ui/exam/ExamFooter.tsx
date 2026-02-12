import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface ExamFooterProps {
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

export function ExamFooter({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  isLastQuestion,
}: ExamFooterProps) {
  return (
    <div className="px-6 py-3 border-t border-border bg-card flex items-center justify-between no-select">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-xs text-muted-foreground font-mono">
        {currentIndex + 1} of {totalQuestions}
      </span>

      <div className="flex items-center gap-2">
        {!isLastQuestion ? (
          <Button size="sm" onClick={onNext} className="gap-1">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={onSubmit} className="gap-1 bg-success hover:bg-success/90 text-success-foreground">
            <Send className="h-4 w-4" />
            Submit Exam
          </Button>
        )}
      </div>
    </div>
  );
}
