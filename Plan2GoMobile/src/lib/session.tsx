// src/lib/session.tsx
//
// React context that mirrors `auth.ts` into React state. Without this, the
// root layout would only check the user once at mount and never react to
// sign-in / sign-out — so we hold the user in state here and re-render the
// layout (and its Stack.Protected guards) when it changes.

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

  // Restore session on app launch
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
