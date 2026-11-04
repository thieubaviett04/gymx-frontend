'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Check,
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
  onSuccess?: (newEmployeeId?: string) => void;
  onCancel?: () => void;
}

export function CreateEmployeeForm({ onSuccess, onCancel }: CreateEmployeeFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setHeaderRightContent = useUiStore((s) => s.setHeaderRightContent);

  // Form states - Khối 1: Thông tin cơ bản (4 trường do người dùng nhập)
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [gender, setGender] = useState('NAM');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Form states - Khối 2: Thông tin liên lạc & Lương (6 trường do người dùng nhập)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [baseSalaryRate, setBaseSalaryRate] = useState<number | string>('');
  const [address, setAddress] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [hiredAt, setHiredAt] = useState(() => new Date().toISOString().split('T')[0]);

  // Form states - Khối 3: Thông tin chuyên môn HLV (kích hoạt khi vai trò là Huấn luyện viên)
  const [specializationId, setSpecializationId] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | string>('1');
  const [salaryCoefficient, setSalaryCoefficient] = useState<number | string>('1.0');
  const [description, setDescription] = useState('');

  // UI & Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isTrainer = position === 'TRAINER';
  const isReceptionist = position === 'RECEPTIONIST';

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/employees');
    }
  }, [onCancel, router]);

  // Xóa báo lỗi khi người dùng tương tác với input
  const handleClearAllErrors = useCallback(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (toast && toast.type === 'error') {
      setToast(null);
    }
  }, [errors, toast]);

  // TanStack Query Mutation gọi API tạo nhân viên
  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      const newEmployeeId = res?.data?.id || (res?.data as any)?.Id || (res as any)?.id;
      const msg = res.message || 'Thêm mới nhân viên thành công! Mật khẩu tạm thời đã gửi qua email.';
      showToast('success', msg);
      try {
        sessionStorage.setItem('gymx_employee_flash', msg);
      } catch {}
      setTimeout(() => {
        if (newEmployeeId) {
          router.push(`/admin/employees/${newEmployeeId}`);
        } else if (onSuccess) {
          onSuccess(newEmployeeId);
        } else {
          router.push('/admin/employees');
        }
      }, 700);
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

      const formatErrorMessage = (msg: string): string => {
        if (!msg) return 'Có lỗi xảy ra khi tạo nhân viên. Vui lòng kiểm tra lại.';
        const trimmed = msg.trim();
        const lower = trimmed.toLowerCase();

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

        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      };

      const errDesc = formatErrorMessage(rawDesc);

      // Map các lỗi nghiệp vụ trùng lặp trực tiếp xuống ô input
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

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        const firstKey = Object.keys(backendErrors)[0];
        setTimeout(() => {
          const el = document.getElementById(firstKey) || document.querySelector(`[name="${firstKey}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        const fallbackMsg = errDesc || 'Có lỗi xảy ra khi tạo nhân viên. Vui lòng kiểm tra lại.';
        showToast('error', fallbackMsg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  });

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

    // 8. Ràng buộc riêng khi chọn Huấn luyện viên
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
      hiredAt: hiredAt || undefined,
    };

    if (position === 'TRAINER') {
      payload.specializationId = specializationId;
      payload.experienceYears = Number(experienceYears);
      payload.salaryCoefficient = Number(salaryCoefficient);
      payload.description = description.trim() || undefined;
    }

    createMutation.mutate(payload);
  };

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Đưa nút Hủy bỏ & Lưu lại lên Header
  useEffect(() => {
    setHeaderRightContent(
      <div className="flex items-center gap-3">
        {/* Nút Hủy bỏ */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={createMutation.isPending}
          className="h-[44px] px-5 py-2.5 bg-white hover:bg-slate-50 text-[#2F3D50] text-[15px] font-normal leading-[18px] rounded-[8px] shadow-[0px_3px_26px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 text-[#2F3D50]" />
          <span>Hủy bỏ</span>
        </button>

        {/* Nút Lưu lại */}
        <button
          type="button"
          onClick={() => handleSubmitRef.current()}
          disabled={createMutation.isPending}
          className="h-[44px] px-5 py-2.5 bg-[#064343] hover:bg-[#053737] text-white text-[15px] font-normal leading-[18px] rounded-[8px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Lưu lại</span>
            </>
          )}
        </button>
      </div>
    );

    return () => {
      setHeaderRightContent(null);
    };
  }, [createMutation.isPending, handleCancel, setHeaderRightContent]);

  return (
    <div className="w-full flex-1 flex flex-col min-h-full">
      {/* Toast Alert – Canh giữa chính xác theo khung nhìn nội dung */}
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

      {/* ─── Card duy nhất: Bố cục đồng bộ hoàn toàn với trang Thông tin chi tiết ─── */}
      <div className="relative w-full flex-1 bg-white rounded-[12px] p-6 sm:p-[28px_32px] border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-h-[calc(100vh-140px)]">
        {/* Thanh stroke 4px sát mép ngoài bên trái vuông góc theo đúng thiết kế */}
        <div className="absolute left-0 top-7 w-[4px] h-6 bg-[#064343] rounded-none" />

        {/* Header Title & Badge thông báo bên phải trên cùng một hàng */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            Thêm mới nhân viên
          </h2>

          {/* Badge ngắn gọn nằm bên phải ngang hàng với Header Title */}
          {isReceptionist && (
            <div className="inline-flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3.5 py-1.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-normal">
                Thông tin chuyên môn không dành cho <strong className="font-semibold text-red-700">Lễ tân</strong>.
              </span>
            </div>
          )}

          {position && !isTrainer && !isReceptionist && (
            <div className="inline-flex items-center gap-2 text-[13px] text-slate-600 bg-slate-50 border border-slate-200 rounded-[8px] px-3.5 py-1.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-normal">
                Thông tin chuyên môn chỉ áp dụng cho vai trò <strong className="font-semibold text-[#064343]">Huấn luyện viên</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Toàn bộ các trường do người dùng nhập nằm trên một form duy nhất */}
        <form
          onSubmit={handleSubmit}
          onFocusCapture={handleClearAllErrors}
          className="flex flex-col space-y-8"
        >
          {/* ── KHỐI 1: THÔNG TIN CƠ BẢN ── */}
          <div className="bg-white">
            <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                THÔNG TIN CƠ BẢN
              </h4>
            </div>

            {/* Grid 4 cột gọn gàng cho 4 trường cơ bản */}
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
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrors((p) => ({ ...p, fullName: '' }));
                    }}
                    placeholder="Nhập họ và tên"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.fullName}</p>}
              </div>

              {/* 2. Vai trò / Chức danh (*) */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Vai trò <span className="text-[#EE0033]">*</span>
                </label>
                <Select
                  value={position}
                  onValueChange={(val) => {
                    setPosition(val);
                    setErrors((p) => ({ ...p, position: '' }));
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
                    <SelectItem value="RECEPTIONIST">Lễ tân</SelectItem>
                    <SelectItem value="TRAINER">Huấn luyện viên</SelectItem>
                    <SelectItem value="MANAGER">Quản lý</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    <SelectItem value="STAFF">Tạp vụ</SelectItem>
                  </SelectContent>
                </Select>
                {errors.position && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.position}</p>}
              </div>

              {/* 3. Giới tính */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939]">Giới tính</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="h-[42px] w-full rounded-[8px] border-slate-200 bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAM">Nam</SelectItem>
                    <SelectItem value="NU">Nữ</SelectItem>
                    <SelectItem value="KHAC">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Ngày sinh */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939]">Ngày sinh</label>
                <DatePicker
                  id="dateOfBirth"
                  className="h-[42px] w-full bg-slate-50 border-slate-200"
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  placeholder="Chọn ngày sinh"
                />
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

            {/* Grid 3 cột (2 hàng x 3 = 6 trường liên lạc & lương) */}
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
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setErrors((p) => ({ ...p, phoneNumber: '' }));
                    }}
                    placeholder="Nhập số điện thoại"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.phoneNumber && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.phoneNumber}</p>}
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
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: '' }));
                    }}
                    placeholder="Nhập email"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.email}</p>}
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
                    type="number"
                    min="0"
                    step="500000"
                    value={baseSalaryRate}
                    onChange={(e) => {
                      setBaseSalaryRate(e.target.value);
                      setErrors((p) => ({ ...p, baseSalaryRate: '' }));
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
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.baseSalaryRate}</p>
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
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((p) => ({ ...p, address: '' }));
                    }}
                    placeholder="Nhập địa chỉ thường trú"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.address && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.address}</p>}
              </div>

              {/* 5. Số CCCD (*) */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Số CCCD <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`h-[42px] px-3.5 py-2 bg-slate-50 border rounded-[8px] flex items-center transition-all ${
                    errors.nationalId
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="nationalId"
                    type="text"
                    maxLength={12}
                    value={nationalId}
                    onChange={(e) => {
                      setNationalId(e.target.value.replace(/\D/g, ''));
                      setErrors((p) => ({ ...p, nationalId: '' }));
                    }}
                    placeholder="Nhập 12 chữ số CCCD"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                </div>
                {errors.nationalId && <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.nationalId}</p>}
              </div>

              {/* 6. Ngày vào làm chính thức */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939]">
                  Ngày vào làm chính thức
                </label>
                <DatePicker
                  id="hiredAt"
                  value={hiredAt}
                  onChange={setHiredAt}
                  placeholder="Chọn ngày vào làm"
                  className="h-[42px] w-full bg-slate-50 border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* ── KHỐI 3: THÔNG TIN CHUYÊN MÔN HLV (Kích hoạt khi chọn vai trò Huấn luyện viên) ── */}
          <div className="bg-white pb-2">
            <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                THÔNG TIN CHUYÊN MÔN HLV
              </h4>
            </div>

            {/* Grid 3 cột cho 3 trường chuyên môn HLV (màu nền bg-slate-50 border-slate-200 đồng nhất với các ô ở trên) */}
            <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
              {/* 1. Chuyên môn (*) */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Chuyên môn {isTrainer && <span className="text-[#EE0033]">*</span>}
                </label>
                <Select
                  value={specializationId}
                  onValueChange={(val) => {
                    setSpecializationId(val);
                    setErrors((p) => ({ ...p, specializationId: '' }));
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
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.specializationId}</p>
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
                    type="number"
                    min="1"
                    disabled={!isTrainer}
                    placeholder="Nhập số năm"
                    value={experienceYears}
                    onChange={(e) => {
                      setExperienceYears(e.target.value);
                      setErrors((p) => ({ ...p, experienceYears: '' }));
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed"
                  />
                  <span className="text-[13px] text-[#064343] font-semibold pl-2 select-none">
                    năm
                  </span>
                </div>
                {errors.experienceYears && isTrainer && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.experienceYears}</p>
                )}
              </div>

              {/* 3. Hệ số lương HLV (*) */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Hệ số lương HLV {isTrainer && <span className="text-[#EE0033]">*</span>}
                </label>
                <div
                  className={`h-[42px] px-3.5 py-2 rounded-[8px] bg-slate-50 border border-slate-200 flex items-center transition-all ${
                    errors.salaryCoefficient
                      ? 'border-red-400 bg-red-50/20'
                      : 'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    id="salaryCoefficient"
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={!isTrainer}
                    placeholder="Ví dụ: 1.5"
                    value={salaryCoefficient}
                    onChange={(e) => {
                      setSalaryCoefficient(e.target.value);
                      setErrors((p) => ({ ...p, salaryCoefficient: '' }));
                    }}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed"
                  />
                </div>
                {errors.salaryCoefficient && isTrainer && (
                  <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">{errors.salaryCoefficient}</p>
                )}
              </div>
            </div>

            {/* Ghi chú */}
            <div className="px-5 mt-5 flex flex-col gap-1.5 min-w-0">
              <label className="text-[13px] font-medium text-[#202939]">
                Ghi chú
              </label>
              <textarea
                id="description"
                rows={3}
                disabled={!isTrainer}
                placeholder="Nhập ghi chú"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 rounded-[8px] text-[14px] bg-slate-50 border border-slate-200 text-[#202939] placeholder:text-[#697586] outline-none transition-all resize-none min-h-[96px] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployeeForm;