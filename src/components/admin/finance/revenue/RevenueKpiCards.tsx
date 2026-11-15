'use client';

import React from 'react';
import { formatVND } from '@/lib/utils/formatters';
import type { AnalyticsPeriod, FinancialSummaryDto } from '@/types/revenue';

interface RevenueKpiCardsProps {
  summary: FinancialSummaryDto;
  period?: AnalyticsPeriod;
  selectedDate?: string;
  selectedWeekEndDate?: string;
  selectedMonth?: string;
  selectedYear?: string;
  isLoading?: boolean;
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return '15/11/2026';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function formatWeekDisplay(endDateStr?: string) {
  if (!endDateStr) return '09/11 - 15/11/2026';
  const parts = endDateStr.split('-');
  if (parts.length === 3) {
    const end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const startStr = `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(2, '0')}`;
    const endStr = `${String(end.getDate()).padStart(2, '0')}/${String(end.getMonth() + 1).padStart(2, '0')}/${end.getFullYear()}`;
    return `${startStr} - ${endStr}`;
  }
  return endDateStr;
}

export function RevenueKpiCards({
  summary,
  period = 'this_month',
  selectedDate = '2026-11-15',
  selectedWeekEndDate = '2026-11-15',
  selectedMonth = '11',
  selectedYear = '2026',
  isLoading = false,
}: RevenueKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-5 pb-6 shadow-xs relative overflow-hidden animate-pulse space-y-6">
        <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
        <div className="flex items-center justify-between pb-2">
          <div className="h-6 w-56 bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 sm:gap-x-12 lg:gap-x-16 gap-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-6 w-32 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 sm:gap-x-12 lg:gap-x-16 gap-y-6 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-7 w-36 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const growthRate = summary?.revenueGrowthRate ?? 0;
  const isPositiveGrowth = growthRate > 0;
  const isZeroGrowth = growthRate === 0;

  const profitMargin =
    summary?.totalRevenue > 0
      ? Math.round((summary.netProfit / summary.totalRevenue) * 1000) / 10
      : 0;

  const formattedPeriod =
    period === 'today'
      ? formatDateDisplay(selectedDate)
      : period === '7days'
      ? formatWeekDisplay(selectedWeekEndDate)
      : period === 'this_year'
      ? `Năm ${selectedYear}`
      : `Tháng ${selectedMonth}/${selectedYear}`;

  return (
    <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-5 pb-6 shadow-xs relative overflow-hidden space-y-6">
      <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

      <div className="flex items-center justify-between pb-1">
        <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
          Tổng quan tài chính & doanh thu
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 sm:gap-x-12 lg:gap-x-16 xl:gap-x-20 gap-y-6 w-full">
        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Kỳ ghi nhận
          </div>
          <div className="text-[15px] font-medium text-[#202939] leading-[22px] truncate">
            {formattedPeriod}
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Người phụ trách
          </div>
          <div className="text-[15px] font-medium text-[#202939] leading-[22px] truncate">
            Admin GymFitness
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Tổng giao dịch
          </div>
          <div className="text-[15px] font-medium text-[#202939] leading-[22px] truncate">
            {summary?.totalTransactions ?? 0} lượt
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Giá trị TB / đơn
          </div>
          <div className="text-[15px] font-medium text-[#202939] leading-[22px] tabular-nums truncate">
            {formatVND(summary?.averageOrderValue)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 sm:gap-x-12 lg:gap-x-16 xl:gap-x-20 gap-y-6 w-full pt-1">
        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Tổng doanh thu
          </div>
          <div className="text-[20px] sm:text-[22px] font-bold text-[#064343] leading-[26px] tracking-tight tabular-nums truncate">
            {formatVND(summary?.totalRevenue)}
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Lợi nhuận ròng
          </div>
          <div className="text-[20px] sm:text-[22px] font-bold text-[#064343] leading-[26px] tracking-tight tabular-nums truncate">
            {formatVND(summary?.netProfit)}
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Chi phí vận hành
          </div>
          <div className="text-[20px] sm:text-[22px] font-bold text-[#EF4444] leading-[26px] tracking-tight tabular-nums truncate">
            {formatVND(summary?.totalExpense)}
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="text-[14px] font-medium text-[#697586] leading-[18px]">
            Biên lợi nhuận ròng
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[20px] sm:text-[22px] font-bold text-[#064343] leading-[26px] tracking-tight tabular-nums">
              {profitMargin}%
            </span>
            {!isZeroGrowth && (
              <span
                className={`text-[12px] font-semibold px-2 py-0.5 rounded-[4px] tabular-nums ${
                  isPositiveGrowth
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueKpiCards;
