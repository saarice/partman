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
}

export const useAuthStore = create<SimpleAuthState>()(() => ({
  user: {
    id: 'system-owner-1',
    firstName: 'System',
    lastName: 'Owner',
    role: 'system_owner'
  },
  token: 'mock-jwt-token-system-owner',
  isAuthenticated: true
}));