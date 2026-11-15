'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConnectionErrorState, EmptySearchState } from '@/components/shared';
import { financeService } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/error-helper';
import { RevenueCategoryBreakdown } from './RevenueCategoryBreakdown';
import { RevenueDataTable } from './RevenueDataTable';
import { RevenueKpiCards } from './RevenueKpiCards';
import { RevenueToolbar } from './RevenueToolbar';
import { RevenueTrendChart } from './RevenueTrendChart';
import type { AnalyticsPeriod, AnalyticsViewMode } from '@/types/revenue';

interface RevenueAnalyticsViewProps {
  onShowToast: (type: 'success' | 'error' | 'warning', message: string) => void;
}

function getMonthDateRange(monthStr: string, yearStr: string) {
  const m = parseInt(monthStr, 10);
  const y = parseInt(yearStr, 10);
  const formattedMonth = String(m).padStart(2, '0');
  const fromDate = `${y}-${formattedMonth}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const toDate = `${y}-${formattedMonth}-${String(lastDay).padStart(2, '0')}`;
  return { fromDate, toDate };
}

export function RevenueAnalyticsView({ onShowToast }: RevenueAnalyticsViewProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('this_month');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-15');
  const [selectedWeekEndDate, setSelectedWeekEndDate] = useState<string>('2026-11-15');
  const [selectedMonth, setSelectedMonth] = useState<string>('11');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('visual');
  const [isExporting, setIsExporting] = useState(false);

  const { effectivePeriod, fromDate, toDate } = useMemo(() => {
    if (period === 'today') {
      if (selectedDate === '2026-11-15') {
        return { effectivePeriod: 'today' as AnalyticsPeriod, fromDate: undefined, toDate: undefined };
      }
      return { effectivePeriod: 'custom' as AnalyticsPeriod, fromDate: selectedDate, toDate: selectedDate };
    }

    if (period === '7days') {
      if (selectedWeekEndDate === '2026-11-15') {
        return { effectivePeriod: '7days' as AnalyticsPeriod, fromDate: undefined, toDate: undefined };
      }
      const parts = selectedWeekEndDate.split('-');
      const end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      return { effectivePeriod: 'custom' as AnalyticsPeriod, fromDate: startStr, toDate: selectedWeekEndDate };
    }

    if (period === 'this_month') {
      if (selectedMonth === '11' && selectedYear === '2026') {
        return { effectivePeriod: 'this_month' as AnalyticsPeriod, fromDate: undefined, toDate: undefined };
      }
      const range = getMonthDateRange(selectedMonth, selectedYear);
      return { effectivePeriod: 'custom' as AnalyticsPeriod, fromDate: range.fromDate, toDate: range.toDate };
    }

    if (period === 'this_year') {
      if (selectedYear === '2026') {
        return { effectivePeriod: 'this_year' as AnalyticsPeriod, fromDate: undefined, toDate: undefined };
      }
      return {
        effectivePeriod: 'custom' as AnalyticsPeriod,
        fromDate: `${selectedYear}-01-01`,
        toDate: `${selectedYear}-12-31`,
      };
    }

    return { effectivePeriod: period, fromDate: undefined, toDate: undefined };
  }, [period, selectedDate, selectedWeekEndDate, selectedMonth, selectedYear]);

  const {
    data: analyticsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'admin-finance-revenue-analytics',
      { period: effectivePeriod, fromDate, toDate },
    ],
    queryFn: async () => {
      const res = await financeService.getRevenueAnalytics({
        period: effectivePeriod,
        fromDate,
        toDate,
      });
      return res.data;
    },
  });

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await financeService.downloadRevenueReport({
        period: effectivePeriod,
        fromDate,
        toDate,
        format: 'excel',
      });
      onShowToast('success', 'Đã xuất báo cáo doanh thu thành công.');
    } catch (err) {
      onShowToast('error', getErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setPeriod('this_month');
    setSelectedDate('2026-11-15');
    setSelectedWeekEndDate('2026-11-15');
    setSelectedMonth('11');
    setSelectedYear('2026');
  };

  if (isError) {
    return (
      <ConnectionErrorState
        onRetry={() => refetch()}
        message={getErrorMessage(error)}
      />
    );
  }

  const summary = analyticsData?.summary ?? {
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    totalTransactions: 0,
    revenueGrowthRate: 0,
    averageOrderValue: 0,
  };

  const chartSlots = analyticsData?.chartData ?? [];
  const categoryBreakdown = analyticsData?.categoryBreakdown ?? [];
  const hasData = analyticsData?.hasData ?? false;

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      <div className="w-full bg-white rounded-[12px] border border-[#E2E8F0] p-[16px_20px] shadow-xs">
        <RevenueToolbar
          period={period}
          onPeriodChange={setPeriod}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedWeekEndDate={selectedWeekEndDate}
          onWeekEndDateChange={setSelectedWeekEndDate}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExportExcel={handleExportExcel}
          isExporting={isExporting}
        />
      </div>

      <RevenueKpiCards
        summary={summary}
        period={period}
        selectedDate={selectedDate}
        selectedWeekEndDate={selectedWeekEndDate}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        isLoading={isLoading}
      />

      {!isLoading && !hasData && chartSlots.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-8 shadow-xs">
          <EmptySearchState
            title="Không có dữ liệu doanh thu phù hợp"
            message="Không tìm thấy giao dịch thanh toán hoặc khoản chi nào trong khoảng thời gian đã chọn."
            onClearFilter={handleResetFilters}
            clearFilterText="Xem dữ liệu tháng này"
          />
        </div>
      ) : viewMode === 'table' ? (
        <RevenueDataTable
          slots={chartSlots}
          isLoading={isLoading}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <RevenueTrendChart
              slots={chartSlots}
              period={period}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <RevenueCategoryBreakdown
              categories={categoryBreakdown}
              totalRevenue={summary.totalRevenue}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenueAnalyticsView;
