'use client';

import React from 'react';
import { Eye, Edit3, Trash2, Ban } from 'lucide-react';
import { EmptySearchState } from '@/components/shared';
import { formatVND, formatDate, formatPackageDuration } from '@/lib/utils/formatters';
import type { PackageSummary } from '@/types/package';

interface PackageTableProps {
  items: PackageSummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (pkg: PackageSummary) => void;
  onEdit: (pkg: PackageSummary) => void;
  onDiscontinue: (pkg: PackageSummary) => void;
  onDelete: (pkg: PackageSummary) => void;
  onClearFilter?: () => void;
}

export function PackageTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onDiscontinue,
  onDelete,
  onClearFilter,
}: PackageTableProps) {
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
      <table className="w-full text-left border-separate border-spacing-y-[2px] table-fixed">
        <thead>
          <tr className="bg-white">
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[5%]">
              STT
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[10%] after:h-[16px] after:bg-[#CDD5DF] w-[11%]">
              Mã gói
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[22%]">
              Tên gói tập
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[13%]">
              Giá niêm yết
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[11%]">
              Thời hạn
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[11%]">
              Check-in tối đa
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[10%]">
              Đang sử dụng
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[10%]">
              Trạng thái
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-center select-none whitespace-nowrap w-[9%]">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="text-[14px] leading-[18px]">
          {items.map((pkg, idx) => {
            const stt = (pageIndex - 1) * pageSize + idx + 1;
            const statusUpper = (pkg.status || '').toUpperCase();
            const isActive = statusUpper === 'ACTIVE';
            const isDiscontinued = statusUpper === 'DISCONTINUED';

            // Alternating row background: #F9FFE6 on odd, #F8F8F8 on even
            const rowBg = idx % 2 === 0 ? 'bg-[#F9FFE6]' : 'bg-[#F8F8F8]';

            return (
              <tr
                key={pkg.id}
                className={`${rowBg} transition-colors hover:brightness-[0.98] group`}
              >
                {/* 1. STT */}
                <td className="py-[11px] px-[12px] rounded-l-[6px] text-[#202939] font-normal">
                  {stt}
                </td>

                {/* 2. Mã gói */}
                <td className="py-[11px] px-[12px] text-[#064343] font-semibold tracking-tight">
                  {pkg.packageCode}
                </td>

                {/* 3. Tên gói tập & mô tả tóm tắt */}
                <td className="py-[11px] px-[12px]">
                  <div className="flex flex-col">
                    <span className="text-[#0A0A0A] font-medium truncate" title={pkg.name}>
                      {pkg.name}
                    </span>
                    {pkg.description && (
                      <span className="text-[12px] text-[#64748B] truncate max-w-[240px]">
                        {pkg.description}
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. Giá niêm yết */}
                <td className="py-[11px] px-[12px] text-[#064343] font-semibold">
                  {formatVND(pkg.price)}
                </td>

                {/* 5. Thời hạn */}
                <td className="py-[11px] px-[12px] text-[#202939] font-normal">
                  {formatPackageDuration(pkg.durationMonths, pkg.durationDays)}
                </td>

                {/* 6. Check-in tối đa */}
                <td className="py-[11px] px-[12px] text-[#202939] font-normal">
                  {pkg.maxCheckins ? `${pkg.maxCheckins} lượt` : 'Không giới hạn'}
                </td>

                {/* 7. Hội viên đang sử dụng */}
                <td className="py-[11px] px-[12px]">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                      pkg.activeMembersCount > 0
                        ? 'bg-[#E0F2FE] text-[#0369A1]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {pkg.activeMembersCount} hội viên
                  </span>
                </td>

                {/* 8. Trạng thái */}
                <td className="py-[11px] px-[12px]">
                  {isActive ? (
                    <span className="inline-flex items-center justify-center px-2.5 py-[4px] rounded-[6px] text-[13px] leading-[17px] font-medium bg-[#10B981] text-white">
                      Hoạt động
                    </span>
                  ) : isDiscontinued ? (
                    <span className="inline-flex items-center justify-center px-2.5 py-[4px] rounded-[6px] text-[13px] leading-[17px] font-medium bg-[#EF4444] text-white">
                      Ngừng KD
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center px-2.5 py-[4px] rounded-[6px] text-[13px] leading-[17px] font-medium bg-[#F59E0B] text-white">
                      Chưa kích hoạt
                    </span>
                  )}
                </td>

                {/* 9. Hành động */}
                <td className="py-2 px-[10px] rounded-r-[6px]">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* Xem chi tiết */}
                    <button
                      type="button"
                      onClick={() => onView(pkg)}
                      title="Xem chi tiết"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#064343] hover:bg-black/5 transition-colors cursor-pointer"
                      aria-label="Xem chi tiết"
                    >
                      <Eye className="w-[17px] h-[17px]" />
                    </button>

                    {/* Chỉnh sửa */}
                    <button
                      type="button"
                      onClick={() => onEdit(pkg)}
                      title="Chỉnh sửa gói tập"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#064343] hover:bg-black/5 transition-colors cursor-pointer"
                      aria-label="Chỉnh sửa gói tập"
                    >
                      <Edit3 className="w-[17px] h-[17px]" />
                    </button>

                    {/* Ngừng kinh doanh (chỉ hiển thị nếu chưa ngừng kinh doanh) */}
                    {!isDiscontinued && (
                      <button
                        type="button"
                        onClick={() => onDiscontinue(pkg)}
                        title="Ngừng kinh doanh gói tập"
                        className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#F59E0B] hover:text-[#D97706] hover:bg-amber-50 transition-colors cursor-pointer"
                        aria-label="Ngừng kinh doanh gói tập"
                      >
                        <Ban className="w-[17px] h-[17px]" />
                      </button>
                    )}

                    {/* Xóa */}
                    <button
                      type="button"
                      onClick={() => onDelete(pkg)}
                      title="Xóa gói tập"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#EF4444] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Xóa gói tập"
                    >
                      <Trash2 className="w-[17px] h-[17px]" />
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

export default PackageTable;

