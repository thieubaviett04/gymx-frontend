'use client';

import React from 'react';
import { EmptySearchState } from '@/components/shared';
import { Badge, EditPencilIcon, EyeViewIcon, TrashBinIcon } from '@/components/ui';
import { formatDate } from '@/lib/utils/formatters';
import type { PackageCategorySummary } from '@/types/packageCategory';

interface CategoryTableProps {
  items: PackageCategorySummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (category: PackageCategorySummary) => void;
  onEdit: (category: PackageCategorySummary) => void;
  onDelete: (category: PackageCategorySummary) => void;
  onClearFilter?: () => void;
}

export function CategoryTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onDelete,
  onClearFilter,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-8 space-y-4">
          <div className="h-6 bg-slate-100 rounded-md w-1/4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptySearchState onClearFilter={onClearFilter} />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-[4px] table-fixed">
        <thead>
          <tr className="bg-white">
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[4%]">
              STT
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[11%]">
              Mã danh mục
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[16%]">
              Tên danh mục
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[18%]">
              Mô tả
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[10%]">
              Số gói
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[11%]">
              Trạng thái
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[10%]">
              Ngày tạo
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[10%]">
              Cập nhật
            </th>
            <th className="py-2.5 pl-[15px] pr-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-left select-none whitespace-nowrap w-[10%]">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="text-[14px] leading-[18px]">
          {items.map((cat, idx) => {
            const stt = (pageIndex - 1) * pageSize + idx + 1;
            const rowBg = 'bg-[#F0F5F5]';

            return (
              <tr
                key={cat.id}
                className={`${rowBg} transition-colors hover:bg-[#E3EDED] group`}
              >
                <td className="py-[11px] px-[10px] rounded-l-[6px] text-[#202939] font-normal">
                  {stt}
                </td>

                <td className="py-[11px] px-[10px] text-[#064343] font-normal">
                  <span className="text-[13px] font-medium">{cat.code}</span>
                </td>

                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  <button
                    type="button"
                    onClick={() => onView(cat)}
                    className="text-left font-normal text-[#202939] hover:underline cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </td>

                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  <span
                    className="line-clamp-1 block text-[13px] text-slate-600"
                    title={cat.description || undefined}
                  >
                    {cat.description || '—'}
                  </span>
                </td>

                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  {cat.packagesCount > 0 ? (
                    <span
                      title={`Có ${cat.packagesCount} gói tập đang thuộc danh mục này`}
                      className="text-[14px] text-[#202939] font-normal"
                    >
                      {cat.packagesCount} gói
                    </span>
                  ) : (
                    <span className="text-[14px] text-[#202939] font-normal">
                      0 gói
                    </span>
                  )}
                </td>

                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  <Badge
                    variant={cat.status === 'ACTIVE' ? 'active' : 'inactive'}
                    className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
                  >
                    {cat.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                </td>

                <td className="py-[11px] px-[10px] text-[#202939] font-normal text-[13px]">
                  {formatDate(cat.createdDate)}
                </td>

                <td className="py-[11px] px-[10px] text-[#202939] font-normal text-[13px]">
                  {formatDate(cat.lastModifiedDate) || '—'}
                </td>

                <td className="py-2 px-[10px] rounded-r-[6px]">
                  <div className="flex items-center gap-[10px]">
                    <button
                      type="button"
                      onClick={() => onView(cat)}
                      title="Xem chi tiết"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
                      aria-label="Xem chi tiết"
                    >
                      <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(cat)}
                      title="Chỉnh sửa thông tin"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
                      aria-label="Chỉnh sửa"
                    >
                      <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(cat)}
                      title="Xóa danh mục"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer"
                      aria-label="Xóa danh mục"
                    >
                      <TrashBinIcon className="w-[18px] h-[18px]" color="#EE464C" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;
