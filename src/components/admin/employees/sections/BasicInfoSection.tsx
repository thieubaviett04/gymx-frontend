'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DatePicker,
} from '@/components/ui';
import type { EmployeeFormData, EmployeeFormErrors } from '@/types/employee';
import { EMPLOYEE_POSITIONS } from '@/types/employee';

const GENDER_OPTIONS = [
  { value: 'NAM', label: 'Nam' },
  { value: 'NU', label: 'Nữ' },
  { value: 'KHAC', label: 'Khác' },
] as const;

interface BasicInfoSectionProps {
  formData: EmployeeFormData;
  errors: EmployeeFormErrors;
  onChangeField: <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => void;
  onClearFieldError?: (field: keyof EmployeeFormData) => void;
}

export function BasicInfoSection({
  formData,
  errors,
  onChangeField,
  onClearFieldError,
}: BasicInfoSectionProps) {
  return (
    <div className="bg-white">
      <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          THÔNG TIN CƠ BẢN
        </h4>
      </div>

      <div className="px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
        {/* 1. Họ và tên nhân viên (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Họ và tên nhân viên <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
              errors.fullName
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                onChangeField('fullName', e.target.value);
                onClearFieldError?.('fullName');
              }}
              placeholder="Nhập họ và tên"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* 2. Vai trò / Chức danh (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Vai trò <span className="text-[#EE0033]">*</span>
          </label>
          <Select
            value={formData.position}
            onValueChange={(val) => {
              onChangeField('position', val);
              onClearFieldError?.('position');
            }}
          >
            <SelectTrigger
              id="position"
              className={`h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                errors.position ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_POSITIONS.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.position && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.position}
            </p>
          )}
        </div>

        {/* 3. Giới tính */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939]">Giới tính</label>
          <Select
            value={formData.gender}
            onValueChange={(val) => onChangeField('gender', val)}
          >
            <SelectTrigger className="h-[42px] w-full rounded-[8px] border-slate-200 bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Ngày sinh */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939]">Ngày sinh</label>
          <DatePicker
            id="dateOfBirth"
            className="h-[42px] w-full bg-slate-50 border-slate-200"
            value={formData.dateOfBirth}
            onChange={(val) => onChangeField('dateOfBirth', val)}
            placeholder="Chọn ngày sinh"
          />
        </div>
      </div>
    </div>
  );
}

