'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';
import type { PackageDetail, PackageSummary } from '@/types/package';

interface PackageHistoryTabProps {
  packageData: PackageDetail | PackageSummary;
}

function InfoItem({
  label,
  value,
  className = '',
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-[13px] font-medium text-[#64748B] leading-none">
        {label}
      </span>
      <div className="text-[14px] leading-relaxed break-words font-medium text-[#011010]">
        {value || '—'}
      </div>
    </div>
  );
}

export function PackageHistoryTab({ packageData }: PackageHistoryTabProps) {
  return (
    <div className="bg-white rounded-xl flex-1 flex flex-col">
      <div className="border-b border-[#F1F5F9] pb-2 mb-4">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          NHẬT KÝ THAY ĐỔI THÔNG TIN
        </h4>
      </div>

      {packageData.previousPackageCode ? (
        <div className="px-5 space-y-4">
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
  );
}

export default PackageHistoryTab;

