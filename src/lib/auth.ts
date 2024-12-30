import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, User } from './db';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const login = async (username: string, password: string, set: any) => {
  set({ isLoading: true, error: null });
  try {
    await db.open();
    
    const user = await db.users
      .where('username')
      .equalsIgnoreCase(username)
      .first();
    
    if (user && user.password === password) {
      set({ user, isLoading: false, error: null });
      return true;
    }
    
    set({ isLoading: false, error: 'Invalid username or password' });
    return false;
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Login error:`, error);
    set({ isLoading: false, error: `An error occurred during login at ${timestamp}` });
    return false;
  }
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      login: (username: string, password: string) => login(username, password, set),
      logout: () => {
        set({ user: null, error: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);