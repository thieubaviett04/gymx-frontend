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

interface RewardToolbarProps {
  periodOptions?: Array<{ id: string; label: string }>;
  selectedPeriodId: string;
  onPeriodChange: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRole: TargetRole | 'ALL';
  onRoleChange: (role: TargetRole | 'ALL') => void;
  selectedBonusType: 'ALL' | 'KPI' | 'HOLIDAY';
  onBonusTypeChange: (type: 'ALL' | 'KPI' | 'HOLIDAY') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function RewardToolbar({
  periodOptions,
  selectedPeriodId,
  onPeriodChange,
  searchValue,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedBonusType,
  onBonusTypeChange,
  onResetFilters,
  hasActiveFilters,
}: RewardToolbarProps) {
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

      <div className="w-full sm:w-[190px] shrink-0">
        <Select value={selectedPeriodId} onValueChange={onPeriodChange}>
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn kỳ" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[210px] max-h-[300px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer font-medium text-[#064343]">
              Tất cả các kỳ (Lịch sử)
            </SelectItem>
            {periodsList.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-[14px] py-2 cursor-pointer">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[160px] shrink-0">
        <Select
          value={selectedRole}
          onValueChange={(val) => onRoleChange(val as TargetRole | 'ALL')}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chức vụ" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[180px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả chức vụ
            </SelectItem>
            <SelectItem value="TRAINER" className="text-[14px] py-2 cursor-pointer">
              Huấn luyện viên
            </SelectItem>
            <SelectItem value="RECEPTIONIST" className="text-[14px] py-2 cursor-pointer">
              Lễ tân
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[170px] shrink-0">
        <Select
          value={selectedBonusType}
          onValueChange={(val) => onBonusTypeChange(val as 'ALL' | 'KPI' | 'HOLIDAY')}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Hình thức thưởng" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[180px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả hình thức
            </SelectItem>
            <SelectItem value="KPI" className="text-[14px] py-2 cursor-pointer">
              Thưởng KPI
            </SelectItem>
            <SelectItem value="HOLIDAY" className="text-[14px] py-2 cursor-pointer">
              Thưởng lễ tết
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="h-[48px] px-4 rounded-[8px] bg-slate-100 text-[#2F3D50] hover:bg-slate-200 text-[14px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="Xóa lọc"
        >
          <TrashBinIcon className="w-4 h-4 text-[#475569]" />
          <span>Xóa lọc</span>
        </button>
      )}
    </div>
  );
}

export default RewardToolbar;
