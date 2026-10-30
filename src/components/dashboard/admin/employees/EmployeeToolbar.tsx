"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, X } from "lucide-react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { cn } from "@/lib/utils";
import { EMPLOYEE_POSITIONS, EMPLOYEE_STATUSES } from "@/types/employee";

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

  // Sync external search change
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const hasFilter = !!selectedPosition || !!selectedStatus || !!localSearch;

  const handleResetFilter = () => {
    setLocalSearch("");
    onSearchChange("");
    onPositionChange("");
    onStatusChange("");
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3.5 mb-5">
      {/* Search & Filters (Figma Container #1346:6501) */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search Input matching Figma Node 1346:6502 */}
        <div className="relative w-full sm:w-[380px] lg:w-[420px] h-[44px]">
          <Search
            className={cn(
              "absolute left-[14px] top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none stroke-[2.2]",
              isFocused || localSearch ? "text-[#064343]" : "text-[#9EA5C0]"
            )}
          />
          <input
            type="text"
            value={localSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã NV..."
            className={cn(
              "w-full h-[44px] pl-[44px] pr-9 rounded-[8px] bg-white text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] transition-all outline-none",
              isFocused || localSearch
                ? "border-2 border-[#064343] ring-4 ring-[#064343]/20 shadow-md font-medium"
                : "border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-2xs"
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
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Vai trò (Role Filter matching Figma #1346:6508 & #777:13666) */}
        <div className="min-w-[210px] sm:w-[245px]">
          <Select
            value={selectedPosition || "ALL"}
            onValueChange={(val) => onPositionChange(val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="w-full h-[44px] px-3.5 rounded-[8px] border-[#E2E8F0] text-[14px] text-[#2F3D50]">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent className="min-w-[245px]">
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              {EMPLOYEE_POSITIONS.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown Trạng thái (Status Filter matching Figma #777:13666) */}
        <div className="min-w-[170px] sm:w-[195px]">
          <Select
            value={selectedStatus || "ALL"}
            onValueChange={(val) => onStatusChange(val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="w-full h-[44px] px-3.5 rounded-[8px] border-[#E2E8F0] text-[14px] text-[#2F3D50]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent className="min-w-[195px]">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {EMPLOYEE_STATUSES.map((st) => (
                <SelectItem key={st.value} value={st.value}>
                  {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset filter button (nền trắng chữ đỏ, không đổi màu hover, kích thước dài hơn) */}
        {hasFilter && (
          <button
            type="button"
            onClick={handleResetFilter}
            className="h-[44px] px-5 min-w-[130px] bg-white border border-[#E2E8F0] active:scale-[0.98] text-[13px] font-semibold text-red-600 rounded-[8px] shadow-2xs transition-transform flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 text-red-600 stroke-[2.5]" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Primary Action Button matching Figma #1346:6513 (kéo dài thêm) */}
      <Button
        type="button"
        onClick={onAddNew}
        leftIcon={<Plus className="w-4 h-4" />}
        className="h-[44px] px-6 min-w-[165px] bg-[#064343] hover:bg-[#053737] text-white font-normal text-[14px] leading-[20px] tracking-[0.01em] rounded-[10px] shadow-sm inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0 transition-all active:scale-[0.98]"
      >
        Thêm nhân viên
      </Button>
    </div>
  );
}
