'use client';

import React from 'react';
import { Textarea } from '@/components/ui';

interface CategoryDescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CategoryDescriptionSection({
  value,
  onChange,
  disabled = false,
}: CategoryDescriptionSectionProps) {
  return (
    <div className="bg-white">
      <div className="border-b border-[#F1F5F9] pb-2 mb-4">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          MÔ TẢ DANH MỤC
        </h4>
      </div>

      <div className="px-5 flex flex-col gap-1.5 min-w-0">
        <label className="text-[13px] font-medium text-[#202939]">
          Mô tả chi tiết danh mục
        </label>
        <Textarea
          rows={4}
          autoResize
          minHeight={110}
          maxLength={500}
          disabled={disabled}
          placeholder="Nhập mô tả"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default CategoryDescriptionSection;
