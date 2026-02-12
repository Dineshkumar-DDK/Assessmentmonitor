const STORAGE_KEY = "assessment_audit_queue";

export type AuditEvent = {
  id: string;
  attemptId: string;
  type: string;
  metadata?: any;
  clientTimestamp: number;
  sequenceNumber: number;
};

export function getStoredEvents(): AuditEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function storeEvents(events: AuditEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function enqueueEvent(event: AuditEvent) {
  const events = getStoredEvents();
  events.push(event);
  storeEvents(events);
}

export function clearStoredEvents() {
  localStorage.removeItem(STORAGE_KEY);
}
