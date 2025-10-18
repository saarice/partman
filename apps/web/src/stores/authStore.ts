import { create } from 'zustand';
import type { UserRole } from '../../../../packages/shared/src/types/user';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: {
    id: 'dev-user',
    email: 'admin@partman.com',
    firstName: 'System',
    lastName: 'Owner',
    role: 'system_owner' as UserRole
  },
  token: 'dev-token',
  isAuthenticated: true,
  login: (token: string, user: User) =>
    set({
      token,
      user,
      isAuthenticated: true,
    }),
  logout: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    }),
}));