'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Info,
  Loader2,
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
import type { CreateEmployeePayload } from '@/types/employee';

// Danh sách các chuyên môn HLV chuẩn bị sẵn (tiếng Việt chuẩn)
export const SPECIALIZATION_OPTIONS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Gym & Thể hình' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Yoga & Thiền định' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Pilates' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Cardio & Giảm mỡ' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Kickboxing & Võ thuật' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Phục hồi chức năng' },
];

export interface CreateEmployeeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateEmployeeForm({ onSuccess, onCancel }: CreateEmployeeFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setHeaderRightContent } = useUiStore();

  // Form states - Thông tin cơ bản (khởi tạo rỗng để hiển thị placeholder 'Chọn' và 'Nhập')
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [baseSalaryRate, setBaseSalaryRate] = useState<number | string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');

  // Form states - Thông tin HLV (khởi tạo rỗng để hiển thị placeholder 'Chọn' và 'Nhập')
  const [specializationId, setSpecializationId] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | string>('');
  const [salaryCoefficient, setSalaryCoefficient] = useState<number | string>('');
  const [description, setDescription] = useState('');

  // UI & Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/employees');
    }
  };

  // TanStack Query Mutation gọi API tạo nhân viên
  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      const msg = res.message || 'Thêm mới nhân viên thành công! Mật khẩu tạm thời đã gửi qua email.';
      showToast('success', msg);
      try {
        sessionStorage.setItem('gymx_employee_flash', msg);
      } catch {}
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/employees');
        }
      }, 1500);
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      const backendErrors: Record<string, string> = {};

      // 1. FluentValidation / ValidationProblemDetails (400 dictionary: data.errors)
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

      // 2. Business Error Code & Detailed Messages từ Backend
      const errCode = String(data?.error?.code || data?.code || '');
      const rawDesc =
        data?.error?.description ||
        data?.error?.message ||
        data?.message ||
        data?.detail ||
        data?.title ||
        err?.message ||
        '';

      // Hàm Việt hóa và chuẩn hóa viết hoa thông báo lỗi
      const formatErrorMessage = (msg: string): string => {
        if (!msg) return 'Có lỗi xảy ra khi tạo nhân viên. Vui lòng kiểm tra lại.';
        const trimmed = msg.trim();
        const lower = trimmed.toLowerCase();

        // Việt hóa các lỗi mạng, kết nối máy chủ và lỗi hệ thống
        if (
          lower.includes('network error') ||
          lower.includes('err_network') ||
          lower.includes('connection refused') ||
          lower.includes('failed to fetch') ||
          lower === 'networkerror'
        ) {
          return 'Lỗi kết nối mạng: Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối internet!';
        }
        if (lower.includes('timeout') || lower.includes('timed out')) {
          return 'Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại sau!';
        }
        if (lower.includes('status code 500') || lower === 'internal server error') {
          return 'Lỗi máy chủ nội bộ (500). Vui lòng thử lại sau hoặc liên hệ quản trị viên!';
        }
        if (lower.includes('status code 404') || lower === 'not found') {
          return 'Không tìm thấy dữ liệu hoặc dịch vụ yêu cầu (404).';
        }
        if (lower.includes('status code 401') || lower.includes('unauthorized')) {
          return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        }
        if (lower.includes('status code 403') || lower.includes('forbidden')) {
          return 'Bạn không có quyền thực hiện thao tác này (403).';
        }

        // Viết hoa chữ cái đầu tiên
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      };

      const errDesc = formatErrorMessage(rawDesc);

      // Map các lỗi nghiệp vụ (trùng lặp Email, SĐT, CCCD...) trực tiếp xuống ô input
      if (
        errCode.includes('Email') ||
        /email/i.test(errCode) ||
        /email.*(tồn tại|sử dụng|đã có|trùng|exists|duplicate|already)/i.test(rawDesc)
      ) {
        backendErrors.email = formatErrorMessage(rawDesc || 'Email này đã tồn tại trong hệ thống.');
      } else if (
        errCode.includes('Phone') ||
        /phone/i.test(errCode) ||
        /(sđt|số điện thoại).*(tồn tại|sử dụng|đã có|trùng|exists|duplicate|already)/i.test(rawDesc)
      ) {
        backendErrors.phoneNumber = formatErrorMessage(rawDesc || 'Số điện thoại này đã tồn tại trong hệ thống.');
      } else if (
        errCode.includes('CitizenId') ||
        errCode.includes('NationalId') ||
        /cccd|citizen|national/i.test(errCode) ||
        /(cccd|căn cước).*(tồn tại|sử dụng|đã có|trùng|exists|duplicate|already)/i.test(rawDesc)
      ) {
        backendErrors.nationalId = formatErrorMessage(rawDesc || 'Số CCCD này đã tồn tại trong hệ thống.');
      }

      // Nếu có lỗi cụ thể theo ô input: gán vào errors và cuộn tới ô lỗi đầu tiên
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        const firstKey = Object.keys(backendErrors)[0];
        setTimeout(() => {
          const el = document.getElementById(firstKey) || document.querySelector(`[name="${firstKey}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        // Lỗi hệ thống / mạng chung: hiển thị Alert Toast ở trên cùng container
        const fallbackMsg = errDesc || 'Có lỗi xảy ra khi tạo nhân viên. Vui lòng kiểm tra lại.';
        showToast('error', fallbackMsg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  });

  // Tắt toàn bộ báo lỗi khi người dùng chọn/nhập vào bất kỳ ô input nào
  const handleClearAllErrors = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (toast && toast.type === 'error') {
      setToast(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Họ và tên
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống.';
    } else if (fullName.trim().length > 150) {
      newErrors.fullName = 'Họ và tên tối đa 150 ký tự.';
    }

    // 2. Email
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Email không đúng định dạng.';
    }

    // 3. Vai trò
    if (!position) {
      newErrors.position = 'Vui lòng chọn vai trò làm việc.';
    }

    // 4. Số điện thoại (Nếu nhập thì phải có 10 chữ số bắt đầu bằng 0)
    if (phoneNumber.trim()) {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!/^0\d{9}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.';
      }
    }

    // 5. Số CCCD (Bắt buộc đúng 12 chữ số theo BE & thực tế)
    if (!nationalId.trim()) {
      newErrors.nationalId = 'Số CCCD không được để trống.';
    } else if (!/^\d{12}$/.test(nationalId.trim())) {
      newErrors.nationalId = 'Số CCCD phải bao gồm đúng 12 chữ số.';
    }

    // 6. Mức lương cơ bản
    if (baseSalaryRate === '' || isNaN(Number(baseSalaryRate)) || Number(baseSalaryRate) < 0) {
      newErrors.baseSalaryRate = 'Mức lương cơ bản phải là số không âm.';
    }

    // 7. Địa chỉ thường trú
    if (!address.trim()) {
      newErrors.address = 'Địa chỉ thường trú không được để trống.';
    }

    // 8. Trạng thái làm việc
    if (!employmentStatus) {
      newErrors.employmentStatus = 'Vui lòng chọn trạng thái làm việc.';
    }

    // 9. Ràng buộc riêng khi chọn Huấn luyện viên
    if (position === 'TRAINER') {
      if (!specializationId) {
        newErrors.specializationId = 'Vui lòng chọn chuyên môn HLV.';
      }

      if (experienceYears === '' || isNaN(Number(experienceYears)) || Number(experienceYears) <= 0) {
        newErrors.experienceYears = 'Số năm kinh nghiệm của HLV phải lớn hơn 0.';
      }

      if (salaryCoefficient === '' || isNaN(Number(salaryCoefficient)) || Number(salaryCoefficient) < 0) {
        newErrors.salaryCoefficient = 'Hệ số lương phải lớn hơn hoặc bằng 0.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      setTimeout(() => {
        const el = document.getElementById(firstKey) || document.querySelector(`[name="${firstKey}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return false;
    }

    return true;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setToast(null);

    if (!validate()) return;

    const payload: CreateEmployeePayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      nationalId: nationalId.trim(),
      position: position.toUpperCase(),
      baseSalaryRate: Number(baseSalaryRate),
      phoneNumber: phoneNumber.trim() || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: address.trim() || undefined,
      hiredAt: new Date().toISOString().split('T')[0],
    };

    if (position === 'TRAINER') {
      payload.specializationId = specializationId;
      payload.experienceYears = Number(experienceYears);
      payload.salaryCoefficient = Number(salaryCoefficient);
      payload.description = description.trim() || undefined;
    }

    createMutation.mutate(payload);
  };

  const isTrainer = position === 'TRAINER';
  const isReceptionist = position === 'RECEPTIONIST';

  // Đưa 2 button lên Header thay thế Avatar + Notification bell (chuẩn Figma #I1392:11593;2327:63065)
  useEffect(() => {
    setHeaderRightContent(
      <div className="flex items-center gap-3 mt-1.5">
        {/* Nút Hủy bỏ */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={createMutation.isPending}
          className="h-[48px] min-w-[110px] px-6 py-3.5 bg-white hover:bg-slate-50 text-[#2F3D50] text-[16px] font-normal leading-[18px] rounded-[8px] shadow-[0px_3px_26px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
        >
          Hủy bỏ
        </button>

        {/* Nút Lưu lại */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={createMutation.isPending}
          className="h-[48px] min-w-[110px] px-6 py-3.5 bg-[#064343] hover:bg-[#053737] text-white text-[16px] font-normal leading-[18px] rounded-[8px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {createMutation.isPending && (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          )}
          <span>{createMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}</span>
        </button>
      </div>
    );

    return () => {
      setHeaderRightContent(null);
    };
  }, [
    createMutation.isPending,
    fullName,
    email,
    position,
    phoneNumber,
    nationalId,
    baseSalaryRate,
    dateOfBirth,
    gender,
    address,
    employmentStatus,
    specializationId,
    experienceYears,
    salaryCoefficient,
    description,
  ]);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Toast Alert – Ngang hàng thanh Header (Top Center của vùng nội dung) */}
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === 'success' ? 'success' : 'danger'}
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <p className="text-[13px] font-normal !font-normal text-[#202939] leading-snug whitespace-nowrap">{toast.message}</p>
          </Alert>
        </div>
      )}

      {/* Main Form Content - 2 Cards Layout matching Figma #1392:10848 (Card 1 wider, Card 2 single col 480px) */}
      <form
        onSubmit={handleSubmit}
        onFocusCapture={handleClearAllErrors}
        className="w-full flex flex-col xl:flex-row gap-6 items-stretch"
      >
        {/* ─── Card 1: Thông tin cơ bản (Figma #1392:11381 - Rộng hơn, 2 cột) ────────────────────── */}
        <div className="relative w-full flex-1 bg-white rounded-[12px] p-6 sm:p-[28px_32px] min-h-[640px] shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col justify-between">
          {/* Stroke xanh bám sát mép trái của card, không bo tròn theo Figma 1392:11383 */}
          <div className="absolute left-0 top-7 w-1 h-6 bg-[#064343] rounded-none" />

          <div>
            {/* Header Card 1 (Không có gạch ngang, căn bằng hàng với các ô input) */}
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
                    errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
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
                {errors.fullName && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.fullName}</p>}
              </div>

              {/* 2. Email (*) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Email <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all duration-200 ${
                    errors.email ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
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
                {errors.email && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.email}</p>}
              </div>

              {/* 3. Vai trò (*) (Dropdown chuẩn component Select - Chỉ tiếng Việt) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Vai trò <span className="text-[#EE0033]">*</span>
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
                    <SelectItem value="TRAINER">Huấn luyện viên</SelectItem>
                    <SelectItem value="RECEPTIONIST">Lễ tân</SelectItem>
                  </SelectContent>
                </Select>
                {errors.position && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.position}</p>}
              </div>

            {/* 4. Số ĐT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                Số ĐT
              </label>
              <div
                className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all duration-200 ${
                  errors.phoneNumber ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
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
              {errors.phoneNumber && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.phoneNumber}</p>}
            </div>

            {/* 5. Số CCCD (*) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                Số CCCD <span className="text-[#EE0033]">*</span>
              </label>
              <div
                className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all duration-200 ${
                  errors.nationalId ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                }`}
              >
                <input
                  id="nationalId"
                  type="text"
                  maxLength={12}
                  placeholder="Nhập"
                  value={nationalId}
                  onFocus={handleClearAllErrors}
                  onChange={(e) => {
                    setNationalId(e.target.value.replace(/\D/g, ''));
                    handleClearAllErrors();
                  }}
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                />
              </div>
              {errors.nationalId && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.nationalId}</p>}
            </div>

            {/* 6. Mức lương cơ bản (*) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                Mức lương <span className="text-[#EE0033]">*</span>
              </label>
              <div
                className={`h-[44px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center justify-between transition-all duration-200 ${
                  errors.baseSalaryRate ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
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
                  <span className="text-[14px] text-[#697586] font-normal select-none">VND</span>
                </div>
              </div>
              {errors.baseSalaryRate && (
                <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.baseSalaryRate}</p>
              )}
            </div>

            {/* 7. Ngày sinh (Custom DatePicker chuẩn Component) */}
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

            {/* 8. Giới tính (Dropdown chuẩn component Select) */}
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
                  errors.address ? 'border-red-400 bg-red-50/20' : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
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
              {errors.address && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.address}</p>}
            </div>

            {/* 10. Trạng thái (*) (Dropdown chuẩn component Select) */}
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
              {errors.employmentStatus && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.employmentStatus}</p>}
            </div>
          </div>
        </div>
      </div>

        {/* ─── Card 2: Thông tin chuyên môn HLV (Figma #1392:11631 - 1 cột, 480px) ───────────── */}
        <div className="relative w-full xl:w-[480px] 2xl:w-[500px] shrink-0 bg-white rounded-[12px] p-6 sm:p-[28px_32px] min-h-[640px] shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col justify-between">
          {/* Stroke xanh bám sát mép trái của card, không bo tròn theo Figma 1392:11633 */}
          <div className="absolute left-0 top-7 w-1 h-6 bg-[#064343] rounded-none" />

          <div>
            {/* Header Card 2 (Không có gạch ngang, căn bằng hàng với các ô input) */}
            <div className="flex items-center mb-6">
              <h3 className="text-[20px] font-semibold text-[#202939] leading-[24px] font-sans">
                Thông tin chuyên môn HLV
              </h3>
            </div>

            {/* Stacked Form fields Card 2 */}
            <div className="flex flex-col gap-y-5">
              {/* Chuyên môn (Dropdown chuẩn component Select) */}
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
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.specializationId}</p>
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
                    min="1"
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
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.experienceYears}</p>
                )}
              </div>

              {/* Giá 1 buổi dạy / Hệ số lương */}
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
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.salaryCoefficient}</p>
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

          {/* Badge thông báo ở đáy form Card 2 khi chọn Lễ tân (Màu danger, icon to) */}
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

export default CreateEmployeeForm;
