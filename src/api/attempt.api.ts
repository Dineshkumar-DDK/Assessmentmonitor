import apiClient from "./axios";

export const submitAttempt = async (attemptId:string) => {
  const response = await apiClient.post("/api/attempt/submit", {
    attemptId,
  });
  return response;
};
