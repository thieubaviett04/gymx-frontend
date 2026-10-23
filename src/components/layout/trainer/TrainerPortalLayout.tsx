'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import {
  Award,
  Calendar,
  ClipboardList,
  Dumbbell,
  LogOut,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks';
import { NotificationBell } from '@/components/shared';
import { ConfirmDialog } from '@/components/ui';

interface TrainerPortalLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const trainerNavItems = [
  { label: 'Lịch dạy PT', href: '/trainer/schedule', icon: Calendar },
  { label: 'Học viên của tôi', href: '/trainer/clients', icon: Users },
  { label: 'Giáo án & Bài tập', href: '/trainer/workouts', icon: ClipboardList },
  { label: 'Thành tích & Đánh giá', href: '/trainer/reviews', icon: Award },
];

export function TrainerPortalLayout({
  children,
  activePath = '/trainer/schedule',
}: TrainerPortalLayoutProps) {
  const { user } = useAuthStore();
  const { isLogoutOpen, setIsLogoutOpen, isLoggingOut, handleLogout } = useLogout();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#101828] flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/trainer/schedule" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB800] flex items-center justify-center shadow-md">
              <Dumbbell className="w-4 h-4 text-[#101828]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#101828] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                GYM<span className="text-[#FF6B00]">MAX</span>
              </span>
              <span className="text-[10px] font-bold text-[#FFB800] uppercase tracking-wider">
                Trainer Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {trainerNavItems.map((item) => {
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
            <div className="w-8 h-8 rounded-full bg-[#101828] text-white flex items-center justify-center text-xs font-bold">
              PT
            </div>
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="text-xs text-[#6A7282] hover:text-red-600 p-1 rounded-lg cursor-pointer"
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

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-6 md:p-8">
        {children}
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white py-6 text-center text-xs text-[#99A1AF]">
        © 2025 Gym Max Trainer Portal.
      </footer>
    </div>
  );
}

export default TrainerPortalLayout;
