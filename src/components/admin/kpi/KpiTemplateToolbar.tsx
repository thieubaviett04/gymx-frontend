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
import type { KpiRole, KpiTemplateStatus } from '@/types/kpi';

interface KpiTemplateToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRole: KpiRole | 'ALL';
  onRoleChange: (role: KpiRole | 'ALL') => void;
  selectedStatus: KpiTemplateStatus | 'ALL';
  onStatusChange: (status: KpiTemplateStatus | 'ALL') => void;
}

export function KpiTemplateToolbar({
  searchValue,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
}: KpiTemplateToolbarProps) {
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

  const hasFilter = Boolean(
    localSearch ||
      selectedRole !== 'ALL' ||
      selectedStatus !== 'ALL'
  );

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onRoleChange('ALL');
    onStatusChange('ALL');
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-[260px] md:w-[300px] lg:w-[340px] h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-all focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] shrink-0">
        <Search className="w-5 h-5 text-[#697586] mr-2.5 shrink-0 pointer-events-none stroke-[2.2]" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm theo tên mẫu KPI..."
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
          onValueChange={(val) => onRoleChange(val as KpiRole | 'ALL')}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Đối tượng" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[170px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả đối tượng
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

      <div className="w-full sm:w-[160px] shrink-0">
        <Select
          value={selectedStatus}
          onValueChange={(val) => onStatusChange(val as KpiTemplateStatus | 'ALL')}
        >
          <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[160px]">
            <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
              Tất cả trạng thái
            </SelectItem>
            <SelectItem value="ACTIVE" className="text-[14px] py-2 cursor-pointer">
              Đang áp dụng
            </SelectItem>
            <SelectItem value="INACTIVE" className="text-[14px] py-2 cursor-pointer">
              Ngừng áp dụng
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

export default KpiTemplateToolbar;
