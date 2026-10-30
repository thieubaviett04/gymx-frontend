'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { X } from 'lucide-react';
import { AdminNav, ADMIN_NAV_ITEMS } from './AdminNav';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePath?: string;
}

export function AdminSidebar({ isOpen, onClose, activePath }: AdminSidebarProps) {
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
          {/* Logo Header: GYMMAX centered as requested */}
          <div className="h-[68px] px-6 border-b border-[#F1F5F9] flex items-center justify-center relative shrink-0">
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight text-[#0F172A] font-heading select-none">
                GYM<span className="text-[#064343]">MAX</span>
              </span>
            </Link>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden absolute right-4 p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                aria-label="Đóng thanh điều hướng"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links: only management tabs */}
          <div className="p-4 pt-5 flex-1">
            <AdminNav
              items={ADMIN_NAV_ITEMS}
              activePath={activePath}
              onItemClick={onClose}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;

