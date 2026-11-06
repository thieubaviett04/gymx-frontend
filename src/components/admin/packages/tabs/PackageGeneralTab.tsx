'use client';

import React from 'react';
import {
  formatVND,
  formatDate,
  formatDateTime,
} from '@/lib/utils/formatters';
import type { PackageDetail, PackageSummary } from '@/types/package';

interface PackageGeneralTabProps {
  packageData: PackageDetail | PackageSummary;
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

export function PackageGeneralTab({ packageData }: PackageGeneralTabProps) {
  const durationText = packageData.durationMonths
    ? `${packageData.durationMonths} tháng`
    : packageData.durationDays
    ? `${packageData.durationDays} ngày`
    : '—';

  const hasDescription = Boolean(packageData.description && packageData.description.trim());

  return (
    <>
      <div className="bg-white rounded-xl">
        <div className="border-b border-[#F1F5F9] pb-2 mb-4">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            THÔNG TIN GÓI TẬP
          </h4>
        </div>

        <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-7 sm:gap-y-8">
          <InfoItem label="Tên gói tập" value={packageData.name} />

          <InfoItem
            label="Loại hình gói tập"
            value={packageData.categoryName || 'Chưa phân loại'}
          />

          <InfoItem
            label="Giá niêm yết"
            value={formatVND(packageData.price)}
            isHighlight
          />

          <InfoItem
            label="Mã gói tập"
            value={packageData.packageCode}
            isHighlight
          />

          <InfoItem
            label="Thời hạn"
            value={durationText}
          />

          <InfoItem
            label="Thời gian bắt đầu"
            value={formatDate(packageData.effectiveStartDate)}
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

        {hasDescription ? (
          <div className="px-5">
            <p className="text-[14px] text-[#202939] leading-relaxed whitespace-pre-line break-words">
              {packageData.description}
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-12 sm:py-14">
            <img
              src="/images/empty-rating.svg"
              alt="Chưa có mô tả chi tiết"
              className="w-[104px] h-[121px] object-contain mb-4"
            />
            <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
              Chưa có mô tả chi tiết cho gói tập này
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default PackageGeneralTab;
