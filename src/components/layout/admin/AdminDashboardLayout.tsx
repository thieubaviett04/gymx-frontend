'use client';

import React from 'react';
import { usePathname } from '@/i18n/routing';
import { useUiStore } from '@/lib/store/uiStore';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { BreadcrumbItemData } from '@/components/ui';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItemData[];
  activePath?: string;
}

/** Tự động sinh title và breadcrumbs theo route Figma 1329:14548 & 1329:14213 */
function getRouteMetadata(pathname: string): { title: string; breadcrumbs: BreadcrumbItemData[] } {
  // Chuẩn hóa path loại bỏ locale prefix (ví dụ /vi/admin/employees -> /admin/employees)
  const cleanPath = pathname.replace(/^\/(?:vi|en)/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (cleanPath.includes('/admin/employees') || cleanPath.includes('/admin/staff')) {
    const isDeep = segments.length > 2;
    return {
      title: 'Quản lý nhân viên',
      breadcrumbs: isDeep
        ? [
            { label: 'Danh sách nhân viên', href: '/admin/employees' },
            { label: 'Chi tiết nhân viên' },
          ]
        : [{ label: 'Danh sách nhân viên' }],
    };
  }
  if (cleanPath.includes('/admin/packages')) {
    const isDeep = segments.length > 2;
    return {
      title: 'Quản lý gói tập',
      breadcrumbs: isDeep
        ? [
            { label: 'Danh sách gói tập', href: '/admin/packages' },
            { label: 'Chi tiết gói tập' },
          ]
        : [{ label: 'Danh sách gói tập' }],
    };
  }
  if (cleanPath.includes('/admin/violations')) {
    const isDeep = segments.length > 2;
    return {
      title: 'Quản lý vi phạm',
      breadcrumbs: isDeep
        ? [
            { label: 'Quản lý vi phạm', href: '/admin/violations' },
            { label: 'Chi tiết vi phạm' },
          ]
        : [{ label: 'Quản lý vi phạm' }],
    };
  }
  if (cleanPath.includes('/admin/rules')) {
    const isDeep = segments.length > 2;
    return {
      title: 'Quản lý nội quy',
      breadcrumbs: isDeep
        ? [
            { label: 'Quản lý nội quy', href: '/admin/rules' },
            { label: 'Chi tiết nội quy' },
          ]
        : [{ label: 'Quản lý nội quy' }],
    };
  }
  if (cleanPath.includes('/admin/finance')) {
    const isDeep = segments.length > 2;
    return {
      title: 'Lịch sử tài chính',
      breadcrumbs: isDeep
        ? [
            { label: 'Lịch sử tài chính', href: '/admin/finance' },
            { label: 'Chi tiết giao dịch' },
          ]
        : [{ label: 'Lịch sử tài chính' }],
    };
  }
  if (cleanPath.includes('/admin/settings')) {
    const isDeep = segments.length > 2;
    return {
      title: 'Cài đặt hệ thống',
      breadcrumbs: isDeep
        ? [
            { label: 'Cài đặt hệ thống', href: '/admin/settings' },
            { label: 'Chi tiết cài đặt' },
          ]
        : [{ label: 'Cài đặt' }],
    };
  }
  return {
    title: 'Tổng quan hệ thống',
    breadcrumbs: [{ label: 'Tổng quan' }],
  };
}

export function AdminDashboardLayout({
  children,
  title,
  breadcrumbs,
  activePath,
}: AdminDashboardLayoutProps) {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const pathname = usePathname() || '';
  const routeMeta = getRouteMetadata(pathname);

  const effectiveTitle = title ?? routeMeta.title;
  const effectiveBreadcrumbs = breadcrumbs ?? routeMeta.breadcrumbs;

  return (
    <div className="min-h-screen bg-[#011010] relative flex text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Background for Admin pages (exact same as Auth pages: login/register) */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{ backgroundImage: `url('/images/auth/auth-bg.png')` }}
      >
        {/* Subtle dark + blur overlay matching Auth layout per Figma 1329:14548 */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activePath={activePath}
      />
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen relative z-10">
        <AdminHeader
          title={effectiveTitle}
          breadcrumbs={effectiveBreadcrumbs}
          onToggleSidebar={() => setMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-10 w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}


export default AdminDashboardLayout;

