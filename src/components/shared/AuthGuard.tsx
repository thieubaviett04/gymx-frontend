'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store/authStore';
import type { UserRole } from '@/types/auth';

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * AuthGuard – bảo vệ toàn bộ (dashboard) group.
 * - Chưa đăng nhập → redirect /login
 * - Đúng role → render children
 * - Sai role → redirect về dashboard của role hiện tại
 */
export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && user) {
      const hasAccess = user.roles.some((r) => allowedRoles.includes(r));
      if (!hasAccess) {
        // Điều hướng về dashboard đúng của role
        const role = user.roles[0];
        const dashboardMap: Record<UserRole, string> = {
          ADMIN:        '/admin',
          RECEPTIONIST: '/receptionist',
          TRAINER:      '/trainer',
          MEMBER:       '/member',
        };
        router.push(dashboardMap[role] ?? '/');
      }
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated) return null;
  if (allowedRoles && !user?.roles.some((r) => allowedRoles.includes(r))) return null;

  return <>{children}</>;
}
