"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiRequest } from "@/lib/api";
import type { AuthSession } from "@/lib/types";

const STORAGE_KEY = "english_studying_auth_session";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (identifier: string, password: string) => Promise<AuthSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isSessionValid(session: AuthSession): boolean {
  return (
    Boolean(session.accessToken) &&
    Boolean(session.user?.id) &&
    new Date(session.expiresAt).getTime() > Date.now()
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        if (isSessionValid(parsed)) {
          // Hydrate the client-only session after localStorage becomes available.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSession(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (!event.newValue) {
        setSession(null);
        return;
      }

      try {
        const nextSession = JSON.parse(event.newValue) as AuthSession;
        setSession(isSessionValid(nextSession) ? nextSession : null);
      } catch {
        setSession(null);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    const nextSession = await apiRequest<AuthSession>("/api/users/login", {
      method: "POST",
      body: { identifier, password },
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session && isSessionValid(session)),
      isHydrated,
      login,
      logout: clearSession,
    }),
    [clearSession, isHydrated, login, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
