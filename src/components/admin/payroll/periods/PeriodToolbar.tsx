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
import type { PayrollPeriodStatus } from '@/types/payroll';

interface PeriodToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  year: number;
  onYearChange: (year: number) => void;
  status: PayrollPeriodStatus | 'ALL';
  onStatusChange: (status: PayrollPeriodStatus | 'ALL') => void;
}

export function PeriodToolbar({
  search,
  onSearchChange,
  year,
  onYearChange,
  status,
  onStatusChange,
}: PeriodToolbarProps) {
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

  const hasFilter = Boolean(localSearch || status !== 'ALL');

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onStatusChange('ALL');
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-[240px] md:w-[280px] lg:w-[300px] h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-all focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] shrink-0">
        <Search className="w-5 h-5 text-[#697586] mr-2.5 shrink-0 pointer-events-none stroke-[2.2]" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm theo kỳ lương, công thức..."
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
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-full sm:w-[130px] shrink-0">
        <Select
          value={String(year)}
          onValueChange={(val) => onYearChange(Number(val))}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[130px]">
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)} className="text-[14px] py-2 cursor-pointer">
                Năm {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[170px] shrink-0">
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(val as PayrollPeriodStatus | 'ALL')}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[180px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả trạng thái
            </SelectItem>
            <SelectItem value="CALCULATED" className="text-[14px] py-2 cursor-pointer">
              Đã tính
            </SelectItem>
            <SelectItem value="CONFIRMED" className="text-[14px] py-2 cursor-pointer">
              Đã khóa
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

export default PeriodToolbar;

