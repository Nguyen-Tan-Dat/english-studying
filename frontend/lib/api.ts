import type { ApiErrorBody } from "@/lib/types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, body, headers, ...requestOptions } = options;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiClientError(
      `Không thể kết nối backend tại ${API_BASE_URL}. Hãy kiểm tra backend đã chạy và CORS đã được bật.`,
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiErrorBody & { data?: T })
    : null;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    throw new ApiClientError(
      payload?.message ?? `Yêu cầu thất bại với mã ${response.status}`,
      response.status,
      payload?.details,
    );
  }

  return (payload?.data ?? payload) as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
}
