'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks';
import { Alert, Button, Checkbox, ConfirmDialog, Input } from '@/components/ui';
import { Dumbbell, ArrowRight } from 'lucide-react';
import {
  type LoginFormData,
  type FormErrors,
  validateAuthField,
  validateLoginForm,
  parseAuthBackendError,
} from '@/lib/utils';
import type { UserRole } from '@/types/auth';

const DASHBOARD_MAP: Record<UserRole, string> = {
  ADMIN: '/admin',
  RECEPTIONIST: '/receptionist',
  TRAINER: '/trainer',
  MEMBER: '/member',
};

const INITIAL_FORM_DATA: LoginFormData = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const router = useRouter();
  const { login: loginToStore, user, isAuthenticated, _hasHydrated, primaryRole } = useAuthStore();
  const formRef = useRef<HTMLFormElement>(null);

  // Hook đăng xuất đồng bộ chuẩn toàn hệ thống (không chuyển hướng khỏi trang login khi logout)
  const { isLogoutOpen, setIsLogoutOpen, isLoggingOut, handleLogout } = useLogout({ redirectTo: null });

  // Form State gom gọn trong 1 object duy nhất (chuẩn cấu trúc như RegisterPage)
  const [formData, setFormData] = useState<LoginFormData>(INITIAL_FORM_DATA);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Khi tải lại trang (F5) hoặc mở từ cache: xóa sạch toàn bộ thông tin form vừa nhập
  useEffect(() => {
    setFormData(INITIAL_FORM_DATA);
    setRememberMe(false);
    setErrors({});
    formRef.current?.reset();

    const handlePageShow = () => {
      setFormData(INITIAL_FORM_DATA);
      setRememberMe(false);
      setErrors({});
      formRef.current?.reset();
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Auto-dismiss thông báo lỗi sau 6 giây
  useEffect(() => {
    if (errors.general) {
      const timer = setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: undefined, unverifiedEmail: undefined }));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errors.general]);

  // Khi focus vào bất kỳ ô nào -> xóa toàn bộ lỗi để người dùng nhập mới
  const handleFocus = () => {
    setErrors({});
  };

  // 1 hàm duy nhất xử lý nhập liệu cho mọi input qua e.target.name
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live re-validate nếu trường hiện tại đang báo lỗi
    if (errors[name as keyof FormErrors]) {
      const fieldErr = validateAuthField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldErr }));
    }
  };

  // 1 hàm duy nhất xử lý blur cho mọi input qua e.target.name
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldErr = validateAuthField(name, value);
    if (fieldErr) {
      setErrors((prev) => ({ ...prev, [name]: fieldErr }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate toàn bộ form trước khi gửi request
    const formErrors = validateLoginForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res.success && res.data) {
        // Lưu dữ liệu vào Zustand store (user info + in-memory accessToken)
        loginToStore(res.data);

        // Lấy role ưu tiên cao nhất: ADMIN > RECEPTIONIST > TRAINER > MEMBER
        const roles = res.data.roles || [];
        const priority: UserRole[] = ['ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER'];
        const highestRole = priority.find((r) => roles.includes(r));
        const redirectPath = highestRole ? DASHBOARD_MAP[highestRole] ?? '/' : '/';

        router.push(redirectPath);
      } else {
        setErrors({ general: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
      }
    } catch (err: any) {
      // Bóc tách lỗi backend thông minh (FluentValidation + mã lỗi nghiệp vụ)
      setErrors(parseAuthBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = formData.email.trim().length > 0 && formData.password.length > 0;

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {/* Khung thẻ trắng bo góc chuẩn Figma Node 1329:15756 với padding thoáng và kích thước cân đối */}
      <div className="bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.22)] p-8 sm:px-12 sm:pt-9 sm:pb-11 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          {/* Logo Badge hình tròn nền xanh đậm #064343 phẳng (không shadow) */}
          <div className="w-16 h-16 rounded-full bg-[#064343] flex items-center justify-center mb-3.5 mx-auto">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>

          {/* Tiêu đề chuẩn font-heading Bold đậm nét text-2xl */}
          <h1 className="font-heading font-bold text-2xl sm:text-[26px] leading-tight text-[#0A0A0A] text-center tracking-tight">
            ĐĂNG NHẬP TÀI KHOẢN
          </h1>

          {/* Mô tả phụ - Chuẩn Design System 14px */}
          <p className="font-sans text-xs sm:text-sm leading-relaxed text-muted-foreground text-center mt-2 max-w-[440px]">
            Chào mừng bạn tới với hệ thống, đăng nhập để bắt đầu
          </p>
        </div>

        {/* Banner thông báo phiên nếu đang đăng nhập sẵn */}
        {_hasHydrated && isAuthenticated && user && (
          <div className="mb-5 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="text-[#064343] truncate">
              <span>Đang đăng nhập: </span>
              <span className="font-medium">{user.email}</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                {user.roles?.[0]}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={primaryRole() ? DASHBOARD_MAP[primaryRole()!] ?? '/' : '/'}
                className="font-medium text-[#3A5A00] hover:underline"
              >
                Vào Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="text-muted-foreground hover:text-red-600 underline font-normal cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* Form Fields – default không stroke, khi nhập stroke trùng màu logo #064343, khi có lỗi hiện viền đỏ */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">
          {/* Trường Email */}
          <Input
            name="email"
            label="Email"
            required
            type="email"
            autoComplete="off"
            placeholder="nguyenvana@gmail.com"
            value={formData.email}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            className={`h-[46px] bg-[#F4F5F6] rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none ${
              !errors.email
                ? 'border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white'
                : ''
            }`}
          />

          {/* Trường Mật khẩu */}
          <Input
            name="password"
            label="Mật khẩu"
            required
            type="password"
            autoComplete="new-password"
            placeholder="Nhập mật khẩu của bạn"
            showPasswordToggle
            value={formData.password}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            className={`h-[46px] bg-[#F4F5F6] rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none ${
              !errors.password
                ? 'border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white'
                : ''
            }`}
          />

          {/* Hàng Tiện ích: Checkbox & Quên mật khẩu? */}
          <div className="flex items-center justify-between pt-0.5">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked)}
              label="Nhớ tài khoản"
              className="text-xs sm:text-sm text-[#525252]"
            />

            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm font-medium text-[#064343] hover:text-[#085555] hover:underline transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Nút Đăng nhập - Chữ trắng tinh !text-white, style regular, hoàn toàn không có hover */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="auth"
              size="lg"
              isLoading={loading}
              disabled={loading}
              className={`w-full h-12 text-[14px] !font-normal rounded-lg !text-white active:scale-[0.99] transition-none cursor-pointer shadow-sm ${
                isFormFilled ? 'opacity-100 shadow-md' : 'opacity-60'
              }`}
            >
              <span className="text-white font-normal">Đăng nhập</span>
            </Button>
          </div>
        </form>

        {/* Footer Navigation - không gạch ngang */}
        <div className="mt-5 text-center font-sans text-xs sm:text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#064343] hover:underline transition-colors ml-1"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>

      {/* Toast Alert – Góc phải màn hình */}
      {errors.general && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[420px] w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Alert
            variant="danger"
            onClose={() => setErrors((prev) => ({ ...prev, general: undefined, unverifiedEmail: undefined }))}
            className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-border bg-white"
          >
            <div>
              <p className="text-sm">{errors.general}</p>
              {errors.unverifiedEmail && (
                <Link
                  href={`/verify-email?email=${encodeURIComponent(formData.email.trim())}`}
                  className="mt-2 inline-flex items-center gap-1 font-medium text-[#3A5A00] hover:underline text-xs"
                >
                  Xác thực email ngay <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </Alert>
        </div>
      )}

      {/* Pop Up xác nhận đăng xuất chuẩn Figma 51:401 */}
      <ConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        state="logout"
        isLoading={isLoggingOut}
      />
    </div>
  );
}
