'use client';

import React from 'react';
import { Textarea } from '@/components/ui';

interface RuleDescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RuleDescriptionSection({
  value,
  onChange,
  disabled = false,
}: RuleDescriptionSectionProps) {
  return (
    <div className="bg-white">
      <div className="border-b border-[#F1F5F9] pb-2 mb-4">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          MÔ TẢ QUY ĐỊNH
        </h4>
      </div>

      <div className="px-5 flex flex-col gap-1.5 min-w-0">
        <label className="text-[13px] font-medium text-[#202939]">
          Nội dung / Mô tả quy định
        </label>
        <Textarea
          rows={4}
          autoResize
          minHeight={110}
          disabled={disabled}
          placeholder="Nhập nội dung quy định, gạch đầu dòng các hành vi vi phạm hoặc hướng dẫn xử phạt..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default RuleDescriptionSection;
