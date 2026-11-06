'use client';

import React from 'react';
import type { PackageDetail, PackageSummary } from '@/types/package';

interface PackageMembersTabProps {
  packageData: PackageDetail | PackageSummary;
}

export function PackageMembersTab({ packageData }: PackageMembersTabProps) {
  return (
    <div className="bg-white rounded-xl flex-1 flex flex-col">
      <div className="border-b border-[#F1F5F9] pb-2 mb-4">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          DANH SÁCH HỘI VIÊN ĐANG SỬ DỤNG
        </h4>
      </div>

      {packageData.activeMembersCount > 0 ? (
        <div className="px-5 space-y-4">
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
  );
}

export default PackageMembersTab;
