"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media-url";
import type { EmployeeDetail } from "@/types/employee";

interface EmployeeDetailDialogProps {
  isOpen: boolean;
  employee: EmployeeDetail | null;
  onClose: () => void;
  onEdit?: (emp: EmployeeDetail) => void;
}

/**
 * Format chức vụ sang nhãn hiển thị chuẩn
 */
function formatPosition(pos?: string | null): string {
  if (!pos) return "—";
  const upper = pos.toUpperCase().trim();
  switch (upper) {
    case "TRAINER":
      return "Trainers";
    case "RECEPTIONIST":
      return "Lễ tân";
    case "ADMIN":
      return "Quản trị viên";
    case "MANAGER":
      return "Quản lý";
    case "STAFF":
      return "Tạp vụ / Nhân viên";
    default:
      return pos;
  }
}

/**
 * Format ngày vào làm DD-MM-YYYY chuẩn Figma
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format mức lương theo định dạng 15.000.000 VND chuẩn Figma
 */
function formatSalary(val?: number | null): string {
  if (val === undefined || val === null) return "—";
  return new Intl.NumberFormat("vi-VN").format(val) + " VND";
}

/**
 * Field hiển thị thông tin dạng read-only chuẩn Figma #1376:10806
 */
function InfoField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-medium text-[#0A0A0A] leading-5">
        {label}
      </label>
      <div className="w-full bg-[#F5F5F5] opacity-80 border border-[#E5E5E5] rounded-[8px] px-3.5 py-3 min-h-[48px] flex items-center text-[14px] text-[#0A0A0A] break-words">
        {value || "—"}
      </div>
    </div>
  );
}

/**
 * EmployeeDetailDialog - Khung xem chi tiết nhân viên (Slide-over drawer chuẩn Figma #1376:10806)
 */
export function EmployeeDetailDialog({
  isOpen,
  employee,
  onClose,
  onEdit,
}: EmployeeDetailDialogProps) {
  // Lắng nghe phím ESC để đóng drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !employee) return null;

  const isActive =
    (employee.employmentStatus || "").toUpperCase() === "ACTIVE" ||
    (employee.employmentStatus || "").toUpperCase() === "HOAT_DONG";

  const isTrainer =
    employee.position?.toUpperCase() === "TRAINER" || !!employee.trainerInfo;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thông tin nhân viên"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Slide-over Container chuẩn kích thước 521px và boxShadow -12px 0 40px theo Figma #1376:10806 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[521px] max-w-full bg-white h-full shadow-[-12px_0px_40px_0px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* 1. Header (CardHeader #1376:10807) */}
        <div className="h-[70px] pr-6 pl-0 flex items-center justify-between shrink-0">
          {/* Thanh stroke 5px sát mép ngoài bên trái như thiết kế Figma */}
          <div className="flex items-center h-[34px] border-l-[5px] border-[#064343] pl-5">
            <h2 className="text-[16px] font-medium text-[#0A0A0A] leading-7">
              Thông tin nhân viên
            </h2>
          </div>

          {/* Nút đóng tròn 32x32px */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Phần Profile Tóm tắt (Avatar + Tên & Mã NV + Trạng thái) */}
        <div className="px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar tròn 60x60px */}
            <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] shrink-0 flex items-center justify-center">
              {employee.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getMediaUrl(employee.avatarUrl)}
                  alt={employee.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="font-semibold text-xl text-[#064343]">
                  {employee.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Tên & Mã NV */}
            <div className="min-w-0">
              <h3 className="text-[20px] font-semibold text-[#0A0A0A] leading-tight truncate">
                {employee.fullName}
              </h3>
              <p className="text-[16px] text-[#525252] font-normal mt-0.5">
                {employee.employeeCode}
              </p>
            </div>
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[14px] text-[#0A0A0A] font-normal">
              Trạng thái
            </span>
            <span
              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[6px] text-[12px] font-normal leading-tight ${
                isActive
                  ? "bg-[#22C55E] text-white"
                  : "bg-[#64748B] text-white"
              }`}
            >
              {isActive ? "Hoạt động" : "Đã nghỉ"}
            </span>
          </div>
        </div>

        {/* 3. Vùng nội dung cuộn (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
          <div className="space-y-3.5">
            <h4 className="text-[12px] font-semibold text-[#0A0A0A] tracking-[0.046em] uppercase">
              THÔNG TIN CƠ BẢN
            </h4>

            <div className="space-y-3">
              <InfoField label="Email" value={employee.email} />
              <InfoField label="Số CCCD" value={employee.nationalId} />
              <InfoField label="Số ĐT" value={employee.phoneNumber} />
              <InfoField label="Địa chỉ" value={employee.address} />
              <InfoField
                label="Chức vụ"
                value={formatPosition(employee.position)}
              />
              <InfoField
                label="Ngày vào làm"
                value={formatDate(employee.hiredAt)}
              />
              <InfoField
                label="Mức lương"
                value={formatSalary(employee.baseSalaryRate)}
              />
            </div>
          </div>

          {/* KHỐI 2: THÔNG TIN CHUYÊN MÔN (Nếu là HLV / Trainer) */}
          {isTrainer && (
            <div className="space-y-3.5 pt-2">
              <h4 className="text-[12px] font-semibold text-[#0A0A0A] tracking-[0.046em] uppercase">
                THÔNG TIN CHUYÊN MÔN
              </h4>

              <div className="space-y-3">
                <InfoField
                  label="Chuyên môn"
                  value={
                    employee.trainerInfo?.specializationName || "Gym Boxing"
                  }
                />
                <InfoField
                  label="Kinh nghiệm"
                  value={
                    employee.trainerInfo?.experienceYears
                      ? `${employee.trainerInfo.experienceYears} Năm kinh nghiệm`
                      : "4 Năm kinh nghiệm"
                  }
                />

                {/* Các thông tin chuyên môn bổ sung nếu có */}
                {employee.trainerInfo?.salaryCoefficient && (
                  <InfoField
                    label="Hệ số lương HLV"
                    value={`x${employee.trainerInfo.salaryCoefficient}`}
                  />
                )}
                {employee.trainerInfo?.ratingAvg !== undefined &&
                  employee.trainerInfo?.ratingAvg > 0 && (
                    <InfoField
                      label="Đánh giá HLV"
                      value={`${employee.trainerInfo.ratingAvg} / 5 (${
                        employee.trainerInfo.ratingCount || 0
                      } đánh giá)`}
                    />
                  )}
                {employee.trainerInfo?.description && (
                  <InfoField
                    label="Giới thiệu chuyên môn"
                    value={employee.trainerInfo.description}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer Actions chuẩn nét đứt dashed border và nút bấm Figma #1392:1029 */}
        <div className="p-6 border-t border-dashed border-[#E5E5E5] bg-white flex items-center justify-end gap-3.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] px-6 min-w-[100px] bg-white border border-[#E5E5E5] rounded-[8px] text-[15px] text-[#525252] hover:bg-[#F5F5F5] transition-colors cursor-pointer font-medium flex items-center justify-center"
          >
            Hủy
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="h-[42px] px-6 min-w-[160px] bg-[#064343] hover:bg-[#053737] rounded-[8px] text-[15px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.1)] transition-colors cursor-pointer font-medium flex items-center justify-center"
            >
              Sửa thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
