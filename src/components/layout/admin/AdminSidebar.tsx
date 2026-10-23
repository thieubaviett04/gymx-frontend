'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import {
  Award,
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  QrCode,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks';
import { ConfirmDialog } from '@/components/ui';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePath?: string;
}

const navItems = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Quản lý hội viên', href: '/admin/members', icon: Users },
  { label: 'Gói tập & Dịch vụ', href: '/admin/packages', icon: Dumbbell },
  { label: 'Huấn luyện viên', href: '/admin/trainers', icon: Award },
  { label: 'Điểm danh (Check-in)', href: '/admin/check-in', icon: QrCode },
  { label: 'Báo cáo & Thống kê', href: '/admin/reports', icon: BarChart3 },
  { label: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ isOpen, onClose, activePath = '/admin/dashboard' }: AdminSidebarProps) {
  const { user } = useAuthStore();
  const { isLogoutOpen, setIsLogoutOpen, isLoggingOut, handleLogout } = useLogout();


  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 px-6 border-b border-[#F3F4F6] flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-[#101828] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                  GYM<span className="text-[#FF6B00]">MAX</span>
                </span>
                <span className="text-[10px] font-bold text-[#99A1AF] tracking-wider uppercase">
                  Admin Portal
                </span>
              </div>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-[#6A7282] hover:bg-[#F3F4F6]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#99A1AF]">
              Quản trị
            </span>
            <nav className="pt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#FFF7ED] text-[#FF6B00] shadow-sm'
                        : 'text-[#4A5565] hover:bg-[#F9FAFB] hover:text-[#101828]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#FF6B00]' : 'text-[#6A7282]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#F3F4F6] space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F9FAFB]">
            <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs">
              {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#101828] truncate">{user?.fullName || 'Admin Quản Trị'}</p>
              <p className="text-[11px] text-[#99A1AF] truncate">{user?.email || 'admin@gymx.vn'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Pop Up xác nhận đăng xuất chuẩn Figma 51:401 */}
      <ConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        state="logout"
        isLoading={isLoggingOut}
      />
    </>
  );
}

export default AdminSidebar;
