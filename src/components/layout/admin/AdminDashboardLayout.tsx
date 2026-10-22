'use client';

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  activePath?: string;
}

export function AdminDashboardLayout({
  children,
  title = 'Tổng quan hệ thống',
  activePath = '/admin/dashboard',
}: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-[#101828]">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath={activePath}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          title={title}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
