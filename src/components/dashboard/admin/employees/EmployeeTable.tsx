'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, Edit3, Trash2, User, AlertCircle } from 'lucide-react';
import type { EmployeeSummary } from '@/types/employee';

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
  const upper = (pos || '').toUpperCase().trim();
  switch (upper) {
    case 'TRAINER':
      return 'Trainer';
    case 'RECEPTIONIST':
      return 'Lễ tân';
    case 'ADMIN':
      return 'Quản trị viên';
    case 'MANAGER':
      return 'Quản lý';
    case 'STAFF':
      return 'Tạp vụ';
    default:
      return pos || 'Nhân viên';
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
              <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
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
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc vai trò, trạng thái.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/70 text-[#0A0A0A] text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-14">STT</th>
              <th className="py-3.5 px-4 w-28">Mã NV</th>
              <th className="py-3.5 px-4 min-w-[200px]">Họ & Tên</th>
              <th className="py-3.5 px-4 min-w-[130px]">Vai trò</th>
              <th className="py-3.5 px-4 min-w-[140px]">Số điện thoại</th>
              <th className="py-3.5 px-4 min-w-[190px]">Email</th>
              <th className="py-3.5 px-4 text-center w-32">Trạng thái</th>
              <th className="py-3.5 px-4 text-center w-36">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-sm text-[#202939]">
            {items.map((emp, idx) => {
              const stt = (pageIndex - 1) * pageSize + idx + 1;
              const isActive = (emp.employmentStatus || '').toUpperCase() === 'ACTIVE';

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-[#F9FFE6]/50 transition-colors duration-150 group"
                >
                  {/* 1. STT */}
                  <td className="py-3 px-4 text-center font-medium text-[#64748B]">
                    {stt}
                  </td>

                  {/* 2. Mã NV tách riêng ngay sau STT theo đúng yêu cầu */}
                  <td className="py-3 px-4 font-semibold text-[#064343]">
                    {emp.employeeCode}
                  </td>

                  {/* 3. Họ & Tên kèm Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                        {emp.avatarUrl ? (
                          <Image
                            src={emp.avatarUrl}
                            alt={emp.fullName}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <span className="font-bold text-xs text-[#064343]">
                            {emp.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-[#0F172A] truncate">
                        {emp.fullName}
                      </span>
                    </div>
                  </td>

                  {/* 4. Vai trò (Chỉ hiển thị tên vai trò) */}
                  <td className="py-3 px-4 font-normal text-[#202939]">
                    {formatPosition(emp.position)}
                  </td>

                  {/* 5. Số điện thoại */}
                  <td className="py-3 px-4 text-[#202939] font-mono text-xs">
                    {emp.phoneNumber || '—'}
                  </td>

                  {/* 6. Email */}
                  <td className="py-3 px-4 text-[#353945] font-mono text-xs truncate max-w-[220px]">
                    {emp.email}
                  </td>

                  {/* 7. Trạng thái (Badge theo Figma) */}
                  <td className="py-3 px-4 text-center">
                    {isActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#10B981] text-white shadow-2xs">
                        Đang làm
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#64748B] text-white shadow-2xs">
                        Đã nghỉ
                      </span>
                    )}
                  </td>

                  {/* 8. Hành động (3 Icon buttons theo Figma) */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Xem chi tiết */}
                      <button
                        type="button"
                        onClick={() => onView(emp)}
                        title="Xem chi tiết"
                        className="w-7 h-7 rounded-[6px] flex items-center justify-center text-slate-500 hover:text-[#064343] hover:bg-[#F0FDF4] transition-colors cursor-pointer"
                        aria-label="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Chỉnh sửa */}
                      <button
                        type="button"
                        onClick={() => onEdit(emp)}
                        title="Chỉnh sửa thông tin"
                        className="w-7 h-7 rounded-[6px] flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        aria-label="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Xóa nhân viên */}
                      <button
                        type="button"
                        onClick={() => onDelete(emp)}
                        title="Xóa / Vô hiệu hóa"
                        className="w-7 h-7 rounded-[6px] flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label="Xóa nhân viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
