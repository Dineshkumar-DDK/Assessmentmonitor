import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export interface Question {
  id: string;
  number: number;
  text: string;
  type: 'text' | 'mcq';
  options?: string[];
}

interface QuestionPanelProps {
  question: Question;
  answer: string;
  onAnswerChange: (value: string) => void;
}

export function QuestionPanel({ question, answer, onAnswerChange }: QuestionPanelProps) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Question {question.number}
          </span>
          <h2 className="text-xl font-semibold mt-2 leading-relaxed no-select">
            {question.text}
          </h2>
        </div>

        <div className="mt-6">
          {question.type === 'text' ? (
            <div className="exam-input-allowed">
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-y border-border focus:ring-primary bg-card"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {answer.length} characters
              </p>
            </div>
          ) : (
            <RadioGroup value={answer} onValueChange={onAnswerChange} className="space-y-3">
              {question.options?.map((option, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    answer === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30 bg-card'
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="cursor-pointer flex-1 no-select">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>
    </div>
  );
}
