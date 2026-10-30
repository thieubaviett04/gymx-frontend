"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  DollarSign,
  Award,
  Star,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media-url";
import type { EmployeeDetail } from "@/types/employee";

interface EmployeeDetailDialogProps {
  isOpen: boolean;
  employee: EmployeeDetail | null;
  onClose: () => void;
  onEdit?: (emp: EmployeeDetail) => void;
}

export function EmployeeDetailDialog({
  isOpen,
  employee,
  onClose,
  onEdit,
}: EmployeeDetailDialogProps) {
  const [showSalary, setShowSalary] = useState(false);

  if (!isOpen || !employee) return null;

  const isActive = (employee.employmentStatus || "").toUpperCase() === "ACTIVE";

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] bg-white rounded-xl border border-[#E2E8F0] shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Profile */}
        <div className="relative p-6 bg-gradient-to-r from-[#064343] to-[#0D6262] text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/60 shrink-0 flex items-center justify-center shadow-md">
              <span className="font-bold text-2xl text-white">
                {employee.fullName?.charAt(0)?.toUpperCase() || "U"}
              </span>
              {employee.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getMediaUrl(employee.avatarUrl)}
                  alt={employee.fullName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold truncate">
                  {employee.fullName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-white/20 text-white border border-white/30">
                  {employee.employeeCode}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                {employee.position}
              </p>
              <div className="mt-2">
                {isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#10B981] text-white">
                    Đang làm việc
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#64748B] text-white">
                    Đã nghỉ việc
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5 text-sm text-[#0F172A]">
          {/* Liên hệ & Hành chính */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]/70">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#064343] mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs text-[#64748B]">Email:</span>
                <span className="font-medium text-xs sm:text-sm">
                  {employee.email}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#064343] mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs text-[#64748B]">
                  Số điện thoại:
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  {employee.phoneNumber || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-[#064343] mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs text-[#64748B]">
                  Số CCCD / CMND:
                </span>
                <span className="font-medium font-mono text-xs sm:text-sm">
                  {employee.nationalId || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#064343] mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs text-[#64748B]">
                  Ngày vào làm:
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  {employee.hiredAt || "—"}
                </span>
              </div>
            </div>

            {employee.address && (
              <div className="sm:col-span-2 flex items-start gap-2.5 pt-1 border-t border-[#E2E8F0]/60">
                <MapPin className="w-4 h-4 text-[#064343] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs text-[#64748B]">Địa chỉ:</span>
                  <span className="font-medium text-xs sm:text-sm">
                    {employee.address}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Lương cơ bản */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between bg-white shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-[#64748B]">
                  Mức lương cơ bản
                </span>
                <span className="font-bold text-base text-[#0F172A]">
                  {showSalary
                    ? formatCurrency(employee.baseSalaryRate)
                    : "•••••••• VNĐ"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSalary(!showSalary)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title={showSalary ? "Ẩn mức lương" : "Hiện mức lương"}
            >
              {showSalary ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Thông tin HLV chuyên môn nếu có */}
          {employee.trainerInfo && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Hồ sơ huấn luyện viên (Trainer)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#64748B]">Chuyên môn:</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">
                    {employee.trainerInfo.specializationName ||
                      "Chưa phân loại"}
                  </p>
                </div>
                <div>
                  <span className="text-[#64748B]">Kinh nghiệm:</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">
                    {employee.trainerInfo.experienceYears} năm
                  </p>
                </div>
                <div>
                  <span className="text-[#64748B]">Hệ số lương:</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">
                    x{employee.trainerInfo.salaryCoefficient ?? 1.0}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="font-bold text-[#0F172A]">
                    {employee.trainerInfo.ratingAvg} / 5
                  </span>
                  <span className="text-[#64748B]">
                    ({employee.trainerInfo.ratingCount} đánh giá)
                  </span>
                </div>
              </div>

              {employee.trainerInfo.description && (
                <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">
                    Giới thiệu:{" "}
                  </span>
                  {employee.trainerInfo.description}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">
            Đã tạo: {new Date(employee.createdDate).toLocaleDateString("vi-VN")}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(employee);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#064343] hover:bg-[#053737] rounded-lg transition-colors cursor-pointer"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
