'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store/authStore';
import type { UserRole } from '@/types/auth';
import { Dumbbell } from 'lucide-react';

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const DASHBOARD_MAP: Record<UserRole, string> = {
  ADMIN: '/admin',
  RECEPTIONIST: '/receptionist',
  TRAINER: '/trainer',
  MEMBER: '/member',
};

/**
 * AuthGuard – Bảo vệ tuyến đường Dashboard:
 * 1. Triệt tiêu Hydration Mismatch & FOUC bằng cờ _hasHydrated.
 * 2. Chưa đăng nhập -> redirect /login.
 * 3. Sai quyền (role) -> tự động chuyển hướng về Dashboard đúng quyền.
 * 4. Đúng quyền -> render children.
 */
export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated, primaryRole } = useAuthStore();

  useEffect(() => {
    // Chỉ thực hiện kiểm tra và redirect sau khi Zustand đã hoàn tất Hydration từ storage
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && user) {
      const hasAccess = user.roles?.some((r) => allowedRoles.includes(r));
      if (!hasAccess) {
        // Điều hướng an toàn về đúng dashboard theo role ưu tiên cao nhất
        const userPrimaryRole = primaryRole();
        const targetPath = userPrimaryRole ? DASHBOARD_MAP[userPrimaryRole] ?? '/' : '/';
        router.push(targetPath);
      }
    }
  }, [_hasHydrated, isAuthenticated, user, allowedRoles, primaryRole, router]);

  // Khi chưa Hydrate xong: hiển thị màn hình chờ mượt mà tránh giật lag hoặc chớp nháy (FOUC)
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_10px_25px_rgba(186,253,0,0.3)] animate-pulse">
            <Dumbbell className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Chưa đăng nhập hoặc không có quyền -> không render children trong lúc chờ router.push
  if (!isAuthenticated) return null;
  if (allowedRoles && !user?.roles?.some((r) => allowedRoles.includes(r))) return null;

  return <>{children}</>;
}
