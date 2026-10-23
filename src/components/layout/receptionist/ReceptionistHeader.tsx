'use client';

import React from 'react';
import { Menu, QrCode } from 'lucide-react';
import { NotificationBell } from '@/components/shared';

interface ReceptionistHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export function ReceptionistHeader({ onToggleSidebar, title = 'Quầy lễ tân' }: ReceptionistHeaderProps) {
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
        {/* Quick Check-in Button */}
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold shadow-sm transition-all">
          <QrCode className="w-3.5 h-3.5" />
          <span>Check-in nhanh</span>
        </button>

        <NotificationBell />

        <div className="w-8 h-8 rounded-full bg-[#101828] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#FF6B00]/20 cursor-pointer">
          LT
        </div>
      </div>
    </header>
  );
}

export default ReceptionistHeader;
