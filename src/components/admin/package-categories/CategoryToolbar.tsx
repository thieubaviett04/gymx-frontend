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
import { PACKAGE_CATEGORY_STATUS_LABELS } from '@/types/packageCategory';

interface CategoryToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onAddNew: () => void;
}

export function CategoryToolbar({
  searchValue,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onAddNew,
}: CategoryToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue]);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const hasFilter = !!localSearch || (selectedStatus && selectedStatus !== 'ALL');

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onStatusChange('ALL');
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-5">
      <div className="flex flex-wrap items-center gap-3 flex-1">
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
            placeholder="Nhập mã, tên danh mục..."
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

        <div className="min-w-[185px] sm:w-[200px]">
          <Select
            value={selectedStatus || 'ALL'}
            onValueChange={(val) => onStatusChange(val)}
          >
            <SelectTrigger className="w-full h-[44px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] data-[state=open]:ring-2 data-[state=open]:ring-[#064343]/20 cursor-pointer">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">
                {PACKAGE_CATEGORY_STATUS_LABELS.ACTIVE}
              </SelectItem>
              <SelectItem value="INACTIVE">
                {PACKAGE_CATEGORY_STATUS_LABELS.INACTIVE}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-[44px] px-5 min-w-[130px] bg-white border border-[#E2E8F0] active:scale-[0.98] text-[14px] font-normal leading-[20px] text-[#EE464C] rounded-[8px] shadow-2xs transition-transform flex items-center justify-center gap-2 cursor-pointer shrink-0"
            title="Xóa bộ lọc"
          >
            <TrashBinIcon className="w-5 h-5" color="#EE464C" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      <div className="shrink-0 self-end lg:self-auto">
        <button
          type="button"
          onClick={onAddNew}
          className="h-[44px] px-6 min-w-[165px] bg-[#064343] text-white font-normal text-[14px] leading-[20px] tracking-[0.01em] rounded-[10px] inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 text-white stroke-[2]" />
          <span>Thêm danh mục</span>
        </button>
      </div>
    </div>
  );
}

export default CategoryToolbar;
