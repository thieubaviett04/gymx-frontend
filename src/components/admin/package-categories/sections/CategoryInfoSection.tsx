'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type {
  PackageCategoryFormData,
  PackageCategoryFormErrors,
  PackageCategoryStatus,
} from '@/types/packageCategory';

interface CategoryInfoSectionProps {
  formData: PackageCategoryFormData;
  errors: PackageCategoryFormErrors;
  isEdit?: boolean;
  onChangeField: <K extends keyof PackageCategoryFormData>(field: K, value: PackageCategoryFormData[K]) => void;
  onClearError?: (field: keyof PackageCategoryFormErrors) => void;
}

export function CategoryInfoSection({
  formData,
  errors,
  isEdit = false,
  onChangeField,
  onClearError,
}: CategoryInfoSectionProps) {
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onClearError?.('code');
    const rawVal = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    onChangeField('code', rawVal);
  };

  return (
    <div className="bg-white">
      <div className="border-b border-[#F1F5F9] pb-2 mb-4">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          THÔNG TIN DANH MỤC
        </h4>
      </div>

      <div className={`px-5 grid grid-cols-1 ${isEdit ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-x-6 gap-y-5`}>
        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError?.('code')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Mã danh mục <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={cn(
              'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center transition-colors border',
              isEdit
                ? 'bg-slate-100 border-slate-200'
                : errors.code
                ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <input
              type="text"
              disabled={isEdit}
              maxLength={20}
              placeholder="Nhập mã danh mục"
              value={formData.code}
              onFocus={() => onClearError?.('code')}
              onChange={handleCodeChange}
              className={`w-full bg-transparent text-[14px] outline-none placeholder:text-[#697586] ${
                isEdit ? 'text-slate-600 cursor-not-allowed' : 'text-[#202939]'
              }`}
            />
          </div>
          {errors.code && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.code}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError?.('name')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Tên danh mục <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={cn(
              'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center transition-colors border',
              errors.name
                ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <input
              type="text"
              maxLength={100}
              placeholder="Nhập tên danh mục"
              value={formData.name}
              onFocus={() => onClearError?.('name')}
              onChange={(e) => {
                onClearError?.('name');
                onChangeField('name', e.target.value);
              }}
              className="w-full bg-transparent text-[14px] text-[#202939] outline-none placeholder:text-[#697586]"
            />
          </div>
          {errors.name && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.name}
            </p>
          )}
        </div>

        {isEdit && (
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">
              Trạng thái hoạt động
            </label>
            <Select
              value={formData.status}
              onValueChange={(val) => onChangeField('status', val as PackageCategoryStatus)}
            >
              <SelectTrigger className="h-[42px] bg-slate-50 border-slate-200 text-[14px] text-[#202939] rounded-[8px]">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg">
                <SelectItem value="ACTIVE" className="text-[14px] py-2.5 cursor-pointer">
                  Đang hoạt động
                </SelectItem>
                <SelectItem value="INACTIVE" className="text-[14px] py-2.5 cursor-pointer">
                  Ngừng hoạt động
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryInfoSection;

