'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Dumbbell, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-[0_4px_10px_rgba(255,107,0,0.3)]">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
            GYM<span className="text-[#FF6B00]">MAX</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-[#4A5565]">
          <a href="#pricing" className="px-3.5 py-2 rounded-lg hover:text-[#FF6B00] hover:bg-[#F9FAFB] transition-colors">
            Gói tập
          </a>
          <a href="#trainers" className="px-3.5 py-2 rounded-lg hover:text-[#FF6B00] hover:bg-[#F9FAFB] transition-colors">
            Huấn luyện viên
          </a>
          <a href="#amenities" className="px-3.5 py-2 rounded-lg hover:text-[#FF6B00] hover:bg-[#F9FAFB] transition-colors">
            Tiện ích
          </a>
          <a href="#testimonials" className="px-3.5 py-2 rounded-lg hover:text-[#FF6B00] hover:bg-[#F9FAFB] transition-colors">
            Đánh giá
          </a>
          <a href="#footer" className="px-3.5 py-2 rounded-lg hover:text-[#FF6B00] hover:bg-[#F9FAFB] transition-colors">
            Liên hệ
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#4A5565] hover:text-[#101828] transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] rounded-xl shadow-[0_4px_12px_rgba(255,107,0,0.25)] transition-all"
          >
            Đăng ký thành viên
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#4A5565] hover:bg-[#F3F4F6]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-2 pb-6 bg-white border-b border-[#E5E7EB] space-y-3">
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#4A5565]"
          >
            Gói tập
          </a>
          <a
            href="#trainers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#4A5565]"
          >
            Huấn luyện viên
          </a>
          <a
            href="#amenities"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#4A5565]"
          >
            Tiện ích
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#4A5565]"
          >
            Đánh giá
          </a>
          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col gap-2">
            <Link href="/login" className="w-full text-center py-2 text-sm font-semibold border rounded-xl">
              Đăng nhập
            </Link>
            <Link href="/register" className="w-full text-center py-2.5 text-sm font-bold bg-[#FF6B00] text-white rounded-xl">
              Đăng ký thành viên
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
