'use client';

import React from 'react';
import { useUiStore } from '@/lib/store/uiStore';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import { BreadcrumbItemData } from '@/components/ui';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItemData[];
  activePath?: string;
}

export function AdminDashboardLayout({
  children,
  title = 'Tổng quan hệ thống',
  breadcrumbs,
  activePath,
}: AdminDashboardLayoutProps) {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#0F172A]">
      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activePath={activePath}
      />
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen">
        <AdminHeader
          title={title}
          breadcrumbs={breadcrumbs}
          onToggleSidebar={() => setMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
