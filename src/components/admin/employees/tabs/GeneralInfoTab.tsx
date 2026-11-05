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
import type { EmployeeDetailTabProps } from '@/types/employee';
import {
  formatPosition,
  formatGender,
  formatDate,
  formatDateTime,
  formatSalaryNumber,
} from '@/lib/utils';

export function GeneralInfoTab({
  employee,
  isEditing,
  formData,
  errors,
  onChangeField,
  onClearFieldError,
}: EmployeeDetailTabProps) {
  const currentPosition = isEditing ? formData.position : employee?.position;
  const currentStatus = isEditing ? formData.employmentStatus : employee?.employmentStatus;
  const isActive = (currentStatus || 'ACTIVE').toUpperCase() === 'ACTIVE';

  return (
    <div className="flex flex-col space-y-8">
      {/* ── KHỐI 1: THÔNG TIN CƠ BẢN ── */}
      <div className="bg-white">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            THÔNG TIN CƠ BẢN
          </h4>
        </div>

        <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
          {/* Họ và tên nhân viên */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Họ và tên nhân viên {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <div
                className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
                  errors.fullName
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                }`}
              >
                <input
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
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                {employee.fullName || '—'}
              </div>
            )}
            {errors.fullName && <p className="text-xs text-red-500 mt-0.5">{errors.fullName}</p>}
          </div>

          {/* Mã nhân viên (Khóa) */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">
              Mã nhân viên (Hệ thống)
            </label>
            <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] text-[#202939] cursor-not-allowed">
              {employee.employeeCode || '—'}
            </div>
          </div>

          {/* Giới tính */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">Giới tính</label>
            {isEditing ? (
              <Select
                value={formData.gender}
                onValueChange={(val) => onChangeField('gender', val)}
              >
                <SelectTrigger className="h-[42px] w-full rounded-[8px] border-slate-200 bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAM">Nam</SelectItem>
                  <SelectItem value="NU">Nữ</SelectItem>
                  <SelectItem value="KHAC">Khác</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                {formatGender(employee.gender)}
              </div>
            )}
          </div>

          {/* Ngày sinh */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">Ngày sinh</label>
            {isEditing ? (
              <DatePicker
                className="h-[42px] w-full bg-slate-50 border-slate-200"
                value={formData.dateOfBirth}
                onChange={(val) => onChangeField('dateOfBirth', val)}
                placeholder="Chọn ngày sinh"
              />
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                {formatDate(employee.dateOfBirth)}
              </div>
            )}
          </div>

          {/* Trạng thái làm việc */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Trạng thái {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <Select
                value={formData.employmentStatus}
                onValueChange={(val) => onChangeField('employmentStatus', val)}
              >
                <SelectTrigger className="h-[42px] w-full rounded-[8px] border-slate-200 bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang làm việc</SelectItem>
                  <SelectItem value="INACTIVE">Đã nghỉ việc</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                {isActive ? 'Đang làm việc' : 'Đã nghỉ việc'}
              </div>
            )}
          </div>

          {/* Vai trò / Chức danh */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Vai trò {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <Select
                value={formData.position}
                onValueChange={(val) => {
                  onChangeField('position', val);
                  onClearFieldError?.('position');
                }}
              >
                <SelectTrigger
                  className={`h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                    errors.position ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEPTIONIST">Lễ tân</SelectItem>
                  <SelectItem value="TRAINER">Huấn luyện viên</SelectItem>
                  <SelectItem value="MANAGER">Quản lý</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="STAFF">Tạp vụ</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                {formatPosition(employee.position)}
              </div>
            )}
            {errors.position && <p className="text-xs text-red-500 mt-0.5">{errors.position}</p>}
          </div>
        </div>
      </div>

      {/* ── KHỐI 2: THÔNG TIN LIÊN LẠC & LƯƠNG ── */}
      <div className="bg-white">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            THÔNG TIN LIÊN LẠC &amp; LƯƠNG
          </h4>
        </div>

        <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
          {/* Số điện thoại */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">
              Số điện thoại di động
            </label>
            {isEditing ? (
              <div
                className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
                  errors.phoneNumber
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                }`}
              >
                <input
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
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                {employee.phoneNumber || '—'}
              </div>
            )}
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-0.5">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email công vụ */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Email công vụ {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <div
                className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
                  errors.email
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                }`}
              >
                <input
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
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                {employee.email || '—'}
              </div>
            )}
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </div>

          {/* Địa chỉ thường trú */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">Địa chỉ thường trú</label>
            {isEditing ? (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => onChangeField('address', e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                />
              </div>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939] truncate">
                {employee.address || '—'}
              </div>
            )}
          </div>

          {/* Số CCCD (Khóa) */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">Số CCCD (Cố định)</label>
            <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] text-[#202939] cursor-not-allowed">
              {employee.nationalId || '—'}
            </div>
          </div>

          {/* Mức lương cơ bản */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Mức lương cơ bản {isEditing && <span className="text-[#EE0033]">*</span>}
            </label>
            {isEditing ? (
              <div
                className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center justify-between ${
                  errors.baseSalaryRate
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                }`}
              >
                <input
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
                <span className="text-[13px] text-[#064343] font-semibold pl-2 select-none">
                  VND
                </span>
              </div>
            ) : (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between text-[14px]">
                <span className="font-semibold text-[#064343]">
                  {formatSalaryNumber(employee.baseSalaryRate)}
                </span>
                <div className="flex items-center gap-2 text-[#064343]">
                  <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                  <span className="text-[13px] font-semibold">VND</span>
                </div>
              </div>
            )}
            {errors.baseSalaryRate && (
              <p className="text-xs text-red-500 mt-0.5">{errors.baseSalaryRate}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── KHỐI 3: THÔNG TIN KHÁC ── */}
      <div className="bg-white pb-2">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            THÔNG TIN KHÁC
          </h4>
        </div>

        <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
          {/* Ngày vào làm chính thức */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">
              Ngày vào làm chính thức
            </label>
            <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
              {formatDate(employee.hiredAt)}
            </div>
          </div>

          {/* Ngày tạo */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">Ngày tạo</label>
            <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
              {formatDateTime(employee.createdDate)}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939]">Ghi chú</label>
            {isEditing ? (
              <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => onChangeField('description', e.target.value)}
                  placeholder="Nhập ghi chú"
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                />
              </div>
            ) : (
              <div
                className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939] truncate"
                title={employee.trainerInfo?.description || formData.description || undefined}
              >
                {employee.trainerInfo?.description || formData.description || '—'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

