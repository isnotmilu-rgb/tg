import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady] = useState(true);

  const loginAsAdmin = (password: string) => {
    if (password !== '2235') {
      return false;
    }

    const newSession: AuthSession = {
      role: 'admin',
      choferNombre: 'Fabian Gallardo',
    };

    setSession(newSession);
    return true;
  };

  const loginAsChofer = ({ choferId, choferNombre }: { choferId: string; choferNombre: string }) => {
    const newSession: AuthSession = {
      role: 'chofer',
      choferId,
      choferNombre,
    };

    setSession(newSession);
  };

  const logout = () => {
    setSession(null);
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
