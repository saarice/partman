import { create } from 'zustand';

interface SimpleAuthState {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

export const useAuthStore = create<SimpleAuthState>()((set) => ({
  user: {
    id: 'system-owner-1',
    firstName: 'System',
    lastName: 'Owner',
    role: 'system_owner'
  },
  token: 'mock-jwt-token-system-owner',
  isAuthenticated: true,
  logout: () => set({ user: null, token: null, isAuthenticated: false })
}));