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
import { PrinterIcon, TrashBinIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import {
  PENALTY_RULE_SEVERITY_LABELS,
  PENALTY_RULE_STATUS_LABELS,
  RULE_AUDIENCE_LABELS,
} from '@/types/penaltyRule';

interface RuleToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedAudience: string;
  onAudienceChange: (audience: string) => void;
  selectedSeverity: string;
  onSeverityChange: (severity: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onAddNew: () => void;
  onPrintPreview: () => void;
}

export function RuleToolbar({
  searchValue,
  onSearchChange,
  selectedAudience,
  onAudienceChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange,
  onAddNew,
  onPrintPreview,
}: RuleToolbarProps) {
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
    (selectedAudience && selectedAudience !== 'ALL') ||
    (selectedSeverity && selectedSeverity !== 'ALL') ||
    (selectedStatus && selectedStatus !== 'ALL');

  const handleResetFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onAudienceChange('ALL');
    onSeverityChange('ALL');
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
            placeholder="Tìm theo mã hoặc tên quy định..."
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

        <div className="w-full sm:w-[175px]">
          <Select value={selectedAudience} onValueChange={onAudienceChange}>
            <SelectTrigger className="w-full h-[48px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] data-[state=open]:ring-2 data-[state=open]:ring-[#064343]/20 cursor-pointer">
              <SelectValue placeholder="Tất cả đối tượng" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[195px]">
              <SelectItem value="ALL" className="text-[14px] py-2.5 cursor-pointer">
                Tất cả đối tượng
              </SelectItem>
              <SelectItem value="GENERAL" className="text-[14px] py-2.5 cursor-pointer">
                {RULE_AUDIENCE_LABELS.GENERAL}
              </SelectItem>
              <SelectItem value="MEMBER" className="text-[14px] py-2.5 cursor-pointer">
                {RULE_AUDIENCE_LABELS.MEMBER}
              </SelectItem>
              <SelectItem value="STAFF" className="text-[14px] py-2.5 cursor-pointer">
                {RULE_AUDIENCE_LABELS.STAFF}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[165px]">
          <Select value={selectedSeverity} onValueChange={onSeverityChange}>
            <SelectTrigger className="w-full h-[48px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] data-[state=open]:ring-2 data-[state=open]:ring-[#064343]/20 cursor-pointer">
              <SelectValue placeholder="Tất cả mức độ" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[185px]">
              <SelectItem value="ALL" className="text-[14px] py-2.5 cursor-pointer">
                Tất cả mức độ
              </SelectItem>
              <SelectItem value="LOW" className="text-[14px] py-2.5 cursor-pointer">
                {PENALTY_RULE_SEVERITY_LABELS.LOW}
              </SelectItem>
              <SelectItem value="MEDIUM" className="text-[14px] py-2.5 cursor-pointer">
                {PENALTY_RULE_SEVERITY_LABELS.MEDIUM}
              </SelectItem>
              <SelectItem value="HIGH" className="text-[14px] py-2.5 cursor-pointer">
                {PENALTY_RULE_SEVERITY_LABELS.HIGH}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[180px]">
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full h-[48px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/20 data-[state=open]:border-[#064343] data-[state=open]:ring-2 data-[state=open]:ring-[#064343]/20 cursor-pointer">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[195px]">
              <SelectItem value="ALL" className="text-[14px] py-2.5 cursor-pointer">
                Tất cả trạng thái
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-[14px] py-2.5 cursor-pointer">
                {PENALTY_RULE_STATUS_LABELS.ACTIVE}
              </SelectItem>
              <SelectItem value="PENDING" className="text-[14px] py-2.5 cursor-pointer">
                {PENALTY_RULE_STATUS_LABELS.PENDING}
              </SelectItem>
              <SelectItem value="INACTIVE" className="text-[14px] py-2.5 cursor-pointer">
                {PENALTY_RULE_STATUS_LABELS.INACTIVE}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-[48px] px-5 min-w-[130px] bg-white border border-[#E2E8F0] active:scale-[0.98] text-[14px] font-normal leading-[20px] text-[#EE464C] rounded-[8px] shadow-2xs transition-transform flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <TrashBinIcon className="w-4 h-4 text-[#EE464C]" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end xl:self-auto">
        <button
          type="button"
          onClick={onPrintPreview}
          className="h-[48px] px-5 min-w-[145px] bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#202939] font-medium text-[14px] leading-[20px] rounded-[10px] shadow-2xs transition-all inline-flex flex-row items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <PrinterIcon size={20} color="#064343" className="w-5 h-5 shrink-0" />
          <span>In nội quy</span>
        </button>

        <button
          type="button"
          onClick={onAddNew}
          className="h-[48px] px-6 min-w-[165px] bg-[#064343] hover:bg-[#053737] text-white font-medium text-[14px] leading-[20px] tracking-[0.01em] rounded-[10px] shadow-2xs transition-all inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 text-white" />
          <span>Thêm quy định</span>
        </button>
      </div>
    </div>
  );
}

export default RuleToolbar;
