'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import type { EmployeeFormData, EmployeeFormErrors } from '@/types/employee';
import { SPECIALIZATION_OPTIONS } from '@/types/employee';

interface TrainerExpertiseSectionProps {
  formData: EmployeeFormData;
  errors: EmployeeFormErrors;
  isTrainer: boolean;
  onChangeField: <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => void;
  onClearFieldError?: (field: keyof EmployeeFormData) => void;
}

export function TrainerExpertiseSection({
  formData,
  errors,
  isTrainer,
  onChangeField,
  onClearFieldError,
}: TrainerExpertiseSectionProps) {
  return (
    <div className="bg-white pb-2">
      <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          THÔNG TIN CHUYÊN MÔN HLV
        </h4>
      </div>

      <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
        {/* 1. Chuyên môn (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Chuyên môn {isTrainer && <span className="text-[#EE0033]">*</span>}
          </label>
          <Select
            value={formData.specializationId}
            onValueChange={(val) => {
              onChangeField('specializationId', val);
              onClearFieldError?.('specializationId');
            }}
            disabled={!isTrainer}
          >
            <SelectTrigger
              id="specializationId"
              className={`h-[42px] w-full rounded-[8px] bg-slate-50 border border-slate-200 px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none transition-all focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] disabled:opacity-100 disabled:cursor-not-allowed ${
                errors.specializationId ? 'border-red-400 bg-red-50/20' : ''
              }`}
            >
              <SelectValue placeholder="Chọn chuyên môn" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATION_OPTIONS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.specializationId && isTrainer && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.specializationId}
            </p>
          )}
        </div>

        {/* 2. Số năm kinh nghiệm (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Số năm kinh nghiệm {isTrainer && <span className="text-[#EE0033]">*</span>}
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 rounded-[8px] bg-slate-50 border border-slate-200 flex items-center transition-all ${
              errors.experienceYears
                ? 'border-red-400 bg-red-50/20'
                : 'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min="1"
              disabled={!isTrainer}
              placeholder="Nhập số năm"
              value={formData.experienceYears}
              onChange={(e) => {
                onChangeField('experienceYears', e.target.value);
                onClearFieldError?.('experienceYears');
              }}
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed"
            />
            <span className="text-[13px] text-[#064343] font-semibold pl-2 select-none">
              năm
            </span>
          </div>
          {errors.experienceYears && isTrainer && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.experienceYears}
            </p>
          )}
        </div>

        {/* 3. Giá 1 buổi tập (*) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Giá 1 buổi tập {isTrainer && <span className="text-[#EE0033]">*</span>}
          </label>
          <div
            className={`h-[42px] px-3.5 py-2 rounded-[8px] bg-slate-50 border border-slate-200 flex items-center transition-all ${
              errors.pricePerSession
                ? 'border-red-400 bg-red-50/20'
                : 'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            }`}
          >
            <input
              id="pricePerSession"
              name="pricePerSession"
              type="number"
              step="10000"
              min="0"
              disabled={!isTrainer}
              placeholder="Ví dụ: 200000"
              value={formData.pricePerSession}
              onChange={(e) => {
                onChangeField('pricePerSession', e.target.value);
                onClearFieldError?.('pricePerSession');
              }}
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed"
            />
            <span className="text-[13px] text-[#064343] font-semibold pl-2 select-none">
              ₫
            </span>
          </div>
          {errors.pricePerSession && isTrainer && (
            <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
              {errors.pricePerSession}
            </p>
          )}
        </div>
      </div>

      {/* Ghi chú */}
      <div className="px-5 mt-5 flex flex-col gap-1.5 min-w-0">
        <label className="text-[13px] font-medium text-[#202939]">Ghi chú</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          disabled={!isTrainer}
          placeholder="Nhập ghi chú"
          value={formData.description}
          onChange={(e) => onChangeField('description', e.target.value)}
          className="w-full p-3.5 rounded-[8px] text-[14px] bg-slate-50 border border-slate-200 text-[#202939] placeholder:text-[#697586] outline-none transition-all resize-none min-h-[96px] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

