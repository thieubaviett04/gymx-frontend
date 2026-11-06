'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Info } from 'lucide-react';
import { Badge } from '@/components/ui';
import { EditPencilIcon } from '@/components/ui/icons';
import {
  formatVND,
  formatDate,
  formatDateTime,
} from '@/lib/utils/formatters';
import type { PackageDetail, PackageSummary } from '@/types/package';

interface PackageDetailDialogProps {
  isOpen: boolean;
  packageData: PackageDetail | PackageSummary | null;
  onClose: () => void;
  onEdit?: (pkg: PackageDetail | PackageSummary) => void;
  onDiscontinue?: (pkg: PackageDetail | PackageSummary) => void;
}

function InfoItem({
  label,
  value,
  isHighlight = false,
  className = '',
}: {
  label: string;
  value?: React.ReactNode;
  isHighlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-[13px] font-medium text-[#64748B] leading-none">
        {label}
      </span>
      <div
        className={`text-[14px] leading-relaxed break-words ${
          isHighlight
            ? 'font-semibold text-[#064343]'
            : 'font-medium text-[#011010]'
        }`}
      >
        {value || '—'}
      </div>
    </div>
  );
}

export function PackageDetailDialog({
  isOpen,
  packageData,
  onClose,
  onEdit,
  onDiscontinue,
}: PackageDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'history'>('general');

  if (!isOpen || !packageData) return null;

  const status = (packageData.status || '').toUpperCase();
  const isActive = status === 'ACTIVE';
  const isDiscontinued = status === 'DISCONTINUED';

  const durationText = packageData.durationMonths
    ? `${packageData.durationMonths} tháng`
    : packageData.durationDays
    ? `${packageData.durationDays} ngày`
    : '—';

  const descriptionItems = (packageData.description || '')
    .split(/\r?\n/)
    .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean);

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
        className="w-full sm:w-[880px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Chi tiết gói tập
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-medium text-[#64748B]">Mã gói tập:</span>
              <span className="font-semibold text-[14px] text-[#064343]">
                {packageData.packageCode}
              </span>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={isActive ? 'active' : isDiscontinued ? 'discontinued' : 'inactive'}
                className="text-[13px] font-normal leading-[18px] px-3 py-[4px] rounded-[6px]"
              >
                {isActive
                  ? 'Đang hoạt động'
                  : isDiscontinued
                  ? 'Ngừng kinh doanh'
                  : 'Chưa kích hoạt'}
              </Badge>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex items-center gap-2 overflow-x-auto shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
            }`}
          >
            Thông tin chung
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
            }`}
          >
            Hội viên sử dụng
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
            }`}
          >
            Lịch sử
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-1 pb-8 space-y-8">
          {activeTab === 'general' && (
            <>
              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN GÓI TẬP
                  </h4>
                </div>

                <div className="pl-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-7 sm:gap-y-8">
                  <InfoItem label="Tên gói tập" value={packageData.name} />

                  <InfoItem
                    label="Giá niêm yết"
                    value={formatVND(packageData.price)}
                    isHighlight
                  />

                  <InfoItem
                    label="Thời hạn sử dụng"
                    value={durationText}
                  />

                  <InfoItem
                    label="Giới hạn check-in"
                    value={
                      packageData.maxCheckins
                        ? `${packageData.maxCheckins} lượt / chu kỳ`
                        : 'Không giới hạn'
                    }
                  />

                  <InfoItem
                    label="Ngày bắt đầu áp dụng"
                    value={formatDate(packageData.effectiveStartDate)}
                  />

                  <InfoItem
                    label="Ngày kết thúc áp dụng"
                    value={
                      packageData.effectiveEndDate
                        ? formatDate(packageData.effectiveEndDate)
                        : 'Vô thời hạn'
                    }
                  />

                  <InfoItem
                    label="Số hội viên đang dùng"
                    value={`${packageData.activeMembersCount} hội viên`}
                    isHighlight={packageData.activeMembersCount > 0}
                  />

                  <InfoItem
                    label="Ngày tạo gói"
                    value={formatDateTime(packageData.createdDate)}
                  />

                  <InfoItem
                    label="Cập nhật gần nhất"
                    value={
                      'lastModifiedDate' in packageData && packageData.lastModifiedDate
                        ? formatDateTime(packageData.lastModifiedDate)
                        : formatDateTime(packageData.createdDate)
                    }
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl pt-2">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    MÔ TẢ GÓI TẬP
                  </h4>
                </div>

                {descriptionItems.length > 0 ? (
                  <div className="pl-5">
                    <div className="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]">
                      <ul className="space-y-2">
                        {descriptionItems.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-[14px] text-[#202939] leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#064343] shrink-0 mt-2" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="pl-5">
                    <div className="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
                      <Info className="w-5 h-5 text-[#064343] shrink-0" />
                      <p className="text-[13px] text-[#64748B] leading-relaxed">
                        Chưa có mô tả chi tiết hoặc điều khoản bổ sung cho gói tập này.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'members' && (
            <div className="bg-white rounded-xl flex-1 flex flex-col">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  DANH SÁCH HỘI VIÊN ĐANG SỬ DỤNG
                </h4>
              </div>

              {packageData.activeMembersCount > 0 ? (
                <div className="pl-5 space-y-4">
                  <div className="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-medium text-[#64748B] block">
                        Số lượng hội viên hiện tại
                      </span>
                      <strong className="text-[24px] font-bold text-[#064343] block mt-0.5">
                        {packageData.activeMembersCount} hội viên
                      </strong>
                    </div>
                    <span className="text-[13px] text-[#525252]">
                      Thẻ hội viên còn hiệu lực sử dụng tại phòng tập.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full flex-1 flex flex-col items-center justify-center py-12 sm:py-16">
                  <img
                    src="/images/empty-rating.svg"
                    alt="Chưa có hội viên nào sử dụng gói tập này"
                    className="w-[104px] h-[121px] object-contain mb-4"
                  />
                  <p className="text-[15px] text-[#202939] font-medium text-center">
                    Chưa có hội viên nào sử dụng gói tập này
                  </p>
                  <p className="text-[13px] text-[#64748B] text-center mt-1">
                    Khi có hội viên đăng ký và kích hoạt thẻ, thông tin sẽ được cập nhật tự động tại đây.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl flex-1 flex flex-col">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  NHẬT KÝ THAY ĐỔI THÔNG TIN
                </h4>
              </div>

              {packageData.previousPackageCode ? (
                <div className="pl-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-7 sm:gap-y-8">
                    <InfoItem
                      label="Gói tiền nhiệm thay thế"
                      value={
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#064343]">
                          <span>{packageData.previousPackageCode}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#064343]" />
                        </span>
                      }
                    />

                    <InfoItem
                      label="Ngày khởi tạo phiên bản"
                      value={formatDateTime(packageData.createdDate)}
                    />

                    {'lastModifiedDate' in packageData && packageData.lastModifiedDate && (
                      <InfoItem
                        label="Cập nhật gần nhất"
                        value={formatDateTime(packageData.lastModifiedDate)}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full flex-1 flex flex-col items-center justify-center py-12 sm:py-16">
                  <img
                    src="/images/empty-rating.svg"
                    alt="Chưa có thay đổi nào gần đây"
                    className="w-[104px] h-[121px] object-contain mb-4"
                  />
                  <p className="text-[15px] text-[#202939] font-medium text-center">
                    Chưa có thay đổi nào gần đây
                  </p>
                  <p className="text-[13px] text-[#64748B] text-center mt-1">
                    Gói tập đang ở phiên bản ban đầu được tạo lúc {formatDateTime(packageData.createdDate)}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
          >
            <span>Đóng</span>
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(packageData);
              }}
              className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <EditPencilIcon className="w-4 h-4" color="#FFFFFF" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackageDetailDialog;
