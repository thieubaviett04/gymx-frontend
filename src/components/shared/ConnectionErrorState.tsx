'use client';

import React from 'react';
import Image from 'next/image';

export interface ConnectionErrorStateProps {
  title?: string;
  message?: string;
  retryText?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Component hiển thị trạng thái lỗi mạng / mất kết nối BE theo Figma Node #1382:11034
 */
export function ConnectionErrorState({
  title = 'Lỗi kết nối',
  message = 'Không thể tải danh sách nhân viên hãy tải lại trang',
  retryText = 'Tải lại trang',
  onRetry,
  className = '',
}: ConnectionErrorStateProps) {
  return (
    <div
      className={`w-full flex-1 min-h-[480px] flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
    >
      <div className="w-full max-w-[382px] flex flex-col items-center">
        {/* Hình minh họa SVG 160x160 Figma 1382:11036 */}
        <div className="w-[160px] h-[160px] relative flex items-center justify-center shrink-0 mb-[34px]">
          <Image
            src="/images/states/error-connection.svg"
            alt={title}
            width={160}
            height={160}
            priority
            className="w-[160px] h-auto object-contain"
          />
        </div>

        {/* Khung nội dung thông báo + Nút hành động Figma 1382:11073 */}
        <div className="flex flex-col items-center gap-[28px] w-full">
          {/* Thông báo văn bản Figma 1384:11418 */}
          <div className="flex flex-col items-center gap-[6px] w-full">
            <h4 className="text-[20px] font-semibold text-[#000000] leading-[28px] tracking-[-0.005em]">
              {title}
            </h4>
            <p className="text-[16px] font-normal text-[#000000] leading-[28px]">
              {message}
            </p>
          </div>

          {/* Nút hành động Figma 1382:11075 */}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="h-[36px] w-[129px] px-4 py-2 bg-[#064343] hover:bg-[#053737] active:scale-[0.98] text-white text-[14px] font-normal leading-[24px] rounded-[8px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all cursor-pointer inline-flex items-center justify-center"
            >
              <span>{retryText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectionErrorState;
