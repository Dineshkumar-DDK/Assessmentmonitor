import { useState } from 'react';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';
import type { ExamEvent } from '@/lib/eventLogger';

interface EventLogPanelProps {
  events: ExamEvent[];
}

const eventColors: Record<string, string> = {
  copy_attempt: 'text-destructive',
  paste_attempt: 'text-destructive',
  cut_attempt: 'text-destructive',
  right_click_attempt: 'text-destructive',
  text_select_attempt: 'text-warning',
  tab_blur: 'text-warning',
  tab_focus: 'text-success',
  visibility_hidden: 'text-warning',
  visibility_visible: 'text-success',
  fullscreen_enter: 'text-primary',
  fullscreen_exit: 'text-warning',
  timer_start: 'text-primary',
  timer_warning: 'text-warning',
  timer_expired: 'text-destructive',
  question_navigate: 'text-muted-foreground',
  answer_change: 'text-muted-foreground',
  exam_start: 'text-primary',
  exam_submit: 'text-success',
};

export function EventLogPanel({ events }: EventLogPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const recent = events.slice(-50).reverse();

  return (
    <div className="border-t border-border bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-2 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          <span className="font-semibold uppercase tracking-wider">Event Log</span>
          <span className="bg-muted px-2 py-0.5 rounded-full font-mono">
            {events.length} events
          </span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="max-h-48 overflow-y-auto border-t border-border">
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">No events recorded yet</p>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="text-left px-4 py-1.5 text-muted-foreground font-medium">Time</th>
                  <th className="text-left px-4 py-1.5 text-muted-foreground font-medium">Event</th>
                  <th className="text-left px-4 py-1.5 text-muted-foreground font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((event) => (
                  <tr key={event.id} className="border-t border-border/50 hover:bg-accent/30">
                    <td className="px-4 py-1.5 text-muted-foreground whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className={`px-4 py-1.5 font-medium ${eventColors[event.type] || 'text-foreground'}`}>
                      {event.type}
                    </td>
                    <td className="px-4 py-1.5 text-muted-foreground truncate max-w-[200px]">
                      {event.metadata.detail || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
