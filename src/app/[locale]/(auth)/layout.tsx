'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Dumbbell, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthBg =
    pathname?.includes('/register') ||
    pathname?.includes('/verify-email') ||
    pathname?.includes('/login') ||
    pathname?.includes('/forgot-password') ||
    pathname?.includes('/reset-password');

  return (
    <div className={`min-h-screen ${isAuthBg ? 'bg-[#011010]' : 'bg-[#F9FAFB]'} text-foreground font-sans flex flex-col justify-between selection:bg-primary selection:text-primary-foreground relative overflow-hidden`}>
      {/* Background for Auth pages (Login, Register, Forgot Password, Reset Password, Verify OTP) */}
      {isAuthBg ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url('/images/auth/auth-bg.png')` }}
        >
          {/* Subtle dark + blur overlay to enhance card depth and maintain high readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(186,253,0,0.08),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(6,67,67,0.08),transparent_70%)] pointer-events-none" />
        </>
      )}

      <header className="px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_10px_rgba(186,253,0,0.3)] group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className={`text-2xl font-black tracking-tight font-heading transition-colors ${
            isAuthBg ? 'text-white drop-shadow-sm' : 'text-foreground'
          }`}>
            GYM<span className="text-primary">MAX</span>
          </span>
        </Link>

        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-xs font-bold transition-all px-3.5 py-2 rounded-xl border-2 shadow-2xs ${
            isAuthBg 
              ? 'bg-white hover:bg-slate-50 text-[#011010] border-white/50 backdrop-blur-md shadow-md'
              : 'bg-white hover:bg-slate-50 text-[#111827] hover:text-black border-slate-300 hover:border-slate-400'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-4 sm:py-6 z-10">{children}</main>

      <footer className={`py-4 text-center text-xs border-t z-10 transition-colors ${
        isAuthBg ? 'text-white/80 border-white/10' : 'text-[#525252] border-[#E5E5E5]'
      }`}>
        © 2025 Gym Max CRM Platform. All rights reserved.
      </footer>
    </div>
  );
}

