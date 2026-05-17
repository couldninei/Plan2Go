import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authLib from './auth';

interface SessionContextValue {
  user: authLib.User | null;
  isLoading: boolean;
  signIn: (input: { name: string; email: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<authLib.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authLib
      .getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (input: { name: string; email: string }) => {
    const u = await authLib.signIn(input);
    setUser(u);
  };

  const signOut = async () => {
    await authLib.signOut();
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
