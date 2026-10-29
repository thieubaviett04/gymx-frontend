'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { LogOut, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks';
import { ConfirmDialog } from '@/components/ui';
import { AdminNav, ADMIN_NAV_ITEMS } from './AdminNav';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePath?: string;
}

export function AdminSidebar({ isOpen, onClose, activePath }: AdminSidebarProps) {
  const { user } = useAuthStore();
  const { isLogoutOpen, setIsLogoutOpen, isLoggingOut, handleLogout } = useLogout();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header per Figma 1329:14219 */}
          <div className="h-[68px] px-6 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight text-[#0F172A] font-heading select-none">
                GYM<span className="text-[#064343]">MAX</span>
              </span>
            </Link>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                aria-label="Đóng thanh điều hướng"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links using Reusable AdminNav Component */}
          <div className="p-4 pt-5 flex-1">
            <AdminNav
              items={ADMIN_NAV_ITEMS}
              activePath={activePath}
              onItemClick={onClose}
            />
          </div>
        </div>

        {/* User Card & Logout per Figma */}
        <div className="p-4 border-t border-[#F1F5F9] space-y-2.5 bg-white shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/60">
            <div className="w-9 h-9 rounded-full bg-[#064343] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#BAFD00]/30 shadow-xs">
              {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">
                {user?.fullName || 'Quản trị viên'}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">
                {user?.email || 'admin@gymx.vn'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
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
