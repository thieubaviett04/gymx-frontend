'use client';

import React from 'react';
import Image from 'next/image';

export interface EmptySearchStateProps {
  title?: string;
  message?: string;
  onClearFilter?: () => void;
  clearFilterText?: string;
  className?: string;
}

/**
 * Component hiển thị trạng thái tìm kiếm / lọc không có kết quả theo Figma Node #1384:11325
 */
export function EmptySearchState({
  title = 'Không tìm thấy nhân viên nào',
  message = 'Hãy thử thay đổi từ khóa hoăc điều chỉnh bộ lọc',
  onClearFilter,
  clearFilterText = 'Xóa bộ lọc',
  className = '',
}: EmptySearchStateProps) {
  return (
    <div
      className={`w-full flex-1 min-h-[480px] flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
    >
      <div className="w-full max-w-[382px] flex flex-col items-center">
        {/* Hình minh họa SVG 160x160 Figma 1384:11327 */}
        <div className="w-[160px] h-[160px] relative flex items-center justify-center shrink-0 mb-[34px]">
          <Image
            src="/images/states/empty-search.svg"
            alt={title}
            width={160}
            height={160}
            priority
            className="w-[160px] h-auto object-contain"
          />
        </div>

        {/* Khung nội dung thông báo Figma 1384:11422 */}
        <div className="flex flex-col items-center gap-[6px] w-full">
          <h4 className="text-[20px] font-semibold text-[#000000] leading-[28px] tracking-[-0.005em]">
            {title}
          </h4>
          <p className="text-[16px] font-normal text-[#000000] leading-[28px]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmptySearchState;
