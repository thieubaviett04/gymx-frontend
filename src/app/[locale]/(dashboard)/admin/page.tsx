'use client';

import React from 'react';
import {
  DashboardStatCards,
  RevenueBarChart,
  TopPackagesCard,
  RecentTransactionsCard,
} from '@/components/dashboard';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Top Banner / Actions Bar per Figma 1329:14271 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] font-heading">
            Tổng quan hoạt động
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Theo dõi doanh thu, số liệu hội viên và các chỉ số vận hành quan trọng hôm nay.
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E2E8F0] text-xs font-semibold gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất báo cáo</span>
          </Button>

          <Button
            size="sm"
            className="rounded-xl bg-[#064343] hover:bg-[#085555] text-white text-xs font-semibold gap-2 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm gói tập</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <DashboardStatCards />

      {/* Main Revenue Chart */}
      <RevenueBarChart />

      {/* Bottom 2 Widgets Grid: Top Packages & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top selling packages (5 cols) */}
        <div className="lg:col-span-5">
          <TopPackagesCard />
        </div>

        {/* Recent Transactions (7 cols) */}
        <div className="lg:col-span-7">
          <RecentTransactionsCard />
        </div>
      </div>
    </div>
  );
}
