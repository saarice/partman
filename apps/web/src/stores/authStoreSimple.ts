import { create } from 'zustand';

interface SimpleAuthState {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
}

export const useAuthStore = create<SimpleAuthState>()((set) => ({
  user: {
    id: '1',
    firstName: 'System',
    lastName: 'Owner',
    role: 'system_owner'
  },
  isAuthenticated: true
}));