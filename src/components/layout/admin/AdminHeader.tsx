'use client';

import React from 'react';
import { Menu, Search } from 'lucide-react';
import { NotificationBell } from '@/components/shared';
import { Breadcrumbs, BreadcrumbItemData } from '@/components/ui';
import { useAuthStore } from '@/lib/store/authStore';

export interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  breadcrumbs?: BreadcrumbItemData[];
  showSearch?: boolean;
}

export function AdminHeader({
  onToggleSidebar,
  title = 'Xin chào Quản trị viên!',
  breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Quản trị viên', href: '/admin' },
    { label: 'Tổng quan' },
  ],
  showSearch = true,
}: AdminHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 md:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Title with Breadcrumb per Figma 101:1334 */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 -ml-1.5 rounded-lg text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="w-5 h-5 text-[#0A0A0A]" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0A0A0A] font-heading truncate">
              {title}
            </h1>
          </div>

          {/* Breadcrumb list aligned under title per Figma 101:1460 */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="pl-0 md:pl-8 text-xs">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
        </div>

        {/* Right: Actions, Search, Notification, Profile Avatar per Figma */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Quick Search */}
          {showSearch && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] w-60 focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="bg-transparent outline-none w-full text-xs text-[#0A0A0A] placeholder:text-[#94A3B8]"
              />
            </div>
          )}

          {/* Notification Bell */}
          <div className="flex items-center">
            <NotificationBell />
          </div>

          {/* User Profile Avatar per Figma 101:1345 */}
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-[#064343] via-[#BAFD00] to-[#71E1E1] shadow-xs">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/avatar-user.png"
                  alt="Admin Avatar"
                  onError={(e) => {
                    // Fallback to initials if image not found
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="font-bold text-xs text-[#064343] hidden">
                  {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
