'use client';

import React from 'react';
import {
  DashboardStatCards,
  RevenueBarChart,
  TopPackagesCard,
  RecentTransactionsCard,
} from '@/components/dashboard';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
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
