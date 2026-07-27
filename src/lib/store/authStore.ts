import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Định nghĩa cấu hình tài khoản người dùng trong hệ thống GymX
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Trainer' | 'Receptionist' | 'Member';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Kho lưu trữ trạng thái đăng nhập, tự động đồng bộ xuống LocalStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Cập nhật toàn bộ thông tin khi người dùng đăng nhập thành công
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      // Cập nhật lại chuỗi Token mới khi gia hạn thành công
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      // Xóa sạch dữ liệu trong két sắt khi người dùng đăng xuất
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'gymx-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
