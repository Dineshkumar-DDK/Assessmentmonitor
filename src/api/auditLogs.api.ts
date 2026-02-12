import apiClient from "./axios";
import type { ExamEvent } from "@/lib/eventLogger";

export const sendAuditLogBatch = async (events: ExamEvent[]) => {
  const response = await apiClient.post("/api/logs/batch", {
    events,
  });

  return response.data;
};
