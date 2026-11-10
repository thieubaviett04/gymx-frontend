'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, X, RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TargetRole, FormulaStatus } from '@/types/payroll';
import { TARGET_ROLE_LABELS, FORMULA_STATUS_LABELS } from '@/types/payroll';

interface FormulaToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRole: TargetRole | 'ALL';
  onRoleChange: (role: TargetRole | 'ALL') => void;
  selectedStatus: FormulaStatus | 'ALL';
  onStatusChange: (status: FormulaStatus | 'ALL') => void;
  onAddNew: () => void;
}

export function FormulaToolbar({
  searchValue,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onAddNew,
}: FormulaToolbarProps) {
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

  const hasFilter =
    !!localSearch ||
    selectedRole !== 'ALL' ||
    selectedStatus !== 'ALL';

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onRoleChange('ALL');
    onStatusChange('ALL');
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 mb-5">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="relative w-full sm:w-[280px] lg:w-[320px] h-[48px]">
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
            placeholder="Tìm theo tên công thức..."
            className={cn(
              'w-full h-[48px] pl-[44px] pr-9 rounded-[8px] bg-white text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] transition-all outline-none',
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA5C0] hover:text-[#0A0A0A] p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-[190px]">
          <Select
            value={selectedRole}
            onValueChange={(val) => onRoleChange(val as TargetRole | 'ALL')}
          >
            <SelectTrigger
              className={cn(
                'w-full h-[48px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] cursor-pointer',
                selectedRole !== 'ALL' && 'border-[#064343] bg-[#064343]/5 font-medium'
              )}
            >
              <SelectValue placeholder="Tất cả đối tượng" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[200px]">
              <SelectItem value="ALL" className="text-[14px] py-2.5 cursor-pointer">
                Tất cả đối tượng
              </SelectItem>
              <SelectItem value="TRAINER" className="text-[14px] py-2.5 cursor-pointer">
                {TARGET_ROLE_LABELS.TRAINER}
              </SelectItem>
              <SelectItem value="RECEPTIONIST" className="text-[14px] py-2.5 cursor-pointer">
                {TARGET_ROLE_LABELS.RECEPTIONIST}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[170px]">
          <Select
            value={selectedStatus}
            onValueChange={(val) => onStatusChange(val as FormulaStatus | 'ALL')}
          >
            <SelectTrigger
              className={cn(
                'w-full h-[48px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] cursor-pointer',
                selectedStatus !== 'ALL' && 'border-[#064343] bg-[#064343]/5 font-medium'
              )}
            >
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[180px]">
              <SelectItem value="ALL" className="text-[14px] py-2.5 cursor-pointer">
                Tất cả trạng thái
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-[14px] py-2.5 cursor-pointer">
                {FORMULA_STATUS_LABELS.ACTIVE}
              </SelectItem>
              <SelectItem value="INACTIVE" className="text-[14px] py-2.5 cursor-pointer">
                {FORMULA_STATUS_LABELS.INACTIVE}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-[48px] px-3.5 bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#64748B] hover:text-[#0A0A0A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAddNew}
          className="h-[48px] px-5 bg-[#064343] hover:bg-[#053737] rounded-[8px] text-[14px] font-medium text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
          <span>Thêm công thức</span>
        </button>
      </div>
    </div>
  );
}

export default FormulaToolbar;

