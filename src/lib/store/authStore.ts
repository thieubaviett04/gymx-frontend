import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthTokenData, UserRole } from '@/types/auth';
import type { AuthUser } from '@/types/user';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (data: AuthTokenData) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;

  // Helpers
  hasRole: (role: UserRole) => boolean;
  primaryRole: () => UserRole | null;
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
        set({ accessToken, refreshToken }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      hasRole: (role) => get().user?.roles.includes(role) ?? false,

      /** Trả về role ưu tiên cao nhất (ADMIN > RECEPTIONIST > TRAINER > MEMBER) */
      primaryRole: () => {
        const roles = get().user?.roles ?? [];
        const priority: UserRole[] = ['ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER'];
        return priority.find((r) => roles.includes(r)) ?? null;
      },
    }),
    {
      name: 'gymx-auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
