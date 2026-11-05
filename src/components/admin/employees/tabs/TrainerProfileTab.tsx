'use client';

import React from 'react';
import { User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import type { EmployeeDetailTabProps } from '@/types/employee';
import { SPECIALIZATION_OPTIONS } from '@/types/employee';
import { formatPosition, getSpecializationName } from '@/lib/utils';
import { EmployeeTabEmptyState } from './EmployeeTabEmptyState';

export function TrainerProfileTab({
  employee,
  isEditing,
  formData,
  errors,
  onChangeField,
  onClearFieldError,
}: EmployeeDetailTabProps) {
  const currentPosition = isEditing ? formData.position : employee?.position;
  const isTrainer =
    (currentPosition || '').toUpperCase() === 'TRAINER' || !!employee?.trainerInfo;

  if (!isTrainer) {
    return (
      <div className="p-8 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-[10px] text-center flex flex-col items-center justify-center gap-2">
        <User className="w-8 h-8 text-[#94A3B8]" />
        <p className="text-[14px] text-[#64748B]">
          Nhân viên thuộc chức vụ{' '}
          <strong className="text-[#202939]">{formatPosition(employee.position)}</strong>.
        </p>
        <p className="text-[13px] text-[#94A3B8]">
          Mục Chuyên môn &amp; Đánh giá chỉ áp dụng cho bộ phận Huấn luyện viên (Trainer).
        </p>
      </div>
    );
  }

  const ratingAvg = employee.trainerInfo?.ratingAvg ?? 4.9;
  const ratingPercent = Math.min(100, Math.max(0, (ratingAvg / 5) * 100));

  return (
    <div className="flex flex-col space-y-8">
      {/* ── KHỐI 1: HỒ SƠ HLV ── */}
      <div className="bg-white">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            HỒ SƠ HLV
          </h4>
        </div>

        <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          {/* 1. Chuyên môn */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Chuyên môn {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <Select
                value={formData.specializationId}
                onValueChange={(val) => {
                  onChangeField('specializationId', val);
                  onClearFieldError?.('specializationId');
                }}
              >
                <SelectTrigger className="h-[42px] w-full rounded-[8px] border-slate-200 bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
                  <SelectValue placeholder="Chọn chuyên môn" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939] truncate">
                {getSpecializationName(
                  employee.trainerInfo?.specializationId,
                  employee.trainerInfo?.specializationName
                )}
              </div>
            )}
            {errors.specializationId && (
              <p className="text-xs text-red-500 mt-0.5">{errors.specializationId}</p>
            )}
          </div>

          {/* 2. Số năm kinh nghiệm */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Số năm kinh nghiệm {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <div
                className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center ${
                  errors.experienceYears
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                }`}
              >
                <input
                  type="number"
                  min="1"
                  value={formData.experienceYears}
                  onChange={(e) => {
                    onChangeField('experienceYears', e.target.value);
                    onClearFieldError?.('experienceYears');
                  }}
                  placeholder="Số năm kinh nghiệm"
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                />
                <span className="text-[13px] text-[#064343] font-semibold pl-2 select-none">
                  năm
                </span>
              </div>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939] truncate">
                {employee.trainerInfo?.experienceYears !== undefined &&
                employee.trainerInfo?.experienceYears !== null
                  ? `${employee.trainerInfo.experienceYears} năm`
                  : '—'}
              </div>
            )}
            {errors.experienceYears && (
              <p className="text-xs text-red-500 mt-0.5">{errors.experienceYears}</p>
            )}
          </div>

          {/* 3. Giá buổi tập */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Giá buổi tập {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <div
                className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-all ${
                  errors.pricePerSession
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                }`}
              >
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.pricePerSession}
                  onChange={(e) => {
                    onChangeField('pricePerSession', e.target.value);
                    onClearFieldError?.('pricePerSession');
                  }}
                  placeholder="Nhập giá buổi tập"
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                />
                <div className="flex items-center gap-2 pl-2 select-none">
                  <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                  <span className="text-[13px] font-semibold text-[#064343]">VND</span>
                </div>
              </div>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between text-[14px] font-semibold text-[#064343]">
                <span>
                  {employee.trainerInfo?.pricePerSession !== undefined &&
                  employee.trainerInfo?.pricePerSession !== null
                    ? Number(employee.trainerInfo.pricePerSession).toLocaleString('vi-VN')
                    : '0'}
                </span>
                <div className="flex items-center gap-2 text-[#064343]">
                  <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                  <span className="text-[13px] font-semibold">VND</span>
                </div>
              </div>
            )}
            {errors.pricePerSession && (
              <p className="text-xs text-red-500 mt-0.5">{errors.pricePerSession}</p>
            )}
          </div>

          {/* 4. Đánh giá */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">Đánh giá</label>
            <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between gap-3">
              <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#064343] rounded-full transition-all duration-300"
                  style={{ width: `${ratingPercent}%` }}
                />
              </div>
              <span className="font-bold text-[13px] text-[#011010] shrink-0">
                {ratingAvg.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KHỐI 2: ĐÁNH GIÁ GẦN ĐÂY ── */}
      <div className="bg-white">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
          <h4 className="text-[14px] font-semibold text-[#011010] tracking-[-0.0069em] uppercase">
            ĐÁNH GIÁ GẦN ĐÂY
          </h4>
        </div>
        <EmployeeTabEmptyState message="Chưa có đánh giá nào gần đây" />
      </div>
    </div>
  );
}

