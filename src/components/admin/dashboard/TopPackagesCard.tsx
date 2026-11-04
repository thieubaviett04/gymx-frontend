'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TopPackageItem {
  rank: number;
  name: string;
  count: number;
  revenue: string;
  percentage: number;
  isSpecial?: boolean;
}

const DEFAULT_PACKAGES: TopPackageItem[] = [
  {
    rank: 1,
    name: 'Gym Pro',
    count: 412,
    revenue: '268tr',
    percentage: 75,
  },
  {
    rank: 2,
    name: 'VIP 1 Năm',
    count: 58,
    revenue: '400tr',
    percentage: 95,
  },
  {
    rank: 3,
    name: 'PT 1 kèm 1',
    count: 36,
    revenue: '162tr',
    percentage: 55,
  },
  {
    rank: 4,
    name: 'Gym Pro 3 tháng',
    count: 81,
    revenue: '142tr',
    percentage: 45,
  },
  {
    rank: 5,
    name: 'Day Pass',
    count: 640,
    revenue: '51tr',
    percentage: 28,
    isSpecial: true,
  },
];

export function TopPackagesCard({
  packages = DEFAULT_PACKAGES,
}: {
  packages?: TopPackageItem[];
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-[#EDEDED] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-[#F8FAFC]">
        <h3 className="text-base font-semibold text-[#011010] font-heading">
          Top gói tập bán chạy
        </h3>
        <span className="text-xs text-[#64748B] font-medium">Theo doanh thu</span>
      </div>

      <div className="pt-4 space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.name} className="space-y-1.5">
            {/* Top row: Rank, Name, and Metric */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-[#999999]">
                  {pkg.rank}
                </span>
                <span className="font-semibold text-[#011010] tracking-tight">
                  {pkg.name}
                </span>
              </div>
              <span className="text-xs text-[#666666]">
                {pkg.count} lượt ·{' '}
                <strong className="text-[#011010]">{pkg.revenue}</strong>
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-[#EDEDED] overflow-hidden">
              <div
                style={{ width: `${pkg.percentage}%` }}
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  pkg.isSpecial
                    ? 'bg-[#BAFD00]'
                    : pkg.rank === 1
                    ? 'bg-[#064343]'
                    : pkg.rank === 2
                    ? 'bg-[#064343]/90'
                    : pkg.rank === 3
                    ? 'bg-[#064343]/75'
                    : 'bg-[#064343]/60'
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopPackagesCard;
