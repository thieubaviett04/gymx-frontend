'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-white text-[#101828] font-['Inter',sans-serif] selection:bg-[#FF6B00] selection:text-white flex flex-col"
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default LandingLayout;
