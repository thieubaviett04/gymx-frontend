'use client';

import React from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { NotificationBell } from '@/components/shared';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export function AdminHeader({ onToggleSidebar, title = 'Tổng quan hệ thống' }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#6A7282] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#6A7282] w-64 focus-within:border-[#FF6B00] focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-[#99A1AF]" />
          <input
            type="text"
            placeholder="Tìm hội viên, gói tập..."
            className="bg-transparent outline-none w-full text-xs text-[#101828] placeholder:text-[#99A1AF]"
          />
        </div>

        {/* Quick Action Button */}
        <button className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold shadow-sm transition-all">
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm hội viên</span>
        </button>

        {/* Notification */}
        <NotificationBell />

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#101828] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#FF6B00]/20 cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
