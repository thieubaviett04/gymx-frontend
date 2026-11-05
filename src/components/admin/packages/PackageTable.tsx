'use client';

import React from 'react';
import { EmptySearchState } from '@/components/shared';
import { Badge, EditPencilIcon, EyeViewIcon, TrashBinIcon } from '@/components/ui';
import { formatVND, formatPackageDuration } from '@/lib/utils/formatters';
import type { PackageSummary } from '@/types/package';

interface PackageTableProps {
  items: PackageSummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (pkg: PackageSummary) => void;
  onEdit: (pkg: PackageSummary) => void;
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
      <table className="w-full text-left border-separate border-spacing-y-[4px] table-fixed">
        <thead>
          <tr className="bg-white">
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[5%]">
              STT
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[10%]">
              Mã gói
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[20%]">
              Tên gói tập
            </th>
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[12%]">
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
            <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-center select-none whitespace-nowrap w-[11%]">
              <div className="flex items-center justify-center w-full">Hành động</div>
            </th>
          </tr>
        </thead>
        <tbody className="text-[14px] leading-[18px]">
          {items.map((pkg, idx) => {
            const stt = (pageIndex - 1) * pageSize + idx + 1;
            const statusUpper = (pkg.status || '').toUpperCase();
            const isActive = statusUpper === 'ACTIVE';
            const isDiscontinued = statusUpper === 'DISCONTINUED';

            // Row background: #F0F5F5 (soft primary teal tint) đồng nhất cho tất cả các dòng
            const rowBg = 'bg-[#F0F5F5]';

            return (
              <tr
                key={pkg.id}
                className={`${rowBg} transition-colors hover:bg-[#E3EDED] group`}
              >
                {/* 1. STT */}
                <td className="py-[11px] px-[10px] rounded-l-[6px] text-[#202939] font-normal">
                  {stt}
                </td>

                {/* 2. Mã gói (dùng chung font thông thường như các cột khác) */}
                <td className="py-[11px] px-[10px] text-[#064343] font-normal">
                  <span>{pkg.packageCode}</span>
                  {pkg.previousPackageCode && (
                    <span className="block text-[11px] text-[#64748B]">
                      Thay {pkg.previousPackageCode}
                    </span>
                  )}
                </td>

                {/* 3. Tên gói tập (chỉ hiển thị tên gói tập, không mô tả) */}
                <td className="py-[11px] px-[10px] text-[#202939] font-normal truncate max-w-[260px]" title={pkg.name}>
                  {pkg.name}
                </td>

                {/* 4. Giá niêm yết */}
                <td className="py-[11px] px-[10px] text-[#064343] font-normal">
                  {formatVND(pkg.price)}
                </td>

                {/* 5. Thời hạn */}
                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  {formatPackageDuration(pkg.durationMonths, pkg.durationDays)}
                </td>

                {/* 6. Check-in tối đa */}
                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  {pkg.maxCheckins ? `${pkg.maxCheckins} lượt` : 'Không giới hạn'}
                </td>

                {/* 7. Hội viên đang sử dụng (text thông thường, không dùng badge) */}
                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  {pkg.activeMembersCount} hội viên
                </td>

                {/* 8. Trạng thái (3 màu chuẩn Figma Node 1437:1446) */}
                <td className="py-[11px] px-[10px]">
                  {isActive ? (
                    <Badge variant="active">
                      Hoạt động
                    </Badge>
                  ) : isDiscontinued ? (
                    <Badge variant="discontinued">
                      Đang khóa
                    </Badge>
                  ) : (
                    <Badge variant="inactive">
                      Chưa kích hoạt
                    </Badge>
                  )}
                </td>

                {/* 9. Hành động (căn chỉnh cân đối chuẩn giữa với tiêu đề "Hành động") */}
                <td className="py-2 px-[10px] rounded-r-[6px] text-center">
                  <div className="flex items-center justify-center gap-[10px] w-full">
                    {/* Xem chi tiết (Eye màu #FFB800) */}
                    <button
                      type="button"
                      onClick={() => onView(pkg)}
                      title="Xem chi tiết"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
                      aria-label="Xem chi tiết"
                    >
                      <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
                    </button>

                    {/* Chỉnh sửa (Figma Node 1440:11107 edit-pencil màu #064343) */}
                    <button
                      type="button"
                      onClick={() => onEdit(pkg)}
                      title="Chỉnh sửa thông tin"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
                      aria-label="Chỉnh sửa"
                    >
                      <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
                    </button>

                    {/* Xóa gói tập (Figma Node 1438:11028 trash màu #EE464C) */}
                    <button
                      type="button"
                      onClick={() => onDelete(pkg)}
                      title="Xóa gói tập"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer"
                      aria-label="Xóa gói tập"
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

export default PackageTable;
