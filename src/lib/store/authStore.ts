import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthTokenData, UserRole } from '@/types/auth';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: AuthTokenData) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (data: AuthTokenData) =>
        set({
          user: {
            id: data.userId,
            email: data.email,
            fullName: data.fullName,
            roles: data.roles,
            avatarUrl: data.avatarUrl,
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      hasRole: (role: UserRole) => {
        const roles = get().user?.roles || [];
        return roles.includes(role);
      },
    }),
    {
      name: 'gymx-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
