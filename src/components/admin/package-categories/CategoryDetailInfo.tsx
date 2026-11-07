'use client';

import React from 'react';
import { formatDate } from '@/lib/utils/formatters';
import type { PackageCategoryDetail, PackageCategorySummary } from '@/types/packageCategory';

interface CategoryDetailInfoProps {
  category: PackageCategorySummary | PackageCategoryDetail;
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

export function CategoryDetailInfo({ category }: CategoryDetailInfoProps) {
  const hasDescription = Boolean(category.description && category.description.trim());

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl">
        <div className="border-b border-[#F1F5F9] pb-2 mb-4">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            THÔNG TIN DANH MỤC
          </h4>
        </div>

        <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
          <InfoItem
            label="Mã danh mục"
            value={category.code}
            isHighlight
          />

          <InfoItem
            label="Tên danh mục"
            value={category.name}
          />

          <InfoItem
            label="Trạng thái"
            value={
              category.status === 'ACTIVE' ? (
                <span className="text-emerald-700 font-semibold">Đang hoạt động</span>
              ) : (
                <span className="text-slate-500 font-medium">Ngừng hoạt động</span>
              )
            }
          />

          <InfoItem
            label="Số gói tập liên kết"
            value={`${category.packagesCount} gói`}
            isHighlight={category.packagesCount > 0}
          />

          <InfoItem
            label="Ngày tạo"
            value={formatDate(category.createdDate)}
          />

          <InfoItem
            label="Cập nhật lần cuối"
            value={formatDate(category.lastModifiedDate) || 'Chưa cập nhật'}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl">
        <div className="border-b border-[#F1F5F9] pb-2 mb-4">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            MÔ TẢ DANH MỤC
          </h4>
        </div>

        {hasDescription ? (
          <div className="px-5">
            <p className="text-[14px] text-[#202939] leading-relaxed whitespace-pre-line break-words">
              {category.description}
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-10 sm:py-14">
            <img
              src="/images/empty-rating.svg"
              alt="Chưa có mô tả chi tiết"
              className="w-[104px] h-[121px] object-contain mb-4"
            />
            <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
              Chưa có mô tả chi tiết cho danh mục này
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryDetailInfo;
