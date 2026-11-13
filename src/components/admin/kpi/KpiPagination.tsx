'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

interface KpiPaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  unitLabel?: string;
}

export function KpiPagination({
  pageIndex,
  pageSize,
  totalCount,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
  unitLabel = 'bản ghi',
}: KpiPaginationProps) {
  if (totalCount === 0) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxDisplayed = 5;

    if (totalPages <= maxDisplayed) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (pageIndex <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (pageIndex >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', pageIndex - 1, pageIndex, pageIndex + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="pt-4 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px]">
      <div className="flex items-center gap-2.5 text-[#2F3D50] text-[14px]">
        <span>Hiển thị</span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => onPageSizeChange(Number(val))}
        >
          <SelectTrigger className="w-[88px] h-[38px] px-3.5 bg-white border border-[#D0D5DD] rounded-[8px] text-[14px] font-normal text-[#2F3D50] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
            <SelectValue placeholder="Chọn số lượng" />
          </SelectTrigger>
          <SelectContent className="min-w-[88px]">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>
          trong tổng <strong className="font-semibold text-[#0F172A]">{totalCount}</strong> {unitLabel}
        </span>
      </div>

      <div className="inline-flex items-center -space-x-[1px]">
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(pageIndex - 1)}
          className="w-[40px] h-[40px] flex items-center justify-center rounded-l-[10px] border border-[#CDD5DF] bg-white text-[#2F3D50] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4 text-[#2F3D50]" />
        </button>

        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-[40px] h-[40px] flex items-center justify-center border border-[#CDD5DF] bg-white text-[#697586] text-[13px] select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(page);
          const isActive = pageNum === pageIndex;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-[40px] h-[40px] flex items-center justify-center border text-[13px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#064343] bg-[#064343] text-white z-10'
                  : 'border-[#CDD5DF] bg-white text-[#202939] hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(pageIndex + 1)}
          className="w-[40px] h-[40px] flex items-center justify-center rounded-r-[10px] border border-[#CDD5DF] bg-white text-[#2F3D50] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4 text-[#2F3D50]" />
        </button>
      </div>
    </div>
  );
}

export default KpiPagination;

