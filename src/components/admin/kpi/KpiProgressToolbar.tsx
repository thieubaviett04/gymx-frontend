'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TrashBinIcon,
} from '@/components/ui';
import type { KpiRole, KpiStatus } from '@/types/kpi';

interface KpiProgressToolbarProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  status: 'ALL' | KpiStatus;
  onStatusChange: (status: 'ALL' | KpiStatus) => void;
  position?: 'ALL' | KpiRole;
  onPositionChange?: (pos: 'ALL' | KpiRole) => void;
}

export function KpiProgressToolbar({
  month,
  year,
  onMonthChange,
  onYearChange,
  search,
  onSearchChange,
  status,
  onStatusChange,
  onPositionChange,
}: KpiProgressToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const currentYear = new Date().getFullYear();
  const periodOptions: Array<{ value: string; month: number; year: number; label: string }> = [];

  for (let y = currentYear + 1; y >= currentYear - 1; y--) {
    for (let m = 12; m >= 1; m--) {
      periodOptions.push({
        value: `${m}-${y}`,
        month: m,
        year: y,
        label: `Tháng ${m < 10 ? '0' + m : m}/${y}`,
      });
    }
  }

  const selectedPeriodValue = `${month}-${year}`;

  const hasFilter = Boolean(localSearch || status !== 'ALL');

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onStatusChange('ALL');
    if (onPositionChange) {
      onPositionChange('ALL');
    }
  };

  const handlePeriodChange = (val: string) => {
    const [mStr, yStr] = val.split('-');
    const m = Number(mStr);
    const y = Number(yStr);
    if (!isNaN(m) && !isNaN(y)) {
      onMonthChange(m);
      onYearChange(y);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-[260px] md:w-[280px] lg:w-[320px] h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-all focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] shrink-0">
        <Search className="w-5 h-5 text-[#697586] mr-2.5 shrink-0 pointer-events-none stroke-[2.2]" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc mã NV..."
          className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
            }}
            className="text-[#697586] hover:text-[#202939] p-0.5 cursor-pointer ml-1"
            title="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-full sm:w-[175px] shrink-0">
        <Select
          value={selectedPeriodValue}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn kỳ" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[175px] max-h-[300px]">
            {periodOptions.map((p) => (
              <SelectItem key={p.value} value={p.value} className="text-[14px] py-2 cursor-pointer">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[170px] shrink-0">
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(val as 'ALL' | KpiStatus)}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[170px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả trạng thái
            </SelectItem>
            <SelectItem value="IN_PROGRESS" className="text-[14px] py-2 cursor-pointer">
              Đang áp dụng
            </SelectItem>
            <SelectItem value="ACHIEVED" className="text-[14px] py-2 cursor-pointer">
              Đạt chỉ tiêu
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="h-[48px] px-5 min-w-[130px] bg-white border border-[#E2E8F0] active:scale-[0.98] text-[14px] font-normal leading-[20px] text-[#EE464C] rounded-[8px] shadow-2xs transition-transform flex items-center justify-center gap-2 cursor-pointer shrink-0"
          title="Xóa bộ lọc"
        >
          <TrashBinIcon className="w-5 h-5" color="#EE464C" />
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
}

export default KpiProgressToolbar;
