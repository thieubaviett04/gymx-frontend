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

interface ReceiptsToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  month: string;
  onMonthChange: (month: string) => void;
  year: string;
  onYearChange: (year: string) => void;
  onReset: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function ReceiptsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  onReset,
}: ReceiptsToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  const [isFocused, setIsFocused] = useState(false);

  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  const hasFilter = Boolean(
    localSearch || status !== 'ALL' || month !== 'ALL' || year !== 'ALL'
  );

  const handleMonthChange = (val: string) => {
    onMonthChange(val);
    if (val !== 'ALL' && year === 'ALL') {
      onYearChange(String(CURRENT_YEAR));
    }
  };

  const handleYearChange = (val: string) => {
    onYearChange(val);
    if (val === 'ALL' && month !== 'ALL') {
      onMonthChange('ALL');
    }
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onReset();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
      {/* Search Input matching EmployeeToolbar standard */}
      <div className="relative w-full sm:w-[240px] md:w-[280px] lg:w-[300px] h-[48px] shrink-0">
        <Search
          className={`absolute left-[14px] top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none stroke-[2.2] ${
            isFocused || localSearch ? 'text-[#064343]' : 'text-[#9EA5C0]'
          }`}
        />
        <input
          type="text"
          value={localSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm số phiếu, đối tượng, SĐT..."
          className={`w-full h-[48px] pl-[44px] pr-9 rounded-[8px] bg-white text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] transition-all outline-none ${
            isFocused || localSearch
              ? 'border-2 border-[#064343] ring-4 ring-[#064343]/20 shadow-md font-medium'
              : 'border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-2xs'
          }`}
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA5C0] hover:text-[#064343] p-0.5 cursor-pointer transition-colors"
            title="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-full sm:w-[170px] shrink-0">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-white px-3.5 text-[14px] text-[#202939] border border-[#E2E8F0] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[170px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả trạng thái
            </SelectItem>
            <SelectItem value="PAID" className="text-[14px] py-2 cursor-pointer">
              Đã thu tiền
            </SelectItem>
            <SelectItem value="PENDING" className="text-[14px] py-2 cursor-pointer">
              Chờ thanh toán
            </SelectItem>
            <SelectItem value="CANCELLED" className="text-[14px] py-2 cursor-pointer">
              Đã hủy
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[135px] shrink-0">
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-white px-3.5 text-[14px] text-[#202939] border border-[#E2E8F0] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn tháng" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[135px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả tháng
            </SelectItem>
            {MONTH_OPTIONS.map((m) => (
              <SelectItem key={m} value={String(m)} className="text-[14px] py-2 cursor-pointer">
                Tháng {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[125px] shrink-0">
        <Select value={year} onValueChange={handleYearChange}>
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-white px-3.5 text-[14px] text-[#202939] border border-[#E2E8F0] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[125px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả năm
            </SelectItem>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)} className="text-[14px] py-2 cursor-pointer">
                Năm {y}
              </SelectItem>
            ))}
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

export default ReceiptsToolbar;
