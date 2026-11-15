'use client';

import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import type { TabItem } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AnalyticsPeriod, AnalyticsViewMode } from '@/types/revenue';

interface RevenueToolbarProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedWeekEndDate: string;
  onWeekEndDateChange: (date: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  viewMode: AnalyticsViewMode;
  onViewModeChange: (mode: AnalyticsViewMode) => void;
  onExportExcel: () => void;
  isExporting?: boolean;
}

const PERIOD_TABS: TabItem<AnalyticsPeriod>[] = [
  { id: 'today', label: 'Theo ngày' },
  { id: '7days', label: 'Theo tuần' },
  { id: 'this_month', label: 'Theo tháng' },
  { id: 'this_year', label: 'Theo năm' },
];

const DAY_OPTIONS = [
  ...Array.from({ length: 15 }, (_, i) => {
    const day = 15 - i;
    const dStr = String(day).padStart(2, '0');
    return { value: `2026-11-${dStr}`, label: `${dStr}/11/2026` };
  }),
  { value: '2026-10-31', label: '31/10/2026' },
  { value: '2026-10-30', label: '30/10/2026' },
  { value: '2026-10-29', label: '29/10/2026' },
  { value: '2026-10-28', label: '28/10/2026' },
  { value: '2026-10-27', label: '27/10/2026' },
  { value: '2026-10-26', label: '26/10/2026' },
  { value: '2026-10-25', label: '25/10/2026' },
];

const WEEK_OPTIONS = [
  { value: '2026-11-15', label: '09/11 - 15/11/2026' },
  { value: '2026-11-08', label: '02/11 - 08/11/2026' },
  { value: '2026-11-01', label: '26/10 - 01/11/2026' },
  { value: '2026-10-25', label: '19/10 - 25/10/2026' },
  { value: '2026-10-18', label: '12/10 - 18/10/2026' },
  { value: '2026-10-11', label: '05/10 - 11/10/2026' },
  { value: '2026-10-04', label: '28/09 - 04/10/2026' },
  { value: '2026-09-27', label: '21/09 - 27/09/2026' },
];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEAR_OPTIONS = [2026, 2025, 2024];

function ChartViewIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
      <line x1="2" x2="2" y1="20" y2="4" />
      <line x1="2" x2="22" y1="20" y2="20" />
    </svg>
  );
}

function TableViewIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  );
}

const VIEW_MODE_TABS: TabItem<AnalyticsViewMode>[] = [
  {
    id: 'visual',
    label: (
      <span className="flex items-center gap-2">
        <ChartViewIcon className="w-4 h-4" />
        <span>Biểu đồ</span>
      </span>
    ),
  },
  {
    id: 'table',
    label: (
      <span className="flex items-center gap-2">
        <TableViewIcon className="w-4 h-4" />
        <span>Dạng bảng</span>
      </span>
    ),
  },
];

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

export function RevenueToolbar({
  period,
  onPeriodChange,
  selectedDate,
  onDateChange,
  selectedWeekEndDate,
  onWeekEndDateChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  viewMode,
  onViewModeChange,
  onExportExcel,
  isExporting = false,
}: RevenueToolbarProps) {
  const dayOptions = React.useMemo(() => {
    const hasCurrent = DAY_OPTIONS.some((o) => o.value === selectedDate);
    if (hasCurrent) return DAY_OPTIONS;
    return [{ value: selectedDate, label: formatDateDisplay(selectedDate) }, ...DAY_OPTIONS];
  }, [selectedDate]);

  const weekOptions = React.useMemo(() => {
    const hasCurrent = WEEK_OPTIONS.some((o) => o.value === selectedWeekEndDate);
    if (hasCurrent) return WEEK_OPTIONS;
    return [{ value: selectedWeekEndDate, label: formatWeekDisplay(selectedWeekEndDate) }, ...WEEK_OPTIONS];
  }, [selectedWeekEndDate]);

  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-wrap select-none">
        <Tabs
          tabs={PERIOD_TABS}
          activeTab={period}
          onChange={onPeriodChange}
          className="h-[42px] gap-2 shrink-0"
          tabClassName="h-[42px] px-4 rounded-[8px] text-[13px] font-medium"
        />

        {period === 'today' && (
          <div className="shrink-0 min-w-[145px]">
            <Select value={selectedDate} onValueChange={onDateChange}>
              <SelectTrigger className="h-[42px] px-3.5 rounded-[8px] bg-[#F8FAFC] text-[13px] text-[#202939] border border-[#E2E8F0] shadow-none hover:border-[#064343] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer flex items-center justify-between font-medium">
                <SelectValue placeholder="Chọn ngày" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg max-h-[280px] min-w-[145px]">
                {dayOptions.map((d) => (
                  <SelectItem
                    key={d.value}
                    value={d.value}
                    className="text-[13px] py-2 cursor-pointer font-medium"
                  >
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {period === '7days' && (
          <div className="shrink-0 min-w-[195px]">
            <Select value={selectedWeekEndDate} onValueChange={onWeekEndDateChange}>
              <SelectTrigger className="h-[42px] px-3.5 rounded-[8px] bg-[#F8FAFC] text-[13px] text-[#202939] border border-[#E2E8F0] shadow-none hover:border-[#064343] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer flex items-center justify-between font-medium">
                <SelectValue placeholder="Chọn tuần" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg max-h-[280px] min-w-[195px]">
                {weekOptions.map((w) => (
                  <SelectItem
                    key={w.value}
                    value={w.value}
                    className="text-[13px] py-2 cursor-pointer font-medium"
                  >
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {period === 'this_month' && (
          <div className="shrink-0 min-w-[155px]">
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="h-[42px] px-3.5 rounded-[8px] bg-[#F8FAFC] text-[13px] text-[#202939] border border-[#E2E8F0] shadow-none hover:border-[#064343] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer flex items-center justify-between font-medium">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[155px]">
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem
                    key={m}
                    value={String(m)}
                    className="text-[13px] py-2 cursor-pointer font-medium"
                  >
                    Tháng {m}/{selectedYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {period === 'this_year' && (
          <div className="shrink-0 min-w-[130px]">
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger className="h-[42px] px-3.5 rounded-[8px] bg-[#F8FAFC] text-[13px] text-[#202939] border border-[#E2E8F0] shadow-none hover:border-[#064343] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer flex items-center justify-between font-medium">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[130px]">
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem
                    key={y}
                    value={String(y)}
                    className="text-[13px] py-2 cursor-pointer font-medium"
                  >
                    Năm {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap select-none">
        <Tabs
          tabs={VIEW_MODE_TABS}
          activeTab={viewMode}
          onChange={onViewModeChange}
          className="h-[42px] gap-2 shrink-0"
          tabClassName="h-[42px] px-4 rounded-[8px] text-[13px] font-medium"
        />

        <button
          type="button"
          onClick={onExportExcel}
          disabled={isExporting}
          className="h-[42px] px-4 rounded-[8px] bg-white border border-[#E2E8F0] shadow-[0px_3px_26px_0px_rgba(175,190,211,0.15)] hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer select-none shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#064343]" />
          ) : (
            <Image
              src="/icons/excel-icon.svg"
              alt="Excel"
              width={22}
              height={22}
              className="w-5 h-5 shrink-0"
            />
          )}
          <span className="text-[#2F3D50] text-[14px] font-normal leading-[24px]">
            Xuất excel
          </span>
        </button>
      </div>
    </div>
  );
}

export default RevenueToolbar;