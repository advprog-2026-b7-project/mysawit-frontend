import axios from "axios";

type ApiErrorPayload = {
  message?: string;
  error?: string;
  errorKey?: string;
  errors?: Array<{
    code?: string;
    detail?: string;
    message?: string;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data;

    if (typeof payload === "string" && payload.trim()) {
      return payload;
    }

    if (isRecord(payload)) {
      const data = payload as ApiErrorPayload;
      const detail = data.errors
        ?.map((item) => item.detail || item.message || item.code)
        .filter(Boolean)
        .join(", ");

      return detail || data.message || data.error || data.errorKey || error.message;
    }

    return error.message || "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
