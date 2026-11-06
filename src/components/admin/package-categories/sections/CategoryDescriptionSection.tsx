'use client';

import React from 'react';

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
        <div className="relative">
          <textarea
            rows={5}
            maxLength={500}
            disabled={disabled}
            placeholder="Nhập mô tả"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full resize-none rounded-[8px] border px-3.5 pt-3 pb-8 text-[14px] text-[#202939] leading-relaxed outline-none transition-all placeholder:text-[#9EA5C0] ${
              disabled
                ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500'
                : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
            }`}
          />
          <span className="absolute bottom-2.5 right-3 text-[13px] text-[#9EA5C0] pointer-events-none select-none">
            {(value || '').length}/500
          </span>
        </div>
      </div>
    </div>
  );
}

export default CategoryDescriptionSection;
