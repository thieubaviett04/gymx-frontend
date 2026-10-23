'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import {
  CheckSquare,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Users,
  X,
} from 'lucide-react';

interface ReceptionistSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePath?: string;
}

const navItems = [
  { label: 'Tổng quan', href: '/receptionist', icon: LayoutDashboard },
  { label: 'Check-in hội viên', href: '/receptionist/check-in', icon: CheckSquare },
  { label: 'Danh sách hội viên', href: '/receptionist/members', icon: Users },
  { label: 'Hàng đợi hôm nay', href: '/receptionist/queue', icon: ClipboardList },
];

export function ReceptionistSidebar({ isOpen, onClose, activePath = '/receptionist' }: ReceptionistSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 px-6 border-b border-[#F3F4F6] flex items-center justify-between">
            <Link href="/receptionist" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-[#101828] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                  GYM<span className="text-[#FF6B00]">MAX</span>
                </span>
                <span className="text-[10px] font-bold text-[#99A1AF] tracking-wider uppercase">
                  Lễ tân
                </span>
              </div>
            </Link>

            {onClose && (
              <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-[#6A7282] hover:bg-[#F3F4F6]">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-4 space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#99A1AF]">
              Lễ tân
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
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-[#6A7282]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-[#F3F4F6]">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default ReceptionistSidebar;
