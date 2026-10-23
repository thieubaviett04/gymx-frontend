'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Dumbbell, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthBg = pathname?.includes('/register') || pathname?.includes('/verify-email');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0A0A0A] font-['Inter',sans-serif] flex flex-col justify-between selection:bg-[#FF6B00] selection:text-white relative overflow-hidden">
      {/* Background for Register & Verify OTP pages */}
      {isAuthBg ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url('/images/auth/register-bg.png')` }}
        >
          {/* Subtle dark + blur overlay to enhance card depth and maintain high readability */}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
        </div>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.06),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.05),transparent_70%)] pointer-events-none" />
        </>
      )}

      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-[0_4px_10px_rgba(255,107,0,0.3)] group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className={`text-2xl font-black tracking-tight font-['Plus_Jakarta_Sans',sans-serif] transition-colors ${
            isAuthBg ? 'text-white drop-shadow-sm' : 'text-[#0A0A0A]'
          }`}>
            GYM<span className="text-[#FF6B00]">MAX</span>
          </span>
        </Link>

        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-all px-3.5 py-2 rounded-xl border shadow-sm ${
            isAuthBg 
              ? 'bg-white/90 hover:bg-white text-[#0A0A0A] border-white/40 backdrop-blur-md shadow-md'
              : 'bg-white hover:bg-[#F5F5F5] text-[#525252] hover:text-[#0A0A0A] border-[#E5E5E5]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">{children}</main>

      <footer className={`py-6 text-center text-xs border-t z-10 transition-colors ${
        isAuthBg ? 'text-white/80 border-white/10' : 'text-[#525252] border-[#E5E5E5]'
      }`}>
        © 2025 Gym Max CRM Platform. All rights reserved.
      </footer>
    </div>
  );
}

