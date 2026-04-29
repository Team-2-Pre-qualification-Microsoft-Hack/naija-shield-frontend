import { getToken, getRefreshToken, setSession, clearSession, getUser } from "./auth";
import type { AuthUser } from "./auth";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user = getUser();
    if (user && data.token && data.refreshToken) {
      setSession(data.token, data.refreshToken, user as AuthUser);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

async function parseApiError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body.message || body.error || fallback;
  } catch {
    return fallback;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (!token) {
      // No token was sent — the 401 is a credential rejection from the endpoint itself.
      // Surface the API's message directly instead of "Session expired".
      throw new Error(await parseApiError(res, "Invalid credentials."));
    }

    // Had a token — attempt silent refresh.
    const newToken = await refreshTokens();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    } else {
      clearSession();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Your session has expired. Please sign in again.");
    }
  }

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Request failed. Please try again."));
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const apiGet = <T>(path: string) =>
  request<T>(path, { method: "GET" });

export const apiDelete = <T>(path: string) =>
  request<T>(path, { method: "DELETE" });
