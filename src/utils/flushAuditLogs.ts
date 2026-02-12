import axios from "axios";
import {
  getStoredEvents,
  clearStoredEvents,
  storeEvents
} from "./auditQueue";

const API_URL = import.meta.env.VITE_API_BASE_URL;

let isFlushing = false;

export async function flushAuditLogs() {
  if (isFlushing) return;

  const events = getStoredEvents();
  if (events.length === 0) return;

  try {
    isFlushing = true;

    await axios.post(`${API_URL}/logs/batch`, {
      events,
    });

    clearStoredEvents();
  } catch (error) {
    console.error("Audit log flush failed. Will retry.", error);

    storeEvents(events);
  } finally {
    isFlushing = false;
  }
}
