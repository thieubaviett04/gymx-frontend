'use client';

import React from 'react';
import { DatePicker } from '@/components/ui';
import type { EmployeeFormData, EmployeeFormErrors } from '@/types/employee';

interface ContactSalarySectionProps {
  formData: EmployeeFormData;
  errors: EmployeeFormErrors;
  onChangeField: <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => void;
  onClearFieldError?: (field: keyof EmployeeFormData) => void;
  isNationalIdDisabled?: boolean;
}

export function ContactSalarySection({
  formData,
  errors,
  onChangeField,
  onClearFieldError,
  isNationalIdDisabled = false,
}: ContactSalarySectionProps) {
  return (
    <div className="bg-white">
      <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          THÔNG TIN LIÊN LẠC &amp; LƯƠNG
        </h4>
      </div>

      <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
        {/* 1. Số điện thoại di động */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939]">
            Số điện thoại di động
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
              errors.phoneNumber
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                onChangeField('phoneNumber', e.target.value);
                onClearFieldError?.('phoneNumber');
              }}
              placeholder="Nhập số điện thoại"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.phoneNumber}
            </p>
          )}
        </div>

        {/* 2. Email công vụ (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Email công vụ <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
              errors.email
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                onChangeField('email', e.target.value);
                onClearFieldError?.('email');
              }}
              placeholder="Nhập email"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.email}
            </p>
          )}
        </div>

        {/* 3. Mức lương cơ bản (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Mức lương cơ bản <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-all ${
              errors.baseSalaryRate
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="baseSalaryRate"
              name="baseSalaryRate"
              type="number"
              min="0"
              step="500000"
              value={formData.baseSalaryRate}
              onChange={(e) => {
                onChangeField('baseSalaryRate', e.target.value);
                onClearFieldError?.('baseSalaryRate');
              }}
              placeholder="Nhập mức lương"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
            />
            <div className="flex items-center gap-2 pl-2 select-none">
              <div className="w-[1px] h-4 bg-[#CDD5DF]" />
              <span className="text-[13px] font-semibold text-[#064343]">VND</span>
            </div>
          </div>
          {errors.baseSalaryRate && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.baseSalaryRate}
            </p>
          )}
        </div>

        {/* 4. Địa chỉ thường trú (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Địa chỉ thường trú <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
              errors.address
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={(e) => {
                onChangeField('address', e.target.value);
                onClearFieldError?.('address');
              }}
              placeholder="Nhập địa chỉ thường trú"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
            />
          </div>
          {errors.address && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.address}
            </p>
          )}
        </div>

        {/* 5. Số CCCD (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Số CCCD {isNationalIdDisabled ? '(Cố định)' : <span className="text-[#EE0033]">*</span>}
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
              isNationalIdDisabled
                ? 'border-slate-200 cursor-not-allowed text-slate-500'
                : errors.nationalId
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="nationalId"
              name="nationalId"
              type="text"
              maxLength={12}
              disabled={isNationalIdDisabled}
              value={formData.nationalId}
              onChange={(e) => {
                onChangeField('nationalId', e.target.value.replace(/\D/g, ''));
                onClearFieldError?.('nationalId');
              }}
              placeholder={isNationalIdDisabled ? '' : 'Nhập 12 chữ số CCCD'}
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed"
            />
          </div>
          {errors.nationalId && !isNationalIdDisabled && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.nationalId}
            </p>
          )}
        </div>

        {/* 6. Ngày vào làm chính thức */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939]">
            Ngày vào làm chính thức
          </label>
          <DatePicker
            id="hiredAt"
            value={formData.hiredAt}
            onChange={(val) => onChangeField('hiredAt', val)}
            placeholder="Chọn ngày vào làm"
            className="h-[42px] w-full bg-slate-50 border-slate-200"
          />
        </div>
      </div>
    </div>
  );
}

