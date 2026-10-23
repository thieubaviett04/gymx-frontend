'use client';

import React from 'react';
import { useUiStore } from '@/lib/store/uiStore';
import ReceptionistSidebar from './ReceptionistSidebar';
import ReceptionistHeader from './ReceptionistHeader';

interface ReceptionistDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  activePath?: string;
}

export function ReceptionistDashboardLayout({
  children,
  title = 'Quầy lễ tân',
  activePath = '/receptionist',
}: ReceptionistDashboardLayoutProps) {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-[#101828]">
      <ReceptionistSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activePath={activePath}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <ReceptionistHeader
          title={title}
          onToggleSidebar={() => setMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default ReceptionistDashboardLayout;
