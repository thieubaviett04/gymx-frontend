'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Calendar,
  Clock,
  Award,
  FileText,
  Star,
  User,
  Check,
  X,
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
import { ConnectionErrorState } from '@/components/shared';
import { SPECIALIZATION_OPTIONS } from './CreateEmployeeForm';

/** Format chức danh chuẩn hiển thị */
function formatPosition(pos?: string | null): string {
  if (!pos) return '—';
  const upper = pos.toUpperCase().trim();
  switch (upper) {
    case 'TRAINER':
      return 'Huấn luyện viên';
    case 'RECEPTIONIST':
      return 'Lễ tân';
    case 'ADMIN':
      return 'Quản trị viên';
    case 'MANAGER':
      return 'Quản lý';
    case 'STAFF':
      return 'Tạp vụ';
    default:
      return pos;
  }
}

/** Format giới tính */
function formatGender(gender?: string | null): string {
  if (!gender) return '—';
  const g = gender.toUpperCase().trim();
  if (g === 'NAM') return 'Nam';
  if (g === 'NU') return 'Nữ';
  return 'Khác';
}

/** Format ngày DD/MM/YYYY */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/** Format ngày giờ DD/MM/YYYY • HH:mm */
function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} • ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

/** Format số tiền (chỉ số, không kèm đơn vị để ghép với VND) */
function formatSalaryNumber(val?: number | string | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'string' ? Number(val) : val;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
}

export interface EmployeeDetailPageProps {
  id?: string;
}

export function EmployeeDetailPage({ id: propId }: EmployeeDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setHeaderRightContent = useUiStore((s) => s.setHeaderRightContent);

  const employeeId = propId || (params?.id as string);

  // UI Tabs & Edit State
  const [activeTab, setActiveTab] = useState<'general' | 'trainer' | 'history' | 'notes'>('general');
  const [isEditing, setIsEditing] = useState(false);

  // Toast alert
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Đọc thông báo flash khi chuyển từ trang khác sang (ví dụ sau khi thêm mới thành công)
  useEffect(() => {
    try {
      const flashMsg = sessionStorage.getItem('gymx_employee_flash');
      if (flashMsg) {
        sessionStorage.removeItem('gymx_employee_flash');
        setTimeout(() => {
          showToast('success', flashMsg);
        }, 100);
      }
    } catch {}
  }, [showToast]);

  // Form edit states (chuẩn theo style form nhập trên Slide Panel)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('ACTIVE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('NAM');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [baseSalaryRate, setBaseSalaryRate] = useState<number | string>('');
  const [salaryCoefficient, setSalaryCoefficient] = useState<number | string>('1.0');
  const [specializationId, setSpecializationId] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | string>('1');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lấy dữ liệu chi tiết nhân viên
  const {
    data: employeeRes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-employee', employeeId],
    queryFn: () => employeeService.byId(employeeId),
    enabled: !!employeeId,
  });

  const employee: EmployeeDetail | undefined = employeeRes?.data;

  // Đồng bộ form state từ employee data
  const syncFormFromEmployee = useCallback((emp: EmployeeDetail) => {
    setFullName(emp.fullName || '');
    setEmail(emp.email || '');
    setPosition((emp.position || 'RECEPTIONIST').toUpperCase());
    setEmploymentStatus((emp.employmentStatus || 'ACTIVE').toUpperCase());
    setPhoneNumber(emp.phoneNumber || '');
    setGender((emp.gender || 'NAM').toUpperCase());
    setDateOfBirth(emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '');
    setAddress(emp.address || '');
    setBaseSalaryRate(emp.baseSalaryRate !== undefined ? emp.baseSalaryRate : '');
    setSalaryCoefficient(
      emp.trainerInfo?.salaryCoefficient !== undefined && emp.trainerInfo?.salaryCoefficient !== null
        ? emp.trainerInfo.salaryCoefficient
        : '1.0'
    );
    setSpecializationId(emp.trainerInfo?.specializationId || SPECIALIZATION_OPTIONS[0].id);
    setExperienceYears(
      emp.trainerInfo?.experienceYears !== undefined && emp.trainerInfo?.experienceYears !== null
        ? emp.trainerInfo.experienceYears
        : 1
    );
    setDescription(emp.trainerInfo?.description || '');
    setErrors({});
  }, []);

  useEffect(() => {
    if (employee) {
      syncFormFromEmployee(employee);
    }
  }, [employee, syncFormFromEmployee]);

  // Mutation cập nhật nhân viên (In-place Update chuẩn như Slide Panel)
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateEmployeePayload) => employeeService.update(employeeId, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      showToast('success', res.message || 'Cập nhật thông tin nhân viên thành công!');
      setIsEditing(false);
      setErrors({});
    },
    onError: (err: unknown) => {
      const errObj = err as {
        response?: {
          data?: {
            errors?: Record<string, unknown>;
            error?: { code?: string; description?: string; message?: string };
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
          else if (lowerKey === 'fullname') backendErrors.fullName = msg;
          else if (lowerKey === 'position') backendErrors.position = msg;
          else if (lowerKey === 'basesalaryrate') backendErrors.baseSalaryRate = msg;
        }
      }

      setErrors(backendErrors);
      showToast(
        'error',
        data?.error?.description || data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên.'
      );
    },
  });

  const handleStartEdit = () => {
    if (employee) {
      syncFormFromEmployee(employee);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (employee) {
      syncFormFromEmployee(employee);
    }
    setIsEditing(false);
    setErrors({});
  };

  const handleSaveEdit = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Họ tên nhân viên không được để trống.';
    if (!email.trim()) newErrors.email = 'Email không được để trống.';
    if (!position) newErrors.position = 'Vui lòng chọn vai trò làm việc.';
    if (
      baseSalaryRate === '' ||
      isNaN(Number(baseSalaryRate)) ||
      Number(baseSalaryRate) < 0
    ) {
      newErrors.baseSalaryRate = 'Mức lương cơ bản phải là số không âm.';
    }

    if (position === 'TRAINER') {
      if (!specializationId) newErrors.specializationId = 'Vui lòng chọn chuyên môn HLV.';
      if (
        experienceYears === '' ||
        isNaN(Number(experienceYears)) ||
        Number(experienceYears) <= 0
      ) {
        newErrors.experienceYears = 'Số năm kinh nghiệm phải lớn hơn 0 (tối thiểu 1 năm).';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('error', 'Vui lòng kiểm tra lại các trường thông tin bắt buộc.');
      return;
    }

    const payload: UpdateEmployeePayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      position: position.toUpperCase(),
      baseSalaryRate: Number(baseSalaryRate),
      employmentStatus: employmentStatus.toUpperCase(),
      phoneNumber: phoneNumber.trim() || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: address.trim() || undefined,
    };

    if (position === 'TRAINER') {
      payload.specializationId = specializationId;
      payload.experienceYears = Number(experienceYears);
      payload.salaryCoefficient =
        salaryCoefficient !== '' ? Number(salaryCoefficient) : undefined;
      payload.description = description.trim() || undefined;
    } else if (description.trim()) {
      payload.description = description.trim();
    }

    updateMutation.mutate(payload);
  };

  // Refs để lưu handlers mới nhất tránh re-render lặp vô tận trong useEffect
  const handleStartEditRef = React.useRef(handleStartEdit);
  handleStartEditRef.current = handleStartEdit;

  const handleCancelEditRef = React.useRef(handleCancelEdit);
  handleCancelEditRef.current = handleCancelEdit;

  const handleSaveEditRef = React.useRef(handleSaveEdit);
  handleSaveEditRef.current = handleSaveEdit;

  // Cấu hình thanh hành động Header phía trên:
  // - Tab Lịch sử & Ghi chú: chỉ có nút Quay lại (vô hiệu hóa nút Chỉnh sửa)
  // - Tab Thông tin chung & Chuyên môn: có nút Chỉnh sửa / Hủy + Lưu thay đổi
  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'notes') {
      setHeaderRightContent(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/employees')}
            className="h-[44px] px-5 py-2.5 bg-white border border-[#CDD5DF] text-[#525252] text-[15px] font-normal leading-[18px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-[#525252]" />
            <span>Quay lại</span>
          </button>
        </div>
      );
    } else if (isEditing) {
      setHeaderRightContent(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleCancelEditRef.current()}
            disabled={updateMutation.isPending}
            className="h-[44px] min-w-[90px] px-5 py-2.5 bg-white border border-[#CDD5DF] text-[#525252] text-[15px] font-normal leading-[18px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => handleSaveEditRef.current()}
            disabled={updateMutation.isPending}
            className="h-[44px] min-w-[120px] px-5 py-2.5 bg-[#064343] hover:bg-[#053737] text-white text-[15px] font-normal leading-[18px] rounded-[8px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Check className="w-4 h-4 text-white" />
            )}
            <span>{updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      );
    } else {
      setHeaderRightContent(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/employees')}
            className="h-[44px] px-5 py-2.5 bg-white border border-[#CDD5DF] text-[#525252] text-[15px] font-normal leading-[18px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-[#525252]" />
            <span>Quay lại</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartEditRef.current()}
            className="h-[44px] px-5 py-2.5 bg-[#064343] hover:bg-[#053737] text-white text-[15px] font-normal leading-[18px] rounded-[8px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
          >
            <Pencil className="w-4 h-4 text-white" />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      );
    }

    return () => {
      setHeaderRightContent(null);
    };
  }, [activeTab, isEditing, updateMutation.isPending, router, setHeaderRightContent]);

  const currentPosition = isEditing ? position : employee?.position;
  const isTrainer = (currentPosition || '').toUpperCase() === 'TRAINER' || !!employee?.trainerInfo;
  const currentStatus = isEditing ? employmentStatus : employee?.employmentStatus;
  const isActive = (currentStatus || 'ACTIVE').toUpperCase() === 'ACTIVE';

  // Tự động chuyển về tab 'general' nếu vai trò không phải Huấn luyện viên
  useEffect(() => {
    if (!isTrainer && activeTab === 'trainer') {
      setActiveTab('general');
    }
  }, [isTrainer, activeTab]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-[12px] p-8 border border-[#E2E8F0] shadow-xs flex flex-col items-center justify-center min-h-[460px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#064343]" />
        <p className="text-[14px] text-[#64748B]">Đang tải thông tin chi tiết nhân viên...</p>
      </div>
    );
  }

  // Error state
  if (isError || !employee) {
    return (
      <div className="w-full bg-white rounded-[12px] p-8 border border-[#E2E8F0] shadow-xs min-h-[460px] flex flex-col justify-center">
        <ConnectionErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col min-h-full">
      {/* Toast Alert – Canh giữa chính xác theo khung nhìn nội dung (đã bù trừ 260px Sidebar) */}
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

      {/* ─── Card lớn Chi tiết nhân viên (Đồng bộ 100% Style Form nhập trên Slide Panel) ─── */}
      <div className="relative w-full flex-1 bg-white rounded-[12px] p-6 sm:p-[28px_32px] border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-h-[calc(100vh-140px)]">
        {/* Thanh stroke 4px sát mép ngoài bên trái vuông góc theo đúng thiết kế Figma */}
        <div className="absolute left-0 top-7 w-[4px] h-6 bg-[#064343] rounded-none" />

        {/* 1. Header Title */}
        <div className="flex items-center">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            {isEditing ? 'Chỉnh sửa thông tin nhân viên' : 'Chi tiết nhân viên'}
          </h2>
        </div>

        {/* 2. Subheader Toolbar: Tabs bên trái & Metadata bên phải song song trên 1 hàng căn giữa cân đối */}
        <div className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-4 my-6">
          {/* Tabs bên trái */}
          <div className="flex items-center gap-2 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'general'
                  ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
              }`}
            >
              Thông tin chung
            </button>
            {isTrainer && (
              <button
                type="button"
                onClick={() => setActiveTab('trainer')}
                className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'trainer'
                    ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
                }`}
              >
                Chuyên môn &amp; Đánh giá
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isEditing) handleCancelEdit();
                setActiveTab('history');
              }}
              className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
              }`}
            >
              Lịch sử
            </button>
            <button
              type="button"
              onClick={() => {
                if (isEditing) handleCancelEdit();
                setActiveTab('notes');
              }}
              className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
              }`}
            >
              Ghi chú
            </button>
          </div>

          {/* Metadata bên phải song song với Tabs */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] justify-start xl:justify-end shrink-0">
            {/* Mã nhân viên */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium">Mã nhân viên:</span>
              <span className="font-bold text-[13px] text-[#064343]">
                {employee.employeeCode || '—'}
              </span>
            </div>

            {/* Ngày tạo */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium">Ngày tạo:</span>
              <span className="text-[#202939] font-medium text-[12px]">
                {formatDateTime(employee.createdDate)}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            {/* Chức danh */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium">Chức danh:</span>
              <span className="text-[13px] font-semibold text-[#10B981]">
                {formatPosition(currentPosition)}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            {/* Trạng thái */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium">Trạng thái:</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold leading-tight text-white ${
                  isActive ? 'bg-[#22C55E]' : 'bg-[#64748B]'
                }`}
              >
                {isActive ? 'Đang làm việc' : 'Đã nghỉ việc'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Nội dung Tab 1: THÔNG TIN CHUNG (Form Style chuẩn Slide Panel) */}
        {activeTab === 'general' && (
          <div className="flex flex-col space-y-8">
            {/* ── KHỐI 1: THÔNG TIN CƠ BẢN ── */}
            <div className="bg-white">
              <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG TIN CƠ BẢN
                </h4>
              </div>

              {/* Grid 3 cột thụt lề 2 bên px-5 theo chuẩn thiết kế */}
              <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                {/* Họ và tên nhân viên (*) */}
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
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrors((p) => ({ ...p, fullName: '' }));
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
                    <Select value={gender} onValueChange={setGender}>
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
                      value={dateOfBirth}
                      onChange={setDateOfBirth}
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
                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
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

                {/* Vai trò / Chức danh (*) */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Vai trò {isEditing && <span className="text-[#EE0033]">*</span>}
                  </label>
                  {isEditing ? (
                    <Select
                      value={position}
                      onValueChange={(val) => {
                        setPosition(val);
                        setErrors((p) => ({ ...p, position: '' }));
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
                    <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                      />
                    </div>
                  ) : (
                    <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                      {employee.phoneNumber || '—'}
                    </div>
                  )}
                </div>

                {/* Email công vụ (*) */}
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
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((p) => ({ ...p, email: '' }));
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

                {/* Hệ số lương HLV */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939]">Hệ số lương HLV</label>
                  {isEditing ? (
                    <div
                      className={`h-[42px] px-3.5 py-2 rounded-[8px] flex items-center border ${
                        position === 'TRAINER'
                          ? 'bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="number"
                        step="0.1"
                        disabled={position !== 'TRAINER'}
                        value={salaryCoefficient}
                        onChange={(e) => setSalaryCoefficient(e.target.value)}
                        placeholder="Ví dụ: 1.5"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                      />
                    </div>
                  ) : (
                    <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                      {employee.trainerInfo?.salaryCoefficient !== undefined &&
                      employee.trainerInfo?.salaryCoefficient !== null
                        ? `x${employee.trainerInfo.salaryCoefficient}`
                        : '1.0'}
                    </div>
                  )}
                </div>

                {/* Địa chỉ thường trú */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939]">Địa chỉ thường trú</label>
                  {isEditing ? (
                    <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
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

                {/* Số CCCD (Khóa - Định danh pháp lý) */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939]">Số CCCD (Cố định)</label>
                  <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] text-[#202939] cursor-not-allowed">
                    {employee.nationalId || '—'}
                  </div>
                </div>

                {/* Mức lương cơ bản (*) */}
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
                        value={baseSalaryRate}
                        onChange={(e) => {
                          setBaseSalaryRate(e.target.value);
                          setErrors((p) => ({ ...p, baseSalaryRate: '' }));
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập ghi chú"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939] truncate"
                      title={employee.trainerInfo?.description || description || undefined}
                    >
                      {employee.trainerInfo?.description || description || '—'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Nội dung Tab 2: CHUYÊN MÔN & ĐÁNH GIÁ (Theo chuẩn Figma #1425:18047) ─── */}
        {activeTab === 'trainer' && (
          <div className="flex flex-col space-y-8">
            {isTrainer ? (
              <>
                {/* ── KHỐI 1: HỒ SƠ HLV ── */}
                <div className="bg-white">
                  <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
                    <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                      HỒ SƠ HLV
                    </h4>
                  </div>

                  {/* 5 trường thông tin chuyên môn dạng input bị khóa như bên Thông tin chung */}
                  <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-5">
                    {/* 1. Chuyên môn */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Chuyên môn {isEditing && <span className="text-[#EE0033]">*</span>}
                      </label>
                      {isEditing ? (
                        <Select value={specializationId} onValueChange={setSpecializationId}>
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
                          {employee.trainerInfo?.specializationName ||
                            SPECIALIZATION_OPTIONS.find(
                              (opt) => opt.id === employee.trainerInfo?.specializationId
                            )?.name ||
                            'Gym Fitness & Thể hình'}
                        </div>
                      )}
                    </div>

                    {/* 2. Số năm kinh nghiệm */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Số năm kinh nghiệm {isEditing && <span className="text-[#EE0033]">*</span>}
                      </label>
                      {isEditing ? (
                        <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                          <input
                            type="number"
                            min="1"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
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
                    </div>

                    {/* 3. Đơn giá buổi dạy */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Đơn giá buổi dạy
                      </label>
                      <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between text-[14px] font-semibold text-[#064343]">
                        <span>500.000</span>
                        <div className="flex items-center gap-1.5 text-[#064343]">
                          <div className="w-[1px] h-3.5 bg-slate-300" />
                          <span className="text-[13px] font-semibold">₫</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Hệ lương */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Hệ lương
                      </label>
                      {isEditing ? (
                        <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                          <input
                            type="number"
                            step="0.1"
                            value={salaryCoefficient}
                            onChange={(e) => setSalaryCoefficient(e.target.value)}
                            placeholder="Ví dụ: 1.8"
                            className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                          />
                        </div>
                      ) : (
                        <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] font-medium text-[#202939]">
                          {employee.trainerInfo?.salaryCoefficient !== undefined &&
                          employee.trainerInfo?.salaryCoefficient !== null
                            ? employee.trainerInfo.salaryCoefficient
                            : '—'}
                        </div>
                      )}
                    </div>

                    {/* 5. Đánh giá */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Đánh giá
                      </label>
                      <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between gap-3">
                        <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#064343] rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, (((employee.trainerInfo?.ratingAvg ?? 4.9) / 5) * 100))
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-[13px] text-[#011010] shrink-0">
                          {(employee.trainerInfo?.ratingAvg ?? 4.9).toFixed(1)}
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

                  {/* Empty state chuẩn 100% Figma */}
                  <div className="w-full flex flex-col items-center justify-center py-12 sm:py-16">
                    <img
                      src="/images/empty-rating.svg"
                      alt="Chưa có đánh giá nào gần đây"
                      className="w-[104px] h-[121px] object-contain mb-4"
                    />
                    <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
                      Chưa có đánh giá nào gần đây
                    </p>
                  </div>
                </div>
              </>
            ) : (
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
            )}
          </div>
        )}

        {/* ─── Nội dung Tab 3: LỊCH SỬ THAY ĐỔI (Trạng thái trống đồng bộ chuẩn tab chuyên môn) ─── */}
        {activeTab === 'history' && (
          <div className="bg-white flex-1 flex flex-col">
            <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
              <h4 className="text-[14px] font-semibold text-[#011010] tracking-[-0.0069em] uppercase">
                NHẬT KÝ THAY ĐỔI THÔNG TIN
              </h4>
            </div>

            {/* Empty state chuẩn 100% như bên tab chuyên môn */}
            <div className="w-full flex-1 flex flex-col items-center justify-center py-12 sm:py-16">
              <img
                src="/images/empty-rating.svg"
                alt="Chưa có thay đổi nào gần đây"
                className="w-[104px] h-[121px] object-contain mb-4"
              />
              <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
                Chưa có thay đổi nào gần đây
              </p>
            </div>
          </div>
        )}

        {/* ─── Nội dung Tab 4: GHI CHÚ (Trạng thái trống đồng bộ chuẩn các tab còn lại) ─── */}
        {activeTab === 'notes' && (
          <div className="bg-white flex-1 flex flex-col">
            <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
              <h4 className="text-[14px] font-semibold text-[#011010] tracking-[-0.0069em] uppercase">
                GHI CHÚ NỘI BỘ
              </h4>
            </div>

            {/* Empty state chuẩn 100% như các tab còn lại */}
            <div className="w-full flex-1 flex flex-col items-center justify-center py-12 sm:py-16">
              <img
                src="/images/empty-rating.svg"
                alt="Chưa có ghi chú nào gần đây"
                className="w-[104px] h-[121px] object-contain mb-4"
              />
              <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
                Chưa có ghi chú nào gần đây
              </p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

export default EmployeeDetailPage;
