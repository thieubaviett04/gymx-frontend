'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TrashBinIcon,
} from '@/components/ui';
import type { TargetRole } from '@/types/payroll';

interface ViolationToolbarProps {
  periodOptions?: Array<{ id: string; label: string }>;
  selectedPeriodId: string;
  onPeriodChange: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRole: TargetRole | 'ALL';
  onRoleChange: (role: TargetRole | 'ALL') => void;
  selectedStatus: 'ALL' | 'ACTIVE' | 'CANCELLED';
  onStatusChange: (status: 'ALL' | 'ACTIVE' | 'CANCELLED') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function ViolationToolbar({
  periodOptions,
  selectedPeriodId,
  onPeriodChange,
  searchValue,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  hasActiveFilters,
}: ViolationToolbarProps) {
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

  const periodsList = useMemo(() => {
    if (periodOptions && periodOptions.length > 0) {
      return periodOptions;
    }
    const now = new Date();
    const startMonth = now.getMonth();
    const startYear = now.getFullYear();
    const list = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      list.push({
        id: `${m}-${y}`,
        label: `Tháng ${m}/${y}`,
      });
    }
    return list;
  }, [periodOptions]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-[220px] md:w-[260px] h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-all focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] shrink-0">
        <Search className="w-4 h-4 text-[#697586] mr-2.5 shrink-0 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm kiếm nhân viên..."
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
        <Select value={selectedPeriodId} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-full h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-[#202939] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn kỳ" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50">
            <SelectItem value="ALL" className="text-[13px] cursor-pointer font-medium text-[#064343]">
              Tất cả các kỳ (Lịch sử)
            </SelectItem>
            {periodsList.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-[13px] cursor-pointer">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[160px] shrink-0">
        <Select value={selectedRole} onValueChange={(val) => onRoleChange(val as TargetRole | 'ALL')}>
          <SelectTrigger className="w-full h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-[#202939] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Tất cả chức vụ" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50">
            <SelectItem value="ALL" className="text-[13px] cursor-pointer">
              Tất cả chức vụ
            </SelectItem>
            <SelectItem value="TRAINER" className="text-[13px] cursor-pointer">
              Huấn luyện viên
            </SelectItem>
            <SelectItem value="RECEPTIONIST" className="text-[13px] cursor-pointer">
              Lễ tân
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[160px] shrink-0">
        <Select value={selectedStatus} onValueChange={(val) => onStatusChange(val as 'ALL' | 'ACTIVE' | 'CANCELLED')}>
          <SelectTrigger className="w-full h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-[#202939] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50">
            <SelectItem value="ALL" className="text-[13px] cursor-pointer">
              Tất cả trạng thái
            </SelectItem>
            <SelectItem value="ACTIVE" className="text-[13px] cursor-pointer font-medium text-emerald-700">
              Đang hiệu lực
            </SelectItem>
            <SelectItem value="CANCELLED" className="text-[13px] cursor-pointer text-slate-500">
              Đã hủy
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
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

export default ViolationToolbar;

