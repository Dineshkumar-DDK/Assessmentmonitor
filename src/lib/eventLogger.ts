export type EventType =
  | 'copy_attempt'
  | 'paste_attempt'
  | 'cut_attempt'
  | 'right_click_attempt'
  | 'fullscreen_enter'
  | 'fullscreen_exit'
  | 'tab_blur'
  | 'tab_focus'
  | 'visibility_hidden'
  | 'visibility_visible'
  | 'timer_start'
  | 'timer_warning'
  | 'timer_expired'
  | 'question_navigate'
  | 'answer_change'
  | 'exam_start'
  | 'exam_submit'
  | 'text_select_attempt';

export interface ExamEvent {
  id: string;
  type: EventType;
  timestamp: string;
  attemptId: string;
  questionId?: string;
  metadata: {
    browser: string;
    focusState: boolean;
    fullscreen: boolean;
    detail?: string;
    [key: string]: unknown;
  };
}

export type LogListener=(logs:ExamEvent[])=>void;

const STORAGE_KEY = 'exam_event_logs';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000;
const listeners = new Set<LogListener>();

export const subscribeToLogs = (listener:LogListener)=>{
    listeners.add(listener)
    return () => {
    listeners.delete(listener);
  };
}

export const notifyListeners = ()=>{
    const logs=getAllLogs();
    listeners.forEach((listener)=>listener(logs))
}

let eventBuffer: ExamEvent[] = [];

let flushTimer: ReturnType<typeof setInterval> | null = null;
let isSubmitted = false;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getPersistedLogs(): ExamEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistLogs(logs: ExamEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Failed to persist logs:', e);
  }
}

export function logEvent(
  type: EventType,
  attemptId: string,
  questionId?: string,
  detail?: string
): ExamEvent | null {
  if (isSubmitted) return null;

  const event: ExamEvent = {
    id: generateId(),
    type,
    timestamp: new Date().toISOString(),
    attemptId,
    questionId,
    metadata: {
      browser: getBrowserInfo(),
      focusState: document.hasFocus(),
      fullscreen: !!document.fullscreenElement,
      detail,
    },
  };

  eventBuffer.push(event);

  // Persist immediately for durability
  const existing = getPersistedLogs();
  existing.push(event);
  persistLogs(existing);

  // Flush batch if threshold reached
  if (eventBuffer.length >= BATCH_SIZE) {
    flushBatch();
  }
  notifyListeners()
  return event;
}

function flushBatch(): void {
  if (eventBuffer.length === 0) return;

  // In a real app, this would POST to a backend endpoint
  console.log(`[EventLogger] Flushing ${eventBuffer.length} events`, eventBuffer);
  eventBuffer = [];
}

export function startAutoFlush(): void {
  if (flushTimer) return;
  flushTimer = setInterval(flushBatch, FLUSH_INTERVAL);
}

export function stopAutoFlush(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flushBatch(); // Final flush
}

export function getAllLogs(): ExamEvent[] {
  return getPersistedLogs();
}

export function getLogsByAttempt(attemptId: string): ExamEvent[] {
  return getPersistedLogs().filter((e) => e.attemptId === attemptId);
}

export function markSubmitted(): void {
  isSubmitted = true;
  stopAutoFlush();
}

export function clearLogs(): void {
  if (isSubmitted) return; // Immutable post-submission
  localStorage.removeItem(STORAGE_KEY);
  eventBuffer = [];
}

export function resetLogger(): void {
  isSubmitted = false;
  eventBuffer = [];
  localStorage.removeItem(STORAGE_KEY);
  notifyListeners();
}
