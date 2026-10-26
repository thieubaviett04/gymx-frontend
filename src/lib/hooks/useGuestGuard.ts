'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store/authStore';
import type { UserRole } from '@/types/auth';

const DASHBOARD_MAP: Record<UserRole, string> = {
  ADMIN: '/admin',
  RECEPTIONIST: '/receptionist',
  TRAINER: '/trainer',
  MEMBER: '/member',
};

/**
 * Hook chặn truy cập ngược (Reverse Route Guard):
 * Chặn người dùng đã đăng nhập truy cập vào các trang dành riêng cho khách:
 * /forgot-password, /reset-password (hoặc các form auth chưa đăng nhập).
 * Tự động chuyển hướng về Dashboard tương ứng với vai trò của tài khoản.
 */
export function useGuestGuard(enabled: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, primaryRole } = useAuthStore();

  useEffect(() => {
    if (enabled && _hasHydrated && isAuthenticated) {
      const role = primaryRole();
      const redirectPath = role ? DASHBOARD_MAP[role] ?? '/' : '/';
      router.replace(redirectPath);
    }
  }, [enabled, _hasHydrated, isAuthenticated, primaryRole, router]);

  return {
    isGuest: _hasHydrated && !isAuthenticated,
    isCheckingAuth: !_hasHydrated || isAuthenticated,
  };
}
