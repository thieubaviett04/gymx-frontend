"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

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
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (pageIndex >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          pageIndex - 1,
          pageIndex,
          pageIndex + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  return (
    <div className="pt-5 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px]">
      {/* Phía trái: Hiển thị [X] trong tổng Y bản ghi matching Figma 1346:6805 */}
      <div className="flex items-center gap-2.5 text-[#2F3D50] text-[14px]">
        <span>Hiển thị</span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => onPageSizeChange(Number(val))}
        >
          <SelectTrigger className="w-[88px] h-[38px] px-3.5 bg-white border border-[#D0D5DD] rounded-[8px] text-[14px] font-normal text-[#2F3D50] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] data-[state=open]:border-[#064343] data-[state=open]:ring-1 data-[state=open]:ring-[#064343] cursor-pointer [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-[#064343] [&>svg]:stroke-[2.2]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[88px]">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>
          trong tổng{' '}
          <strong className="font-semibold text-[#0F172A]">{totalCount}</strong>{' '}
          bản ghi
        </span>
      </div>

      {/* Phía phải: Cụm nút chuyển trang matching Figma 1346:6815 */}
      <div className="inline-flex items-center -space-x-[1px]">
        {/* Nút Trước (Figma 1346:6816) */}
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(pageIndex - 1)}
          className="w-[40px] h-[40px] flex items-center justify-center rounded-l-[16px] border border-[#CDD5DF] bg-white text-[#2F3D50] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4 text-[#2F3D50]" />
        </button>

        {/* Các số trang */}
        {getPageNumbers().map((p, i) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${i}`}
                className="w-[40px] h-[40px] flex items-center justify-center border-y border-[#CDD5DF] bg-white text-slate-400 text-[14px] select-none"
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
              className={`w-[40px] h-[40px] flex items-center justify-center border text-[14px] leading-[20px] transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#064343] border-[#D0D5DD] text-white font-normal z-10'
                  : 'bg-white border-[#CDD5DF] text-[#2F3D50] font-normal hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Nút Sau (Figma 1346:6822) */}
        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(pageIndex + 1)}
          className="w-[40px] h-[40px] flex items-center justify-center rounded-r-[16px] border border-[#CDD5DF] bg-white text-[#2F3D50] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4 text-[#2F3D50]" />
        </button>
      </div>
    </div>
  );
}
