'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { useGuestGuard } from '@/lib/hooks';
import { Alert, Button, Input } from '@/components/ui';
import { Dumbbell } from 'lucide-react';
import {
  type FormErrors,
  validateEmail,
  parseAuthBackendError,
} from '@/lib/utils';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Chặn truy cập ngược: Nếu đã có phiên đăng nhập -> tự động đẩy về Dashboard tương ứng
  const { isCheckingAuth } = useGuestGuard();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // F5 Reset: Xóa sạch dữ liệu khi tải lại trang hoặc mở từ cache trình duyệt
  useEffect(() => {
    setEmail('');
    setErrors({});
    formRef.current?.reset();

    const handlePageShow = () => {
      setEmail('');
      setErrors({});
      formRef.current?.reset();
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Tự động đóng Toast thông báo lỗi sau 6 giây
  useEffect(() => {
    if (errors.general) {
      const timer = setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: undefined }));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errors.general]);

  const handleFocus = () => {
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);

    if (errors.email) {
      const fieldErr = validateEmail(val);
      setErrors((prev) => ({ ...prev, email: fieldErr }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldErr = validateEmail(e.target.value);
    if (fieldErr) {
      setErrors((prev) => ({ ...prev, email: fieldErr }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim();
      await authService.forgotPassword({ email: cleanEmail });

      // Chuyển hướng sang trang xác thực OTP với query flow=reset-password
      router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}&flow=reset-password`);
    } catch (err: any) {
      setErrors(parseAuthBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="w-full max-w-[560px] mx-auto py-6">
      {/* Khung thẻ kính mờ chuẩn Figma 172:1371 (max-w-[560px], bo góc 32px) */}
      <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,0,0,0.2)] px-8 sm:px-12 md:px-14 py-8 sm:py-10 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Logo Badge 14x14 (56px) bo góc 2xl cam #FF6B00, không shadow */}
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] flex items-center justify-center shadow-none mb-3.5">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>

          {/* Tiêu đề Inter SemiBold 26px/28px */}
          <h1 className="font-sans font-semibold text-[26px] sm:text-[28px] leading-tight sm:leading-[34px] tracking-[-0.0075em] text-[#0A0A0A]">
            QUÊN MẬT KHẨU
          </h1>

          {/* Mô tả phụ chuẩn Figma 172:1386 */}
          <p className="font-sans text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#525252] text-center mt-1.5">
            Nhập địa chỉ email liên kết với tài khoản của bạn để lấy lại mật khẩu!
          </p>
        </div>

        {/* Form Fields */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">
          {/* Trường Email */}
          <Input
            name="email"
            label="Email"
            required
            type="email"
            autoComplete="off"
            placeholder="nguyenvana@gmail.com"
            value={email}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            className="bg-transparent focus:bg-transparent"
          />

          {/* Tiện ích chuyển về Đăng nhập chuẩn Figma 172:1390 */}
          <div className="flex items-center gap-1.5 pt-0.5 text-xs sm:text-sm font-normal text-[#525252]">
            <span>Bạn đã nhớ tài khoản?</span>
            <Link
              href="/login"
              className="font-semibold text-[#FF6B00] hover:text-[#FF8833] hover:underline transition-colors"
            >
              Đăng nhập
            </Link>
          </div>

          {/* Nút Lấy lại mật khẩu – Chuẩn flat Figma, shadow-none, 44px */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              className="w-full h-11 text-sm sm:text-base font-semibold rounded-lg bg-[#FF6B00] text-white hover:bg-[#FF8833] cursor-pointer shadow-none transition-all duration-200"
            >
              Lấy lại mật khẩu
            </Button>
          </div>
        </form>

        {/* Footer Navigation */}
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
            onClose={() => setErrors((prev) => ({ ...prev, general: undefined }))}
            className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#E5E5E5] bg-white"
          >
            {errors.general}
          </Alert>
        </div>
      )}
    </div>
  );
}
