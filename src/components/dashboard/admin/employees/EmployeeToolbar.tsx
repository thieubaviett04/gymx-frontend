'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { EMPLOYEE_POSITIONS, EMPLOYEE_STATUSES } from '@/types/employee';

interface EmployeeToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedPosition: string;
  onPositionChange: (position: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onAddNew: () => void;
}

export function EmployeeToolbar({
  searchValue,
  onSearchChange,
  selectedPosition,
  onPositionChange,
  selectedStatus,
  onStatusChange,
  onAddNew,
}: EmployeeToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Debounce search 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue]);

  // Sync external search change
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const hasFilter = !!selectedPosition || !!selectedStatus || !!localSearch;

  const handleResetFilter = () => {
    setLocalSearch('');
    onSearchChange('');
    onPositionChange('');
    onStatusChange('');
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-5">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search Input matching Figma Node 1346:6502 */}
        <div className="relative w-full sm:w-[320px] md:w-[360px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EA5C0] pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã NV..."
            className="w-full h-11 pl-10 pr-9 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder-[#9EA5C0] transition-colors focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] shadow-2xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA5C0] hover:text-[#0F172A] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Vai trò (Role Filter) */}
        <div className="relative min-w-[160px] sm:min-w-[184px]">
          <select
            value={selectedPosition}
            onChange={(e) => onPositionChange(e.target.value)}
            className="w-full h-11 px-3.5 pr-8 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#2F3D50] appearance-none cursor-pointer focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] shadow-2xs transition-colors"
          >
            <option value="">Tất cả vai trò</option>
            {EMPLOYEE_POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#538D64]">
            <svg className="w-4 h-4 fill-current text-[#64748B]" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Dropdown Trạng thái (Status Filter) */}
        <div className="relative min-w-[150px]">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full h-11 px-3.5 pr-8 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#2F3D50] appearance-none cursor-pointer focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] shadow-2xs transition-colors"
          >
            <option value="">Tất cả trạng thái</option>
            {EMPLOYEE_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#538D64]">
            <svg className="w-4 h-4 fill-current text-[#64748B]" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Reset filter button */}
        {hasFilter && (
          <button
            type="button"
            onClick={handleResetFilter}
            className="h-11 px-3 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Primary Action Button matching Figma 1346:6513 */}
      <Button
        type="button"
        onClick={onAddNew}
        className="h-11 px-4.5 bg-[#064343] hover:bg-[#053737] text-white font-medium rounded-[10px] shadow-sm flex items-center gap-2 cursor-pointer shrink-0 transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Thêm nhân viên</span>
      </Button>
    </div>
  );
}
