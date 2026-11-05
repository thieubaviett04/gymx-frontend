'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { TrashBinIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import {
  PACKAGE_DURATION_OPTIONS,
  PACKAGE_SORT_OPTIONS,
  PACKAGE_STATUS_LABELS,
  PackageStatus,
} from '@/types/package';

interface PackageToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  onAddNew: () => void;
}

export function PackageToolbar({
  searchValue,
  onSearchChange,
  selectedDuration,
  onDurationChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  onAddNew,
}: PackageToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue]);

  // Sync external search changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const hasFilter =
    !!localSearch ||
    (selectedDuration && selectedDuration !== 'ALL') ||
    (selectedStatus && selectedStatus !== 'ALL') ||
    (selectedSort && selectedSort !== 'latest');

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onDurationChange('ALL');
    onStatusChange('ALL');
    onSortChange('latest');
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-5">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search input matching GymX standard */}
        <div className="relative w-full sm:w-[320px] lg:w-[360px] h-[44px]">
          <Search
            className={cn(
              'absolute left-[14px] top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none stroke-[2.2]',
              isFocused || localSearch ? 'text-[#064343]' : 'text-[#9EA5C0]'
            )}
          />
          <input
            type="text"
            value={localSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã gói tập..."
            className={cn(
              'w-full h-[44px] pl-[44px] pr-9 rounded-[8px] bg-white text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] transition-all outline-none',
              isFocused || localSearch
                ? 'border-2 border-[#064343] ring-4 ring-[#064343]/20 shadow-md font-medium'
                : 'border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-2xs'
            )}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA5C0] hover:text-[#064343] p-0.5 cursor-pointer transition-colors"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Thời hạn */}
        <div className="min-w-[175px] sm:w-[190px]">
          <Select
            value={selectedDuration || 'ALL'}
            onValueChange={(val) => onDurationChange(val)}
          >
            <SelectTrigger className="w-full h-[44px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] data-[state=open]:ring-2 data-[state=open]:ring-[#064343]/20 cursor-pointer">
              <SelectValue placeholder="Thời hạn gói" />
            </SelectTrigger>
            <SelectContent>
              {PACKAGE_DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown Trạng thái */}
        <div className="min-w-[185px] sm:w-[200px]">
          <Select
            value={selectedStatus || 'ALL'}
            onValueChange={(val) => onStatusChange(val)}
          >
            <SelectTrigger className="w-full h-[44px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] data-[state=open]:ring-2 data-[state=open]:ring-[#064343]/20 cursor-pointer">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {(Object.keys(PACKAGE_STATUS_LABELS) as PackageStatus[]).map((st) => (
                <SelectItem key={st} value={st}>
                  {PACKAGE_STATUS_LABELS[st]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown Sắp xếp */}
        <div className="min-w-[175px] sm:w-[190px]">
          <Select
            value={selectedSort || 'latest'}
            onValueChange={(val) => onSortChange(val)}
          >
            <SelectTrigger className="w-full h-[44px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] data-[state=open]:ring-2 data-[state=open]:ring-[#064343]/20 cursor-pointer">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              {PACKAGE_SORT_OPTIONS.map((sort) => (
                <SelectItem key={sort.value} value={sort.value}>
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset filter button (nền trắng chữ đỏ, không đổi màu hover, icon thùng rác #EE464C) */}
        {hasFilter && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-[44px] px-5 min-w-[130px] bg-white border border-[#E2E8F0] active:scale-[0.98] text-[13px] font-semibold text-[#EE464C] rounded-[8px] shadow-2xs transition-transform flex items-center justify-center gap-2 cursor-pointer shrink-0"
            title="Xóa bộ lọc"
          >
            <TrashBinIcon className="w-4 h-4" color="#EE464C" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Button Thêm mới gói tập - không đổi màu hover */}
      <div className="shrink-0 self-end lg:self-auto">
        <button
          type="button"
          onClick={onAddNew}
          className="h-[44px] px-6 min-w-[165px] bg-[#064343] text-white font-normal text-[14px] leading-[20px] tracking-[0.01em] rounded-[10px] inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Thêm gói tập</span>
        </button>
      </div>
    </div>
  );
}

export default PackageToolbar;

