'use client';

import React from 'react';
import { X, Calendar, Clock, Users, ArrowRight, Ban } from 'lucide-react';
import { Button, Badge, EditPencilIcon } from '@/components/ui';
import {
  formatVND,
  formatDate,
  formatDateTime,
  formatPackageDuration,
} from '@/lib/utils/formatters';
import type { PackageDetail, PackageSummary } from '@/types/package';

interface PackageDetailDialogProps {
  isOpen: boolean;
  packageData: PackageDetail | PackageSummary | null;
  onClose: () => void;
  onEdit?: (pkg: PackageDetail | PackageSummary) => void;
  onDiscontinue?: (pkg: PackageDetail | PackageSummary) => void;
}

export function PackageDetailDialog({
  isOpen,
  packageData,
  onClose,
  onEdit,
  onDiscontinue,
}: PackageDetailDialogProps) {
  if (!isOpen || !packageData) return null;

  const status = (packageData.status || '').toUpperCase();
  const isActive = status === 'ACTIVE';
  const isDiscontinued = status === 'DISCONTINUED';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết gói tập"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[680px] max-w-full bg-white h-full shadow-[-12px_0px_40px_0px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header with border-l accent */}
        <div className="pt-6 pb-4 px-6 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#011010] leading-none">
                Chi tiết gói tập
              </h2>
              <span className="text-[12px] text-[#64748B] mt-0.5 block font-medium">
                Mã: {packageData.packageCode}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#064343] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng bảng chi tiết"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner Card: Name, Price, Status */}
          <div className="bg-gradient-to-r from-[#F0FDF4] to-[#F8FAFC] border border-[#DCFCE7] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[12px] font-semibold text-[#064343] tracking-wide uppercase">
                  {packageData.packageCode}
                </span>
                <h3 className="text-[20px] font-bold text-[#0F172A] mt-0.5">
                  {packageData.name}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[22px] font-extrabold text-[#064343]">
                  {formatVND(packageData.price)}
                </span>
                <div className="mt-1.5">
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
                </div>
              </div>
            </div>
          </div>

          {/* Thông số kỹ thuật & Quyền lợi */}
          <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <h4 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">
              Thông số vận hành
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div className="bg-slate-50 p-3.5 rounded-lg">
                <span className="text-[12px] text-[#64748B] block">Thời hạn sử dụng</span>
                <strong className="text-[#0F172A] font-semibold text-[15px]">
                  {formatPackageDuration(packageData.durationMonths, packageData.durationDays)}
                </strong>
                <span className="text-[12px] text-slate-500 block mt-0.5">
                  (~ {packageData.durationDays} ngày)
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg">
                <span className="text-[12px] text-[#64748B] block">Giới hạn check-in</span>
                <strong className="text-[#0F172A] font-semibold text-[15px]">
                  {packageData.maxCheckins ? `${packageData.maxCheckins} lượt` : 'Không giới hạn'}
                </strong>
                <span className="text-[12px] text-slate-500 block mt-0.5">
                  Suốt chu kỳ gói
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg">
                <span className="text-[12px] text-[#64748B] block flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#0369A1]" />
                  Hội viên đang sử dụng
                </span>
                <strong className="text-[#0369A1] font-semibold text-[15px]">
                  {packageData.activeMembersCount} hội viên
                </strong>
                <span className="text-[12px] text-slate-500 block mt-0.5">
                  Còn hạn thẻ hiện tại
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg">
                <span className="text-[12px] text-[#64748B] block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Hiệu lực áp dụng
                </span>
                <strong className="text-[#0F172A] font-semibold text-[14px]">
                  {formatDate(packageData.effectiveStartDate)}
                </strong>
                <span className="text-[12px] text-slate-500 block mt-0.5">
                  Đến: {packageData.effectiveEndDate ? formatDate(packageData.effectiveEndDate) : 'Vô thời hạn'}
                </span>
              </div>
            </div>
          </div>

          {/* Lịch sử phiên bản & Kế thừa */}
          <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-3">
            <h4 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#64748B]" />
              Lịch sử & Kế thừa
            </h4>
            <div className="text-[13px] space-y-2 text-[#334155]">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Gói tiền nhiệm thay thế:</span>
                <span className="font-semibold text-[#0F172A]">
                  {packageData.previousPackageCode ? (
                    <span className="inline-flex items-center gap-1 text-[#064343]">
                      <span>{packageData.previousPackageCode}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    'Không (Gói ban đầu)'
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Ngày khởi tạo:</span>
                <span className="font-medium text-[#0F172A]">
                  {formatDateTime(packageData.createdDate)}
                </span>
              </div>
              {'lastModifiedDate' in packageData && packageData.lastModifiedDate && (
                <div className="flex justify-between py-1.5">
                  <span className="text-[#64748B]">Cập nhật lần cuối:</span>
                  <span className="font-medium text-[#0F172A]">
                    {formatDateTime(packageData.lastModifiedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-2">
            <h4 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">
              Mô tả & Quyền lợi gói tập
            </h4>
            <p className="text-[14px] text-[#334155] leading-relaxed whitespace-pre-wrap">
              {packageData.description || 'Chưa có mô tả chi tiết cho gói tập này.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#F1F5F9] bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-[40px] px-5 border-[#E5E5E5] text-[#525252] hover:bg-white cursor-pointer"
          >
            Đóng
          </Button>

          {/* Nút Ngừng kinh doanh trong Detail view nếu chưa bị khóa */}
          {!isDiscontinued && onDiscontinue && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onDiscontinue(packageData);
              }}
              className="h-[40px] px-4 border-[#F37277] text-[#F37277] hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Ban className="w-4 h-4" />
              <span>Ngừng kinh doanh</span>
            </Button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(packageData);
              }}
              className="h-[40px] px-5 bg-[#064343] hover:bg-[#053737] rounded-[10px] text-white flex items-center gap-2 cursor-pointer font-normal text-[14px]"
            >
              <EditPencilIcon className="w-5 h-5" color="#FFFFFF" />
              <span>Chỉnh sửa gói tập</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackageDetailDialog;
