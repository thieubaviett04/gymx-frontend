import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthTokenData, UserRole } from '@/types/auth';
import type { AuthUser } from '@/types/user';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (data: AuthTokenData) => void;
  setAccessToken: (token: string | null) => void;
  setTokens: (accessToken: string, _refreshToken?: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;

  // Helpers
  hasRole: (role: UserRole) => boolean;
  primaryRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

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
          isAuthenticated: true,
        }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      setTokens: (accessToken) =>
        set({ accessToken }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      setHasHydrated: (state) =>
        set({ _hasHydrated: state }),

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
      // Chỉ lưu thông tin không nhạy cảm vào localStorage — triệt tiêu rủi ro lộ refreshToken qua XSS
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
