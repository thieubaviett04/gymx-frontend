'use client';

import React from 'react';
import {
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import type {
  PackageCategoryLookup,
  PackageFormData,
  PackageFormErrors,
  PackageFormStatus,
  PackageStatus,
} from '@/types/package';

interface PackageInfoSectionProps {
  formData: PackageFormData;
  errors: PackageFormErrors;
  categories: PackageCategoryLookup[];
  isEdit?: boolean;
  isPriceDurationDisabled?: boolean;
  isStatusDisabled?: boolean;
  onChangeField: <K extends keyof PackageFormData>(field: K, value: PackageFormData[K]) => void;
  onClearError?: (field: keyof PackageFormData) => void;
}

export function PackageInfoSection({
  formData,
  errors,
  categories,
  isEdit = false,
  isPriceDurationDisabled = false,
  isStatusDisabled = false,
  onChangeField,
  onClearError,
}: PackageInfoSectionProps) {
  const isDateDisabled =
    isPriceDurationDisabled ||
    formData.status === 'INACTIVE' ||
    formData.status === 'DISCONTINUED';

  return (
    <div className="bg-white">
      <div className="border-b border-[#F1F5F9] pb-2 mb-4">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          THÔNG TIN GÓI TẬP
        </h4>
      </div>

      <div className="px-5 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Tên gói tập <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
              errors.name
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChangeField('name', e.target.value)}
              placeholder="Nhập tên gói tập"
              maxLength={100}
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939]">
            Loại hình gói tập
          </label>
          <Select
            value={
              categories.find(
                (c) => c.id.toLowerCase() === (formData.categoryId || '').toLowerCase()
              )?.id || (formData.categoryId ? formData.categoryId : 'none')
            }
            onValueChange={(val) => onChangeField('categoryId', val === 'none' ? '' : val)}
          >
            <SelectTrigger
              className={`h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none data-[placeholder]:text-[#697586] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                errors.categoryId ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <SelectValue placeholder="Chọn loại hình gói tập" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Chưa phân loại</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className={`text-[13px] font-medium flex items-center gap-1 ${isPriceDurationDisabled ? 'text-[#94A3B8]' : 'text-[#202939]'}`}>
            Giá niêm yết <span className={isPriceDurationDisabled ? 'text-[#CBD5E1]' : 'text-[#EE0033]'}>*</span>
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 border rounded-[8px] flex items-center justify-between transition-all ${
              isPriceDurationDisabled
                ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 cursor-not-allowed select-none'
                : errors.price
                ? 'border-red-400 bg-red-50/20'
                : 'bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              type="number"
              min="0"
              step="1000"
              disabled={isPriceDurationDisabled}
              value={formData.price}
              onChange={(e) => onChangeField('price', e.target.value)}
              placeholder="Nhập giá niêm yết"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8]"
            />
            <div className="flex items-center gap-2 pl-2 select-none shrink-0">
              <div className="w-[1px] h-4 bg-[#CDD5DF]" />
              <span className={`text-[13px] font-semibold ${isPriceDurationDisabled ? 'text-[#94A3B8]' : 'text-[#064343]'}`}>
                VND
              </span>
            </div>
          </div>
          {errors.price && !isPriceDurationDisabled && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.price}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className={`text-[13px] font-medium flex items-center gap-1 ${isStatusDisabled ? 'text-[#94A3B8]' : 'text-[#202939]'}`}>
            Trạng thái <span className={isStatusDisabled ? 'text-[#CBD5E1]' : 'text-[#EE0033]'}>*</span>
          </label>
          <Select
            value={formData.status}
            disabled={isStatusDisabled}
            onValueChange={(val) => onChangeField('status', val as PackageFormStatus)}
          >
            <SelectTrigger
              disabled={isStatusDisabled}
              className={`h-[42px] w-full rounded-[8px] px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none ${
                isStatusDisabled
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 cursor-not-allowed text-[#94A3B8] select-none'
                  : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
              }`}
            >
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {!isEdit ? (
                <>
                  <SelectItem value="ACTIVE">Đang áp dụng</SelectItem>
                  <SelectItem value="PENDING">Chờ áp dụng</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="ACTIVE">Đang áp dụng</SelectItem>
                  <SelectItem value="PENDING">Chờ áp dụng</SelectItem>
                  <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                  <SelectItem value="DISCONTINUED">Ngừng áp dụng</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className={`text-[13px] font-medium flex items-center gap-1 ${isPriceDurationDisabled ? 'text-[#94A3B8]' : 'text-[#202939]'}`}>
            Thời hạn <span className={isPriceDurationDisabled ? 'text-[#CBD5E1]' : 'text-[#EE0033]'}>*</span>
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 border rounded-[8px] flex items-center justify-between transition-all ${
              isPriceDurationDisabled
                ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 cursor-not-allowed select-none'
                : errors.durationMonths
                ? 'border-red-400 bg-red-50/20'
                : 'bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              type="number"
              min="1"
              max="120"
              disabled={isPriceDurationDisabled}
              value={formData.durationMonths}
              onChange={(e) => onChangeField('durationMonths', e.target.value)}
              placeholder="Nhập thời hạn"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8]"
            />
            <div className="flex items-center gap-2 pl-2 select-none shrink-0">
              <div className="w-[1px] h-4 bg-[#CDD5DF]" />
              <span className={`text-[13px] font-semibold ${isPriceDurationDisabled ? 'text-[#94A3B8]' : 'text-[#064343]'}`}>
                tháng
              </span>
            </div>
          </div>
          {errors.durationMonths && !isPriceDurationDisabled && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.durationMonths}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className={`text-[13px] font-medium flex items-center gap-1 ${isDateDisabled ? 'text-[#94A3B8]' : 'text-[#202939]'}`}>
            Thời gian bắt đầu <span className={isDateDisabled ? 'text-[#CBD5E1]' : 'text-[#EE0033]'}>*</span>
          </label>
          <DatePicker
            value={formData.effectiveStartDate}
            disabled={isDateDisabled}
            onChange={(val) => onChangeField('effectiveStartDate', val)}
            onFocus={() => onClearError?.('effectiveStartDate')}
            hasError={Boolean(errors.effectiveStartDate)}
            error={errors.effectiveStartDate}
            placeholder="Chọn ngày bắt đầu"
            className={
              isDateDisabled
                ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 cursor-not-allowed select-none text-[#94A3B8]'
                : ''
            }
          />
          {errors.effectiveStartDate && !isDateDisabled && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5">
              {errors.effectiveStartDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackageInfoSection;

