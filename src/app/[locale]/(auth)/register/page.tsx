'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { Alert, Button, Input } from '@/components/ui';
import { Dumbbell } from 'lucide-react';
import {
  RegisterFormData,
  FormErrors,
  validateAuthField,
  validateRegisterForm,
  parseAuthBackendError,
} from '@/lib/validators/authValidators';

const INITIAL_FORM_DATA: RegisterFormData = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
};

export default function RegisterPage() {
  const router = useRouter();

  // Form State gom gọn trong 1 object duy nhất
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Auto-dismiss general error alert sau 6s
  useEffect(() => {
    if (errors.general) {
      const timer = setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: undefined }));
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

    // Nếu trường đang có lỗi thì live re-validate
    if (errors[name as keyof FormErrors]) {
      const fieldErr = validateAuthField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldErr }));
    }
  };

  // 1 hàm duy nhất xử lý blur cho mọi input
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldErr = validateAuthField(name, value);
    if (fieldErr) {
      setErrors((prev) => ({ ...prev, [name]: fieldErr }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate toàn bộ form trước khi gửi
    const formErrors = validateRegisterForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = formData.phoneNumber.trim().replace(/[\s.-]/g, '');
      const res = await authService.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: cleanPhone,
        password: formData.password,
      });

      if (res.success) {
        const registeredEmail = formData.email.trim();
        setFormData(INITIAL_FORM_DATA);
        setErrors({});

        router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`);
      } else {
        setErrors({ general: 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.' });
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
      <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,0,0,0.2)] px-8 sm:px-12 md:px-14 py-8 sm:py-10 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] flex items-center justify-center shadow-none mb-3.5">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>

          <h1 className="font-sans font-semibold text-[26px] sm:text-[28px] leading-tight sm:leading-[34px] tracking-[-0.0075em] text-[#0A0A0A]">
            ĐĂNG KÝ TÀI KHOẢN
          </h1>
          <p className="font-sans text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#525252] text-center mt-1.5">
            Chào mừng bạn đến với GymX, đăng ký ngay để bắt đầu
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">
          {/* Full Name */}
          <Input
            name="fullName"
            label="Họ tên"
            required
            type="text"
            placeholder="Nhập họ tên của bạn"
            value={formData.fullName}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            className="bg-transparent focus:bg-transparent"
          />

          {/* Email */}
          <Input
            name="email"
            label="Email"
            required
            type="email"
            placeholder="nguyenvana@gmail.com"
            value={formData.email}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            className="bg-transparent focus:bg-transparent"
          />

          {/* Phone Number */}
          <Input
            name="phoneNumber"
            label="Số điện thoại"
            required
            type="tel"
            placeholder="0987654321"
            value={formData.phoneNumber}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phoneNumber}
            className="bg-transparent focus:bg-transparent"
          />

          {/* Password */}
          <Input
            name="password"
            label="Mật khẩu"
            required
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            showPasswordToggle
            value={formData.password}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            className="bg-transparent focus:bg-transparent"
          />

          {/* Submit Button – dạng Active theo chuẩn Figma 21:2, không icon */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full h-11 text-sm sm:text-base font-semibold rounded-lg bg-[#FF6B00] text-white hover:bg-[#FF8833] cursor-pointer shadow-none transition-all duration-200"
            >
              Đăng ký
            </Button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="mt-5 pt-4 border-t border-[#E5E5E5] text-center font-sans text-xs sm:text-sm text-[#525252]">
          Bạn đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#FF6B00] hover:text-[#FF8833] hover:underline transition-colors ml-1"
          >
            Đăng nhập
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
