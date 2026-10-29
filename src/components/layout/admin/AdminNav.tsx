'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/routing';
import {
  AlertTriangle,
  Dumbbell,
  FileText,
  LayoutDashboard,
  LucideIcon,
  Receipt,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'danger' | 'warning';
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Tổng quan',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Quản lý nhân viên',
    href: '/admin/employees',
    icon: Users,
  },
  {
    label: 'Quản lý gói tập',
    href: '/admin/packages',
    icon: Dumbbell,
  },
  {
    label: 'Quản lý vi phạm',
    href: '/admin/violations',
    icon: AlertTriangle,
  },
  {
    label: 'Quản lý nội quy',
    href: '/admin/rules',
    icon: FileText,
  },
  {
    label: 'Lịch sử tài chính',
    href: '/admin/finance',
    icon: Receipt,
  },
];

export interface AdminNavProps {
  items?: NavItem[];
  activePath?: string;
  onItemClick?: () => void;
  className?: string;
}

export function AdminNav({
  items = ADMIN_NAV_ITEMS,
  activePath,
  onItemClick,
  className,
}: AdminNavProps) {
  const currentPathname = usePathname();
  const effectivePath = activePath ?? currentPathname;

  const isItemActive = (href: string) => {
    // Exact or dashboard match for admin root
    if (href === '/admin' || href === '/admin/dashboard') {
      return (
        effectivePath === '/admin' ||
        effectivePath === '/admin/dashboard' ||
        effectivePath === '/'
      );
    }
    return effectivePath === href || effectivePath.startsWith(`${href}/`);
  };

  return (
    <nav className={cn('flex flex-col gap-2 w-full', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'group relative flex items-center gap-3.5 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200 outline-none select-none',
              active
                ? 'bg-[#064343] text-white shadow-xs font-semibold'
                : 'text-[#0A0A0A] hover:bg-[#F3F4F6] hover:text-black'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105',
                active ? 'text-white' : 'text-[#0A0A0A]'
              )}
            />
            <span className="truncate flex-1 tracking-tight">{item.label}</span>

            {item.badge !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  item.badgeVariant === 'danger'
                    ? 'bg-red-500/20 text-red-600'
                    : item.badgeVariant === 'warning'
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-white/20 text-white'
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default AdminNav;
