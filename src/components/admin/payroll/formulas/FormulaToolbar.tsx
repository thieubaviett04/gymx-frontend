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
import type { TargetRole, FormulaStatus } from '@/types/payroll';
import { TARGET_ROLE_LABELS, FORMULA_STATUS_LABELS } from '@/types/payroll';

interface FormulaToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRole: TargetRole | 'ALL';
  onRoleChange: (role: TargetRole | 'ALL') => void;
  selectedStatus: FormulaStatus | 'ALL';
  onStatusChange: (status: FormulaStatus | 'ALL') => void;
  onAddNew?: () => void;
}

export function FormulaToolbar({
  searchValue,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
}: FormulaToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-[260px] md:w-[300px] lg:w-[340px] h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-all focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] shrink-0">
        <Search className="w-4 h-4 text-[#697586] mr-2.5 shrink-0 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm theo tên chính sách"
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

      <div className="w-full sm:w-[170px] shrink-0">
        <Select
          value={selectedRole}
          onValueChange={(val) => onRoleChange(val as TargetRole | 'ALL')}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[200px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả đối tượng
            </SelectItem>
            <SelectItem value="TRAINER" className="text-[14px] py-2 cursor-pointer">
              {TARGET_ROLE_LABELS.TRAINER}
            </SelectItem>
            <SelectItem value="RECEPTIONIST" className="text-[14px] py-2 cursor-pointer">
              {TARGET_ROLE_LABELS.RECEPTIONIST}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[160px] shrink-0">
        <Select
          value={selectedStatus}
          onValueChange={(val) => onStatusChange(val as FormulaStatus | 'ALL')}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[180px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả trạng thái
            </SelectItem>
            <SelectItem value="ACTIVE" className="text-[14px] py-2 cursor-pointer">
              {FORMULA_STATUS_LABELS.ACTIVE}
            </SelectItem>
            <SelectItem value="INACTIVE" className="text-[14px] py-2 cursor-pointer">
              {FORMULA_STATUS_LABELS.INACTIVE}
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
          <TrashBinIcon className="w-4 h-4 text-[#EE464C]" color="#EE464C" />
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
}

export default FormulaToolbar;
