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

  const isFormFilled = email.trim().length > 0;

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {/* Khung thẻ trắng bo góc chuẩn Figma với padding thoáng và kích thước cân đối */}
      <div className="bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.22)] p-8 sm:px-12 sm:pt-9 sm:pb-13 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          {/* Logo Badge hình tròn nền xanh đậm #064343 phẳng (không shadow) */}
          <div className="w-16 h-16 rounded-full bg-[#064343] flex items-center justify-center mb-3.5 mx-auto">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>

          {/* Tiêu đề font-heading Bold đậm nét text-2xl */}
          <h1 className="font-heading font-bold text-2xl sm:text-[26px] leading-tight text-[#0A0A0A] text-center tracking-tight">
            QUÊN MẬT KHẨU
          </h1>

          {/* Mô tả phụ - Chuẩn Design System 14px */}
          <p className="font-sans text-xs sm:text-sm leading-relaxed text-muted-foreground text-center mt-2 max-w-[440px]">
            Nhập địa chỉ email liên kết với tài khoản của bạn để lấy lại mật khẩu!
          </p>
        </div>

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
            value={email}
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

          {/* Tiện ích chuyển về Đăng nhập */}
          <div className="flex items-center gap-1.5 pt-0.5 text-xs sm:text-sm font-normal text-muted-foreground">
            <span>Bạn đã nhớ tài khoản?</span>
            <Link
              href="/login"
              className="font-semibold text-[#064343] hover:underline transition-colors"
            >
              Đăng nhập
            </Link>
          </div>

          {/* Nút Lấy lại mật khẩu - Chữ trắng tinh !text-white, style regular, hoàn toàn không có hover */}
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
              <span className="text-white font-normal">Lấy lại mật khẩu</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Toast Alert – Góc phải màn hình */}
      {errors.general && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[420px] w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Alert
            variant="danger"
            onClose={() => setErrors((prev) => ({ ...prev, general: undefined }))}
            className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-border bg-white"
          >
            {errors.general}
          </Alert>
        </div>
      )}
    </div>
  );
}
