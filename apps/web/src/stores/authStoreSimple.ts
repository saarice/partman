import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SimpleAuthState {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    email?: string;
  } | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: { id: string; firstName: string; lastName: string; role: string; email?: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<SimpleAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (token: string, refreshToken: string, user) => {
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);