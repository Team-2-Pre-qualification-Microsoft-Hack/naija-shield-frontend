"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type AuthUser, getUser, isAuthenticated, setSession, clearSession } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

type LoginResponse = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getUser();
    if (stored && isAuthenticated()) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const data = await apiPost<LoginResponse>("/api/auth/login", { email, password });
    setSession(data.token, data.refreshToken, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout");
    } catch {
      // continue logout even if server call fails
    }
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
