// src/lib/auth.ts
//
// Tier-1 "auth" — local-only, no real security. Stores a pretend-logged-in
// user in AsyncStorage so the app feels personalized. Same shape as the
// web version, but every read/write is async (AsyncStorage is async).

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

const USER_KEY = 'plan2go.currentUser';

/** Returns the signed-in user or null. */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/** "Sign in" — persist the user and return it. */
export async function signIn({
  name,
  email,
}: {
  name: string;
  email: string;
}): Promise<User> {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    joinedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/** Sign out — clear the user identity. Trips and bookmarks stay. */
export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function isSignedIn(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
