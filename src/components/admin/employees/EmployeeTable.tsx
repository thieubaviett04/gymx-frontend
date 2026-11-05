"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { Badge, EyeViewIcon, EditPencilIcon, TrashBinIcon } from "@/components/ui";
import { getMediaUrl } from "@/lib/utils/media-url";
import type { EmployeeSummary } from "@/types/employee";
import { EmptySearchState } from "@/components/shared";

interface EmployeeTableProps {
  items: EmployeeSummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (emp: EmployeeSummary) => void;
  onEdit: (emp: EmployeeSummary) => void;
  onDelete: (emp: EmployeeSummary) => void;
  onClearFilter?: () => void;
}

/** Chuyển đổi mã Role sang nhãn tiếng Việt hiển thị */
function formatPosition(pos: string): string {
  const upper = (pos || "").toUpperCase().trim();
  switch (upper) {
    case "TRAINER":
      return "Trainer";
    case "RECEPTIONIST":
      return "Lễ tân";
    case "ADMIN":
      return "Quản trị viên";
    case "MANAGER":
      return "Quản lý";
    case "STAFF":
      return "Tạp vụ";
    default:
      return pos || "Nhân viên";
  }
}

export function EmployeeTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onDelete,
  onClearFilter,
}: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-8 space-y-4">
          <div className="h-6 bg-slate-100 rounded-md w-1/4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-50 rounded-lg animate-pulse"
              />
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
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[5%]">
              STT
            </th>
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[10%]">
              Mã NV
            </th>
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[23%]">
              Họ & Tên
            </th>
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[11%]">
              Vai trò
            </th>
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[14%]">
              Số điện thoại
            </th>
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[20%]">
              Email
            </th>
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] relative select-none whitespace-nowrap after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF] w-[9%]">
              Trạng thái
            </th>
            <th className="py-2 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-center select-none whitespace-nowrap w-[8%]">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="text-[14px] leading-[18px]">
          {items.map((emp, idx) => {
            const stt = (pageIndex - 1) * pageSize + idx + 1;
            const isActive =
              (emp.employmentStatus || '').toUpperCase() === 'ACTIVE';
            // Alternating row background: #F9FFE6 on odd (1st, 3rd, 5th), #F8F8F8 on even (2nd, 4th, 6th)
            const rowBg = idx % 2 === 0 ? 'bg-[#F9FFE6]' : 'bg-[#F8F8F8]';

            return (
              <tr
                key={emp.id}
                className={`${rowBg} transition-colors hover:brightness-[0.98] group`}
              >
                {/* 1. STT */}
                <td className="py-[11px] px-[10px] rounded-l-[6px] text-[#202939] font-normal">
                  {stt}
                </td>

                {/* 2. Mã NV tách riêng ngay sau STT theo chuẩn Figma */}
                <td className="py-[11px] px-[10px] text-[#064343] font-normal">
                  {emp.employeeCode}
                </td>

                {/* 3. Họ & Tên kèm Avatar 32x32px */}
                <td className="py-[11px] px-[10px]">
                  <div className="flex items-center gap-[10px]">
                    <div className="relative w-[32px] h-[32px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                      <span className="font-semibold text-xs text-[#064343]">
                        {emp.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                      {emp.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaUrl(emp.avatarUrl)}
                          alt={emp.fullName}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <span className="text-[#202939] font-normal truncate">
                      {emp.fullName}
                    </span>
                  </div>
                </td>

                {/* 4. Vai trò (Text chuẩn Figma 1346:6555) */}
                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  {formatPosition(emp.position)}
                </td>

                {/* 5. Số điện thoại */}
                <td className="py-[11px] px-[10px] text-[#202939] font-normal">
                  {emp.phoneNumber || '—'}
                </td>

                {/* 6. Email */}
                <td className="py-[11px] px-[10px] text-[#353945] font-normal truncate max-w-[220px]">
                  {emp.email}
                </td>

                {/* 7. Trạng thái (Badge chuẩn GymX Figma Node 1437:1446) */}
                <td className="py-[11px] px-[10px]">
                  {isActive ? (
                    <Badge variant="active">
                      Đang làm
                    </Badge>
                  ) : (
                    <Badge variant="discontinued">
                      Đã nghỉ
                    </Badge>
                  )}
                </td>

                {/* 8. Hành động (3 nút icon chuẩn Figma Node 1438:11026: #FFB800, #064343, #EE464C) */}
                <td className="py-2 px-[10px] rounded-r-[6px]">
                  <div className="flex items-center justify-center gap-[16px]">
                    {/* Xem chi tiết */}
                    <button
                      type="button"
                      onClick={() => onView(emp)}
                      title="Xem chi tiết"
                      className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
                      aria-label="Xem chi tiết"
                    >
                      <EyeViewIcon className="w-[20px] h-[20px]" color="#FFB800" />
                    </button>

                    {/* Chỉnh sửa */}
                    <button
                      type="button"
                      onClick={() => onEdit(emp)}
                      title="Chỉnh sửa thông tin"
                      className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
                      aria-label="Chỉnh sửa"
                    >
                      <EditPencilIcon className="w-[20px] h-[20px]" color="#064343" />
                    </button>

                    {/* Xóa nhân viên */}
                    <button
                      type="button"
                      onClick={() => onDelete(emp)}
                      title="Xóa / Vô hiệu hóa"
                      className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer"
                      aria-label="Xóa nhân viên"
                    >
                      <TrashBinIcon className="w-[20px] h-[20px]" color="#EE464C" />
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
