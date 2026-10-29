'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  Dumbbell,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  id: string;
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: {
    text: string;
    trend: 'up' | 'down';
    variant: 'success' | 'danger';
  };
  isAlert?: boolean;
}

const DEFAULT_STATS: StatItem[] = [
  {
    id: 'revenue',
    title: 'Doanh thu tháng này',
    value: '845.200.000 ₫',
    icon: CreditCard,
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#059669]',
    badge: {
      text: '+8,2%',
      trend: 'up',
      variant: 'success',
    },
  },
  {
    id: 'staff',
    title: 'Nhân sự đang hoạt động',
    value: '42',
    icon: Users,
    iconBg: 'bg-[#F0FDF4]',
    iconColor: 'text-[#16A34A]',
  },
  {
    id: 'packages',
    title: 'Gói tập đang mở bán',
    value: '12',
    icon: Dumbbell,
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#2563EB]',
  },
  {
    id: 'violations',
    title: 'Vi phạm trong tháng',
    value: '7',
    icon: AlertTriangle,
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#DC2626]',
    badge: {
      text: '+2',
      trend: 'up',
      variant: 'danger',
    },
    isAlert: true,
  },
];

export interface DashboardStatCardsProps {
  stats?: StatItem[];
  className?: string;
}

export function DashboardStatCards({
  stats = DEFAULT_STATS,
  className,
}: DashboardStatCardsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5',
        className
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.id}
            className={cn(
              'relative p-6 rounded-2xl bg-white border transition-all duration-200 hover:shadow-md flex flex-col justify-between min-h-[170px]',
              stat.isAlert
                ? 'border-red-200/80 shadow-[0_0_0_1px_rgba(239,68,68,0.15)] bg-gradient-to-b from-white to-red-50/20'
                : 'border-[#EDEDED] shadow-xs'
            )}
          >
            {/* Top row: Icon and Trend Badge */}
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-105',
                  stat.iconBg
                )}
              >
                <Icon className={cn('w-6 h-6', stat.iconColor)} />
              </div>

              {stat.badge && (
                <div
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-tight',
                    stat.badge.variant === 'success'
                      ? 'bg-[#10B981]/10 text-[#059669]'
                      : 'bg-[#EF4444]/10 text-[#DC2626]'
                  )}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{stat.badge.text}</span>
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="mt-4 space-y-1">
              <p className="text-sm font-normal text-[#64748B] tracking-tight">
                {stat.title}
              </p>
              <p
                className={cn(
                  'text-2xl lg:text-[26px] font-bold tracking-tight font-heading',
                  stat.isAlert ? 'text-[#EF4444]' : 'text-[#0F172A]'
                )}
              >
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardStatCards;
