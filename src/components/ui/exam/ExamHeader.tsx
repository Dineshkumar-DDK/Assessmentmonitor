import { Clock, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface ExamHeaderProps {
  title: string;
  timerFormatted: string;
  isCritical: boolean;
  isFocused: boolean;
  blurCount: number;
  currentQuestion: number;
  totalQuestions: number;
}

export function ExamHeader({
  title,
  timerFormatted,
  isCritical,
  isFocused,
  blurCount,
  currentQuestion,
  totalQuestions,
}: ExamHeaderProps) {


  return (
    <header className="no-select bg-exam-header text-exam-header-foreground px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="font-semibold text-sm tracking-wide uppercase">{title}</h1>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono bg-card/10 rounded-md px-3 py-1.5">
        <span className="text-muted-foreground">Question</span>
        <span className="font-bold text-primary-foreground">
          {currentQuestion}/{totalQuestions}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {blurCount > 0 && (
          <div className="flex items-center gap-1.5 text-warning text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{blurCount} tab switch{blurCount > 1 ? 'es' : ''}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs">
          {isFocused ? (
            <Eye className="h-3.5 w-3.5 text-success" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className={isFocused ? 'text-success' : 'text-destructive'}>
            {isFocused ? 'Focused' : 'Unfocused'}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 font-mono text-sm font-bold px-3 py-1 rounded ${
            isCritical ? 'bg-destructive/20 text-destructive timer-critical' : 'bg-success/20 text-success'
          }`}
        >
          <Clock className="h-4 w-4" />
          {timerFormatted}
        </div>
      </div>
    </header>
  );
}
