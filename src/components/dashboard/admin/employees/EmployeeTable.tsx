"use client";

import React from "react";
import Image from "next/image";
import { Eye, Edit3, Trash2, User, AlertCircle } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media-url";
import type { EmployeeSummary } from "@/types/employee";

interface EmployeeTableProps {
  items: EmployeeSummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (emp: EmployeeSummary) => void;
  onEdit: (emp: EmployeeSummary) => void;
  onDelete: (emp: EmployeeSummary) => void;
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
    return (
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] p-12 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-1">
          Không tìm thấy nhân viên nào
        </h3>
        <p className="text-sm text-[#64748B] max-w-sm mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc vai trò, trạng
          thái.
        </p>
      </div>
    );
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

                {/* 7. Trạng thái (Badge chuẩn Figma 1346:6561 / 1346:6672) */}
                <td className="py-[11px] px-[10px]">
                  {isActive ? (
                    <span className="inline-flex items-center justify-center px-3 py-[5px] rounded-[6px] text-[14px] leading-[18px] font-normal bg-[#10B981] text-white">
                      Đang làm
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center px-3 py-[5px] rounded-[6px] text-[14px] leading-[18px] font-normal bg-[#64748B] text-white">
                      Đã nghỉ
                    </span>
                  )}
                </td>

                {/* 8. Hành động (3 Icon Buttons 28x28px chuẩn Figma 1346:6564) */}
                <td className="py-2 px-[10px] rounded-r-[6px]">
                  <div className="flex items-center justify-center gap-[10px]">
                    {/* Xem chi tiết */}
                    <button
                      type="button"
                      onClick={() => onView(emp)}
                      title="Xem chi tiết"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#064343] hover:bg-black/5 transition-colors cursor-pointer"
                      aria-label="Xem chi tiết"
                    >
                      <Eye className="w-[18px] h-[18px]" />
                    </button>

                    {/* Chỉnh sửa */}
                    <button
                      type="button"
                      onClick={() => onEdit(emp)}
                      title="Chỉnh sửa thông tin"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#064343] hover:bg-black/5 transition-colors cursor-pointer"
                      aria-label="Chỉnh sửa"
                    >
                      <Edit3 className="w-[18px] h-[18px]" />
                    </button>

                    {/* Xóa nhân viên */}
                    <button
                      type="button"
                      onClick={() => onDelete(emp)}
                      title="Xóa / Vô hiệu hóa"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Xóa nhân viên"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
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
