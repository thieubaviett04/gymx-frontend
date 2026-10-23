'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import {
  Calendar,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  QrCode,
  User,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks';
import { NotificationBell } from '@/components/shared';
import { ConfirmDialog } from '@/components/ui';

interface MemberPortalLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const memberNavItems = [
  { label: 'Tiến độ tập', href: '/member/dashboard', icon: LayoutDashboard },
  { label: 'Lịch tập & Lớp', href: '/member/schedule', icon: Calendar },
  { label: 'Mã Check-in', href: '/member/check-in', icon: QrCode },
  { label: 'Gói thành viên', href: '/member/subscription', icon: CreditCard },
  { label: 'Hồ sơ cá nhân', href: '/member/profile', icon: User },
];

export function MemberPortalLayout({
  children,
  activePath = '/member/dashboard',
}: MemberPortalLayoutProps) {
  const { user } = useAuthStore();
  const { isLogoutOpen, setIsLogoutOpen, isLoggingOut, handleLogout } = useLogout();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#101828] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/member/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
              GYM<span className="text-[#FF6B00]">MAX</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {memberNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FFF7ED] text-[#FF6B00]'
                      : 'text-[#4A5565] hover:text-[#101828] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs font-bold">
              HV
            </div>
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="text-xs text-[#6A7282] hover:text-red-600 p-1 rounded-lg cursor-pointer transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Pop Up xác nhận đăng xuất chuẩn Figma 51:401 */}
      <ConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        state="logout"
        isLoading={isLoggingOut}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto p-6 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-6 text-center text-xs text-[#99A1AF]">
        © 2025 Gym Max Member Portal. Bứt phá giới hạn mỗi ngày.
      </footer>
    </div>
  );
}

export default MemberPortalLayout;
