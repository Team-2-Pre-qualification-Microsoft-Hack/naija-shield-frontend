export type UserRole = "SOC_ANALYST" | "COMPLIANCE_OFFICER" | "SYSTEM_ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisation: string;
};

const TOKEN_KEY = "ns_token";
const REFRESH_KEY = "ns_refresh";
const USER_KEY = "ns_user";

export function setSession(token: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Cookies for proxy (cannot read localStorage)
  document.cookie = `ns_token=${token}; path=/; max-age=3600; SameSite=Lax`;
  document.cookie = `ns_role=${user.role}; path=/; max-age=3600; SameSite=Lax`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "ns_token=; path=/; max-age=0";
  document.cookie = "ns_role=; path=/; max-age=0";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getRole(): UserRole | null {
  return getUser()?.role ?? null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
