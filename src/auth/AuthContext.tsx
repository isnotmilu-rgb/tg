import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type Role = 'admin' | 'chofer';

interface AuthSession {
  role: Role;
  choferId?: string;
  choferNombre?: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isReady: boolean;
  loginAsAdmin: (password: string) => boolean;
  loginAsChofer: (payload: { choferId: string; choferNombre: string }) => void;
  logout: () => void;
}

const STORAGE_KEY = 'tg_logistics_auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      setIsReady(true);
      return;
    }

    try {
      setSession(JSON.parse(raw) as AuthSession);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }

  }, []);

  const loginAsAdmin = (password: string) => {
    if (password !== '2235') {
      return false;
    }

    const newSession: AuthSession = {
      role: 'admin',
      choferNombre: 'Fabian Gallardo',
    };

    setSession(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    return true;
  };

  const loginAsChofer = ({ choferId, choferNombre }: { choferId: string; choferNombre: string }) => {
    const newSession: AuthSession = {
      role: 'chofer',
      choferId,
      choferNombre,
    };

    setSession(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isReady,
      loginAsAdmin,
      loginAsChofer,
      logout,
    }),
    [isReady, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
