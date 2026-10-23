'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { useAuthStore } from '@/lib/store/authStore';

export interface UseLogoutOptions {
  redirectTo?: string | null;
  onSuccess?: () => void;
}

/**
 * Custom hook quản lý trạng thái và luồng đăng xuất chuẩn cho toàn hệ thống GymX
 * Xử lý: gọi API backend/BFF xóa cookie HttpOnly -> xóa state Zustand -> chuyển hướng
 */
export function useLogout(options?: UseLogoutOptions) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // Bỏ qua lỗi kết nối mạng
    } finally {
      setIsLoggingOut(false);
      setIsLogoutOpen(false);
      logout();
      options?.onSuccess?.();
      if (options?.redirectTo !== null) {
        router.push(options?.redirectTo || '/login');
      }
    }
  };

  return {
    isLogoutOpen,
    setIsLogoutOpen,
    isLoggingOut,
    handleLogout,
  };
}
