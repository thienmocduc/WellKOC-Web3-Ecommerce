import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

export type UserRole = 'user' | 'koc' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  loginWithCredentials: (email: string, password: string, role?: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const STORAGE_KEY = 'wellkoc-auth';

const ADMIN_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'admin@wellkoc.com': {
    password: 'WellKOC@2026',
    user: {
      id: 'admin-001',
      email: 'admin@wellkoc.com',
      name: 'WellKOC Admin',
      role: 'admin',
    },
  },
};

function getStoredAuth(): AuthState {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AuthState;
      if (parsed.user && parsed.token) return parsed;
    }
  } catch {
    // ignore
  }
  return { user: null, token: null };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getStoredAuth);

  useEffect(() => {
    if (authState.user && authState.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  const login = useCallback((user: User, token: string) => {
    setAuthState({ user, token });
  }, []);

  const loginWithCredentials = useCallback(
    (email: string, password: string, role: UserRole = 'user'): { success: boolean; error?: string } => {
      const adminAccount = ADMIN_ACCOUNTS[email];
      if (adminAccount && adminAccount.password === password) {
        setAuthState({
          user: adminAccount.user,
          token: `admin-token-${Date.now()}`,
        });
        return { success: true };
      }

      if (email && password.length >= 6) {
        const user: User = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role,
        };
        setAuthState({
          user,
          token: `user-token-${Date.now()}`,
        });
        return { success: true };
      }

      return { success: false, error: 'Email hoặc mật khẩu không đúng' };
    },
    [],
  );

  const logout = useCallback(() => {
    setAuthState({ user: null, token: null });
  }, []);

  const isAuthenticated = authState.user !== null && authState.token !== null;
  const isAdmin = authState.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user: authState.user, token: authState.token, login, loginWithCredentials, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback for components outside provider — return no-op auth
    return {
      user: null,
      token: null,
      login: () => {},
      loginWithCredentials: () => ({ success: false, error: 'No auth provider' }),
      logout: () => {},
      isAuthenticated: false,
      isAdmin: false,
    };
  }
  return ctx;
}
