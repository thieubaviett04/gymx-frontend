'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { NotificationBell } from '@/components/shared';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbItemData,
  ConfirmDialog,
} from '@/components/ui';
import { getMediaUrl } from '@/lib/utils/media-url';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks';

export interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  breadcrumbs?: BreadcrumbItemData[];
  showSearch?: boolean;
}

export function AdminHeader({
  onToggleSidebar,
  title = 'Tổng quan hệ thống',
  breadcrumbs = [{ label: 'Tổng quan' }],
}: AdminHeaderProps) {
  const { user } = useAuthStore();
  const { isLogoutOpen, setIsLogoutOpen, isLoggingOut, handleLogout } = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0].toUpperCase())
        .join('')
    : 'AD';

  return (
    <>
      {/* Topbar matching Figma node 3067:123816 & 1329:14605 */}
      <header className="sticky top-0 z-30 bg-transparent px-4 md:px-8 py-3.5 md:py-4 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Hamburger & Title with Breadcrumb per Figma 3067:123816 */}
          <div className="flex items-start gap-2.5 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 -ml-1.5 mt-0.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <h1 className="text-[18px] md:text-[20px] leading-[26px] font-semibold tracking-tight text-white font-heading truncate drop-shadow-xs">
                {title}
              </h1>

              {/* Breadcrumb list aligned directly under title */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList className="text-[13px] sm:text-[14px] text-white/80 gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={crumb.label}>
                        {index > 0 && (
                          <BreadcrumbSeparator className="text-white/40 [&>svg]:size-3.5">
                            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                          </BreadcrumbSeparator>
                        )}
                        <BreadcrumbItem>
                          {crumb.href && !isLast ? (
                            <BreadcrumbLink
                              href={crumb.href}
                              className="text-white/70 hover:text-white transition-colors"
                            >
                              {crumb.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="text-white font-medium">
                              {crumb.label}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            </div>
          </div>

          {/* Right: Notification Bell & Profile Avatar per Figma */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Notification Bell */}
            <div className="flex items-center">
              <NotificationBell className="text-white hover:text-white hover:bg-white/10" />
            </div>

            {/* User Profile Avatar with Dropdown Menu (Figma Node 101:1345) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="w-10 h-10 md:w-11 md:h-11 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 transition-transform hover:scale-105"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label="Menu tài khoản quản trị"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-[#064343] via-[#BAFD00] to-[#71E1E1] shadow-xs">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[#064343] flex items-center justify-center">
                    <span className="font-bold text-xs text-[#BAFD00]">
                      {initials}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user?.avatarUrl ? getMediaUrl(user.avatarUrl) : '/images/avatar-user.png'}
                      alt={user?.fullName || 'Admin Avatar'}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu: Settings & Logout */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Info Header */}
                  <div className="px-3 py-2.5 mb-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#064343] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#BAFD00]/30 shadow-xs shrink-0">
                        {initials}
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
                    <div className="mt-2 pt-2 border-t border-[#E2E8F0]/60 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                        Vai trò
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#064343] text-white">
                        {user?.roles?.[0] || 'ADMIN'}
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="space-y-0.5">
                    <Link
                      href="/admin/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#64748B]" />
                      <span>Cài đặt</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsLogoutOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer border-t border-[#F1F5F9]"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
    </>
  );
}

export default AdminHeader;

