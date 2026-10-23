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

  return (
    <div className="w-full max-w-[560px] mx-auto py-6">
      {/* Khung thẻ kính mờ đồng bộ hoàn toàn với form Đăng ký (bo góc 32px, max-w-[560px]) */}
      <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,0,0,0.2)] px-8 sm:px-12 md:px-14 py-8 sm:py-10 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Logo Badge 14x14 (56px) bo góc 2xl cam #FF6B00, không shadow */}
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] flex items-center justify-center shadow-none mb-3.5">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>

          {/* Tiêu đề chuẩn Inter SemiBold 26px/28px */}
          <h1 className="font-sans font-semibold text-[26px] sm:text-[28px] leading-tight sm:leading-[34px] tracking-[-0.0075em] text-[#0A0A0A]">
            ĐĂNG NHẬP TÀI KHOẢN
          </h1>

          {/* Mô tả phụ font-normal 14px/15px */}
          <p className="font-sans text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#525252] text-center mt-1.5">
            Chào mừng bạn đến với GymX, đăng nhập để bắt đầu
          </p>
        </div>

        {/* Banner thông báo phiên nếu đang đăng nhập sẵn */}
        {_hasHydrated && isAuthenticated && user && (
          <div className="mb-5 p-3 rounded-xl bg-[#FFF4EC] border border-[#FFD8BF] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="text-[#8C3A00] truncate">
              <span>Đang đăng nhập: </span>
              <span className="font-bold">{user.email}</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF6B00] text-white">
                {user.roles?.[0]}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={primaryRole() ? DASHBOARD_MAP[primaryRole()!] ?? '/' : '/'}
                className="font-bold text-[#FF6B00] hover:underline"
              >
                Vào Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="text-[#525252] hover:text-red-600 underline font-medium cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* Form Fields – khoảng cách space-y-4 đồng nhất với form Đăng ký */}
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
            className="bg-transparent focus:bg-transparent"
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
            className="bg-transparent focus:bg-transparent"
          />

          {/* Hàng Tiện ích: Checkbox trong design system & Quên mật khẩu? */}
          <div className="flex items-center justify-between pt-0.5">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked)}
              label="Nhớ tài khoản"
            />

            <Link
              href="/forgot-password"
              className="text-sm font-normal text-[#FF6B00] hover:text-[#FF8833] hover:underline transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Nút Đăng nhập – Không shadow (shadow-none), chuẩn flat Figma theo design system */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              className="w-full h-11 text-sm sm:text-base font-semibold rounded-lg bg-[#FF6B00] text-white hover:bg-[#FF8833] cursor-pointer shadow-none transition-all duration-200"
            >
              Đăng nhập
            </Button>
          </div>
        </form>

        {/* Footer Navigation – viền trên border-t #E5E5E5 đồng bộ form Đăng ký */}
        <div className="mt-5 pt-4 border-t border-[#E5E5E5] text-center font-sans text-xs sm:text-sm text-[#525252]">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#FF6B00] hover:text-[#FF8833] hover:underline transition-colors ml-1"
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
            className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#E5E5E5] bg-white"
          >
            <div>
              <p className="text-sm">{errors.general}</p>
              {errors.unverifiedEmail && (
                <Link
                  href={`/verify-email?email=${encodeURIComponent(formData.email.trim())}`}
                  className="mt-2 inline-flex items-center gap-1 font-bold text-[#FF6B00] hover:underline text-xs"
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
