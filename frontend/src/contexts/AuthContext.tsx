import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/endpoints/auth.api';
import { usersApi } from '../api/endpoints/users.api';
import { tokenStore } from '../api/token-store';
import type { User } from '../api/types';

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  updateProfile: (body: { display_name?: string; avatar_url?: string | null }) => Promise<void>;
  logout: () => Promise<void>;
};

const Context = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.refresh().then(async (session) => {
      tokenStore.set(session.access_token);
      const currentUser = await usersApi.me().catch(() => session.user);
      setUser(currentUser);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authApi.login(email, password);
    tokenStore.set(session.access_token);
    setUser(session.user);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const session = await authApi.register({ email, password, display_name: displayName });
    tokenStore.set(session.access_token);
    setUser(session.user);
  }, []);

  const updateProfile = useCallback(async (body: { display_name?: string; avatar_url?: string | null }) => {
    const updated = await usersApi.update(body);
    setUser(updated);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    tokenStore.set(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, updateProfile, logout }), [user, loading, login, register, updateProfile, logout]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
