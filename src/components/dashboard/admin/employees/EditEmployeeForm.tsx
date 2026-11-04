'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { employeeService } from '@/lib/api';
import { useUiStore } from '@/lib/store/uiStore';
import {
  Alert,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DatePicker,
} from '@/components/ui';
import type { EmployeeDetail, UpdateEmployeePayload } from '@/types/employee';
import { SPECIALIZATION_OPTIONS } from './CreateEmployeeForm';

export interface EditEmployeeFormProps {
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface EditEmployeeFormInnerProps {
  employee: EmployeeDetail;
  employeeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function EditEmployeeFormInner({
  employee,
  employeeId,
  onSuccess,
  onCancel,
}: EditEmployeeFormInnerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setHeaderRightContent = useUiStore((s) => s.setHeaderRightContent);
  const formRef = useRef<HTMLFormElement>(null);

  // Khởi tạo state trực tiếp từ props dữ liệu nhân viên
  const [fullName, setFullName] = useState(employee.fullName || '');
  const [email, setEmail] = useState(employee.email || '');
  const [position, setPosition] = useState((employee.position || '').toUpperCase());
  const [phoneNumber, setPhoneNumber] = useState(employee.phoneNumber || '');
  const [nationalId] = useState(employee.nationalId || '');
  const [baseSalaryRate, setBaseSalaryRate] = useState<number | string>(
    employee.baseSalaryRate !== undefined && employee.baseSalaryRate !== null
      ? employee.baseSalaryRate
      : ''
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : ''
  );
  const [gender, setGender] = useState(employee.gender || '');
  const [address, setAddress] = useState(employee.address || '');
  const [employmentStatus, setEmploymentStatus] = useState(
    (employee.employmentStatus || 'ACTIVE').toUpperCase()
  );

  // Form states - Thông tin HLV
  const [specializationId, setSpecializationId] = useState(
    employee.trainerInfo?.specializationId || ''
  );
  const [experienceYears, setExperienceYears] = useState<number | string>(
    employee.trainerInfo?.experienceYears !== undefined && employee.trainerInfo?.experienceYears !== null
      ? employee.trainerInfo.experienceYears
      : ''
  );
  const [salaryCoefficient, setSalaryCoefficient] = useState<number | string>(
    employee.trainerInfo?.salaryCoefficient !== undefined && employee.trainerInfo?.salaryCoefficient !== null
      ? employee.trainerInfo.salaryCoefficient
      : ''
  );
  const [description, setDescription] = useState(
    employee.trainerInfo?.description || ''
  );

  // UI & Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/admin/employees/${employeeId}`);
    }
  }, [onCancel, router]);

  // TanStack Query Mutation gọi API cập nhật nhân viên
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateEmployeePayload) => employeeService.update(employeeId, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-employee', employeeId] });
      const msg = res.message || 'Cập nhật thông tin nhân viên thành công!';
      showToast('success', msg);
      try {
        sessionStorage.setItem('gymx_employee_flash', msg);
        sessionStorage.setItem('gymx_employee_view_id', employeeId);
      } catch {}
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/admin/employees/${employeeId}`);
        }
      }, 1000);
    },
    onError: (err: unknown) => {
      const errObj = err as {
        response?: {
          data?: {
            errors?: Record<string, unknown>;
            error?: { code?: string; description?: string; message?: string };
            code?: string;
            message?: string;
          };
        };
      };
      const data = errObj?.response?.data;
      const backendErrors: Record<string, string> = {};

      if (data?.errors && typeof data.errors === 'object') {
        for (const [key, msgs] of Object.entries(data.errors)) {
          const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
          const lowerKey = key.toLowerCase();
          if (lowerKey === 'email') backendErrors.email = msg;
          else if (lowerKey === 'phonenumber' || lowerKey === 'phone') backendErrors.phoneNumber = msg;
          else if (lowerKey === 'nationalid' || lowerKey === 'citizenid') backendErrors.nationalId = msg;
          else if (lowerKey === 'fullname') backendErrors.fullName = msg;
          else if (lowerKey === 'position') backendErrors.position = msg;
          else if (lowerKey === 'basesalaryrate') backendErrors.baseSalaryRate = msg;
          else if (lowerKey === 'address') backendErrors.address = msg;
          else if (lowerKey === 'employmentstatus') backendErrors.employmentStatus = msg;
          else if (lowerKey === 'specializationid') backendErrors.specializationId = msg;
          else if (lowerKey === 'experienceyears') backendErrors.experienceYears = msg;
          else if (lowerKey === 'salarycoefficient') backendErrors.salaryCoefficient = msg;
        }
      }

      const errorCode = data?.error?.code || data?.code || '';
      const errorDesc = data?.error?.description || data?.error?.message || data?.message || '';

      if (errorCode === 'User.EmailExists') {
        backendErrors.email = 'Email này đã tồn tại trong hệ thống. Vui lòng chọn email khác.';
      } else if (errorCode === 'User.PhoneExists') {
        backendErrors.phoneNumber = 'Số điện thoại này đã được sử dụng. Vui lòng kiểm tra lại.';
      } else if (errorCode === 'Employee.NotFound') {
        showToast('error', 'Không tìm thấy thông tin nhân viên cần cập nhật.');
      }

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        showToast('error', 'Vui lòng kiểm tra lại các trường thông tin báo đỏ bên dưới.');
      } else {
        showToast('error', errorDesc || 'Có lỗi xảy ra khi cập nhật nhân viên. Vui lòng thử lại.');
      }
    },
  });

  const isTrainer = position === 'TRAINER';
  const isReceptionist = position === 'RECEPTIONIST';

  const handleClearAllErrors = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Họ tên nhân viên không được để trống.';
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Email không hợp lệ (ví dụ: nguyenvana@gmail.com).';
    }

    if (!position) newErrors.position = 'Vui lòng chọn chức vụ cho nhân viên.';

    if (phoneNumber.trim()) {
      const cleanPhone = phoneNumber.replace(/[\s.-]/g, '');
      if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Số điện thoại không đúng định dạng VN (10 chữ số, bắt đầu 03, 05, 07, 08, 09).';
      }
    }

    if (baseSalaryRate === '' || Number(baseSalaryRate) < 0) {
      newErrors.baseSalaryRate = 'Mức lương cơ bản phải lớn hơn hoặc bằng 0.';
    }

    if (!address.trim()) {
      newErrors.address = 'Địa chỉ thường trú không được để trống.';
    }

    if (!employmentStatus) {
      newErrors.employmentStatus = 'Vui lòng chọn trạng thái làm việc.';
    }

    if (isTrainer) {
      if (!specializationId) newErrors.specializationId = 'Vui lòng chọn chuyên môn đào tạo.';
      if (experienceYears === '' || Number(experienceYears) < 0) {
        newErrors.experienceYears = 'Số năm kinh nghiệm không được để trống và >= 0.';
      }
      if (salaryCoefficient === '' || Number(salaryCoefficient) <= 0) {
        newErrors.salaryCoefficient = 'Hệ số lương phải lớn hơn 0 (ví dụ: 1.0 hoặc 1.5).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    fullName,
    email,
    position,
    phoneNumber,
    baseSalaryRate,
    address,
    employmentStatus,
    isTrainer,
    specializationId,
    experienceYears,
    salaryCoefficient,
  ]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!validateForm()) {
        showToast('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc trước khi lưu.');
        return;
      }

      const payload: UpdateEmployeePayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        position,
        baseSalaryRate: Number(baseSalaryRate),
        employmentStatus,
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        address: address.trim() || undefined,
        specializationId: isTrainer ? specializationId || undefined : undefined,
        experienceYears: isTrainer && experienceYears !== '' ? Number(experienceYears) : undefined,
        salaryCoefficient: isTrainer && salaryCoefficient !== '' ? Number(salaryCoefficient) : undefined,
        description: isTrainer && description.trim() ? description.trim() : undefined,
      };

      updateMutation.mutate(payload);
    },
    [
      validateForm,
      showToast,
      fullName,
      email,
      position,
      baseSalaryRate,
      employmentStatus,
      phoneNumber,
      gender,
      dateOfBirth,
      address,
      isTrainer,
      specializationId,
      experienceYears,
      salaryCoefficient,
      description,
      updateMutation,
    ]
  );

  // Đồng bộ nút hành động ở Header góc phải trên cùng (như form tạo mới)
  useEffect(() => {
    const isPending = updateMutation.isPending;

    setHeaderRightContent(
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="h-[48px] min-w-[90px] px-6 py-3.5 bg-white border border-[#E5E5E5] text-[#525252] text-[16px] font-normal leading-[18px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => formRef.current?.requestSubmit()}
          disabled={isPending}
          className="h-[48px] min-w-[110px] px-6 py-3.5 bg-[#064343] hover:bg-[#053737] text-white text-[16px] font-normal leading-[18px] rounded-[8px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending && (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          )}
          <span>{isPending ? 'Đang lưu...' : 'Lưu lại'}</span>
        </button>
      </div>
    );

    return () => {
      setHeaderRightContent(null);
    };
  }, [
    handleCancel,
    setHeaderRightContent,
    updateMutation.isPending,
  ]);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Toast Alert – Top Center */}
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === 'success' ? 'success' : 'danger'}
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <p className="text-[13px] font-normal !font-normal text-[#202939] leading-snug whitespace-nowrap">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      {/* Main Form Content - 2 Cards Layout matching Figma #1392:10848 (Giống hệt Form tạo mới) */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onFocusCapture={handleClearAllErrors}
        className="w-full flex flex-col xl:flex-row gap-6 items-stretch"
      >
        {/* ─── Card 1: Thông tin cơ bản (Figma #1392:11381 - Rộng hơn, 2 cột) ────────────────────── */}
        <div className="relative w-full flex-1 bg-white rounded-[12px] p-6 sm:p-[28px_32px] min-h-[640px] shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col justify-between">
          {/* Stroke xanh bám sát mép trái của card */}
          <div className="absolute left-0 top-7 w-1 h-6 bg-[#064343] rounded-none" />

          <div>
            {/* Header Card 1 */}
            <div className="flex items-center mb-6">
              <h3 className="text-[20px] font-semibold text-[#202939] leading-[24px] font-sans">
                Thông tin cơ bản
              </h3>
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* 1. Họ tên (*) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Họ tên <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all duration-200 ${
                    errors.fullName
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Nhập"
                    value={fullName}
                    onFocus={handleClearAllErrors}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      handleClearAllErrors();
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* 2. Email (*) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Email <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all duration-200 ${
                    errors.email
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="email"
                    type="email"
                    placeholder="Nhập"
                    value={email}
                    onFocus={handleClearAllErrors}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      handleClearAllErrors();
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* 3. Chức vụ (*) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Chức vụ <span className="text-[#EE0033]">*</span>
                </label>
                <Select
                  value={position}
                  onValueChange={(val) => {
                    setPosition(val);
                    handleClearAllErrors();
                  }}
                  onOpenChange={(isOpen) => {
                    if (isOpen) handleClearAllErrors();
                  }}
                >
                  <SelectTrigger
                    id="position"
                    onFocus={handleClearAllErrors}
                    className={`h-[44px] w-full rounded-[8px] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] transition-all duration-200 focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                      errors.position ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF]'
                    }`}
                  >
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRAINER">Huấn luyện viên (Trainer)</SelectItem>
                    <SelectItem value="RECEPTIONIST">Lễ tân</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    <SelectItem value="MANAGER">Quản lý</SelectItem>
                    <SelectItem value="STAFF">Tạp vụ / Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.position}
                  </p>
                )}
              </div>

              {/* 4. Số ĐT */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Số ĐT
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all duration-200 ${
                    errors.phoneNumber
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Nhập"
                    value={phoneNumber}
                    onFocus={handleClearAllErrors}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      handleClearAllErrors();
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* 5. Số CCCD */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Số CCCD
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center border-[#CDD5DF] text-slate-500 select-none`}
                  title="Số CCCD không thể thay đổi sau khi tạo hồ sơ"
                >
                  <input
                    id="nationalId"
                    type="text"
                    disabled
                    placeholder="—"
                    value={nationalId}
                    className="w-full bg-transparent text-[14px] text-[#697586] outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 6. Mức lương cơ bản (*) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Mức lương <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center justify-between transition-all duration-200 ${
                    errors.baseSalaryRate
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="baseSalaryRate"
                    type="number"
                    min="0"
                    step="500000"
                    placeholder="Nhập"
                    value={baseSalaryRate}
                    onFocus={handleClearAllErrors}
                    onChange={(e) => {
                      setBaseSalaryRate(e.target.value);
                      handleClearAllErrors();
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                    <span className="text-[14px] text-[#064343] font-semibold select-none">VND</span>
                  </div>
                </div>
                {errors.baseSalaryRate && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.baseSalaryRate}
                  </p>
                )}
              </div>

              {/* 7. Ngày sinh */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Ngày sinh
                </label>
                <DatePicker
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onFocus={handleClearAllErrors}
                  onChange={(val) => {
                    setDateOfBirth(val);
                    handleClearAllErrors();
                  }}
                  placeholder="Chọn"
                />
              </div>

              {/* 8. Giới tính */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Giới tính
                </label>
                <Select
                  value={gender}
                  onValueChange={(val) => {
                    setGender(val);
                    handleClearAllErrors();
                  }}
                  onOpenChange={(isOpen) => {
                    if (isOpen) handleClearAllErrors();
                  }}
                >
                  <SelectTrigger
                    id="gender"
                    onFocus={handleClearAllErrors}
                    className="h-[44px] w-full rounded-[8px] border-[#CDD5DF] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] transition-all duration-200 focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                  >
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAM">Nam</SelectItem>
                    <SelectItem value="NU">Nữ</SelectItem>
                    <SelectItem value="KHAC">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 9. Địa chỉ thường trú (*) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Địa chỉ thường trú <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all duration-200 ${
                    errors.address
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="address"
                    type="text"
                    placeholder="Nhập"
                    value={address}
                    onFocus={handleClearAllErrors}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      handleClearAllErrors();
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.address && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* 10. Trạng thái (*) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Trạng thái <span className="text-[#EE0033]">*</span>
                </label>
                <Select
                  value={employmentStatus}
                  onValueChange={(val) => {
                    setEmploymentStatus(val);
                    handleClearAllErrors();
                  }}
                  onOpenChange={(isOpen) => {
                    if (isOpen) handleClearAllErrors();
                  }}
                >
                  <SelectTrigger
                    id="employmentStatus"
                    onFocus={handleClearAllErrors}
                    className={`h-[44px] w-full rounded-[8px] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] transition-all duration-200 focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                      errors.employmentStatus ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF]'
                    }`}
                  >
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang làm việc</SelectItem>
                    <SelectItem value="INACTIVE">Đã nghỉ việc</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentStatus && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.employmentStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Card 2: Thông tin chuyên môn HLV (Figma #1392:11631 - 1 cột, 480px) ───────────── */}
        <div className="relative w-full xl:w-[480px] 2xl:w-[500px] shrink-0 bg-white rounded-[12px] p-6 sm:p-[28px_32px] min-h-[640px] shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col justify-between">
          {/* Stroke xanh bám sát mép trái của card */}
          <div className="absolute left-0 top-7 w-1 h-6 bg-[#064343] rounded-none" />

          <div>
            {/* Header Card 2 */}
            <div className="flex items-center mb-6">
              <h3 className="text-[20px] font-semibold text-[#202939] leading-[24px] font-sans">
                Thông tin chuyên môn HLV
              </h3>
            </div>

            {/* Stacked Form fields Card 2 */}
            <div className="flex flex-col gap-y-5">
              {/* Chuyên môn */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Chuyên môn {isTrainer && <span className="text-[#EE0033]">*</span>}
                </label>
                <Select
                  value={specializationId}
                  onValueChange={(val) => {
                    setSpecializationId(val);
                    handleClearAllErrors();
                  }}
                  onOpenChange={(isOpen) => {
                    if (isOpen) handleClearAllErrors();
                  }}
                  disabled={!isTrainer}
                >
                  <SelectTrigger
                    id="specializationId"
                    onFocus={handleClearAllErrors}
                    className={`h-[44px] w-full rounded-[8px] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] transition-all duration-200 focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                      !isTrainer
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        : errors.specializationId
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-[#CDD5DF]'
                    }`}
                  >
                    <SelectValue placeholder="Chọn" />
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

              {/* Số năm kinh nghiệm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Số năm kinh nghiệm {isTrainer && <span className="text-[#EE0033]">*</span>}
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 rounded-[8px] flex items-center transition-all duration-200 ${
                    !isTrainer
                      ? 'bg-slate-50 border border-slate-200'
                      : errors.experienceYears
                      ? 'bg-white border border-red-400 bg-red-50/20'
                      : 'bg-white border border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="experienceYears"
                    type="number"
                    min="0"
                    disabled={!isTrainer}
                    placeholder="Nhập"
                    value={experienceYears}
                    onFocus={handleClearAllErrors}
                    onChange={(e) => {
                      setExperienceYears(e.target.value);
                      handleClearAllErrors();
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                  />
                </div>
                {errors.experienceYears && isTrainer && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.experienceYears}
                  </p>
                )}
              </div>

              {/* Hệ số lương */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Hệ số lương {isTrainer && <span className="text-[#EE0033]">*</span>}
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 rounded-[8px] flex items-center transition-all duration-200 ${
                    !isTrainer
                      ? 'bg-slate-50 border border-slate-200'
                      : errors.salaryCoefficient
                      ? 'bg-white border border-red-400 bg-red-50/20'
                      : 'bg-white border border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="salaryCoefficient"
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={!isTrainer}
                    placeholder="Nhập"
                    value={salaryCoefficient}
                    onFocus={handleClearAllErrors}
                    onChange={(e) => {
                      setSalaryCoefficient(e.target.value);
                      handleClearAllErrors();
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                  />
                </div>
                {errors.salaryCoefficient && isTrainer && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                    {errors.salaryCoefficient}
                  </p>
                )}
              </div>

              {/* Giới thiệu mô tả */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939]">
                  Giới thiệu mô tả
                </label>
                <textarea
                  id="description"
                  rows={4}
                  disabled={!isTrainer}
                  placeholder="Nhập"
                  value={description}
                  onFocus={handleClearAllErrors}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    handleClearAllErrors();
                  }}
                  className={`w-full p-3.5 rounded-[8px] text-[14px] text-[#202939] placeholder:text-[#697586] outline-none transition-all duration-200 resize-none min-h-[123px] ${
                    !isTrainer
                      ? 'bg-slate-50 border border-slate-200 cursor-not-allowed text-slate-400'
                      : 'bg-white border border-[#CDD5DF] focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Badge thông báo nếu chọn Lễ tân */}
          {isReceptionist && (
            <div className="mt-6 flex items-center gap-3 text-[14px] text-red-600 bg-red-50/80 border border-red-200 rounded-[8px] p-3.5 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="font-normal">
                Thông tin chuyên môn không áp dụng cho chức vụ <strong className="font-semibold text-red-700">Lễ tân</strong>.
              </span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export function EditEmployeeForm({ id: propId, onSuccess, onCancel }: EditEmployeeFormProps) {
  const router = useRouter();
  const params = useParams();
  const employeeId = (propId || params?.id) as string;

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/employees');
    }
  }, [onCancel, router]);

  // Fetch thông tin chi tiết nhân viên
  const {
    data: employeeRes,
    isLoading: isFetching,
    isError: isFetchError,
    refetch,
  } = useQuery({
    queryKey: ['admin-employee', employeeId],
    queryFn: () => employeeService.byId(employeeId),
    enabled: !!employeeId,
  });

  if (isFetching) {
    return (
      <div className="w-full flex-1 min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[12px] border border-[#E2E8F0] p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#064343] mb-3" />
        <p className="text-[14px] text-[#697586]">Đang tải thông tin nhân viên...</p>
      </div>
    );
  }

  if (isFetchError || !employeeRes?.data) {
    return (
      <div className="w-full flex-1 min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[12px] border border-[#E2E8F0] p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-semibold text-[#202939] mb-1">Không thể tải thông tin nhân viên</h3>
        <p className="text-sm text-[#697586] mb-4">Vui lòng thử tải lại hoặc quay lại danh sách.</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#064343] text-white rounded-lg text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-[#E5E5E5] text-slate-700 rounded-lg text-sm cursor-pointer hover:bg-slate-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditEmployeeFormInner
      key={employeeRes.data.id}
      employee={employeeRes.data}
      employeeId={employeeId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

export default EditEmployeeForm;
