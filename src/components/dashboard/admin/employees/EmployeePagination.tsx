'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EmployeePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function EmployeePagination({
  pageIndex,
  pageSize,
  totalCount,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
}: EmployeePaginationProps) {
  if (totalCount === 0) return null;

  // Tính toán dải số trang hiển thị
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 px-1 text-sm text-[#538D64]">
      {/* Phía trái: Hiển thị [X] trong tổng Y bản ghi matching Figma 1346:6805 */}
      <div className="flex items-center gap-2.5 text-[#2F3D50] text-sm">
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-[38px] px-3 py-1 bg-white border border-[#D0D5DD] rounded-lg text-sm font-medium text-[#2F3D50] shadow-2xs focus:outline-none focus:border-[#064343] cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>trong tổng <strong className="font-semibold text-[#0F172A]">{totalCount}</strong> bản ghi</span>
      </div>

      {/* Phía phải: Cụm nút chuyển trang matching Figma 1346:6815 */}
      <div className="inline-flex items-center -space-x-px rounded-lg shadow-2xs">
        {/* Nút Trước */}
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(pageIndex - 1)}
          className="h-10 px-3 flex items-center justify-center rounded-l-lg border border-[#CDD5DF] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Các số trang */}
        {getPageNumbers().map((p, i) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${i}`}
                className="h-10 px-3.5 flex items-center justify-center border-y border-[#CDD5DF] bg-white text-slate-400 text-sm select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === pageIndex;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`h-10 min-w-[40px] px-3 flex items-center justify-center border text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#064343] border-[#064343] text-white font-semibold z-10'
                  : 'bg-white border-[#CDD5DF] text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Nút Sau */}
        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(pageIndex + 1)}
          className="h-10 px-3 flex items-center justify-center rounded-r-lg border border-[#CDD5DF] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
