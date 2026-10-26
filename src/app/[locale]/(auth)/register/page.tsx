'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { Alert, Button, Input } from '@/components/ui';
import { Dumbbell } from 'lucide-react';
import {
  type RegisterFormData,
  type FormErrors,
  validateAuthField,
  validateRegisterForm,
  parseAuthBackendError,
} from '@/lib/utils';

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

  const isFormFilled = Boolean(
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phoneNumber.trim() &&
    formData.password
  );

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {/* Khung thẻ trắng bo góc chuẩn Figma với padding thoáng và kích thước cân đối */}
      <div className="bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.22)] p-8 sm:px-12 sm:pt-9 sm:pb-11 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          {/* Logo Badge hình tròn nền xanh đậm #064343 phẳng (không shadow) */}
          <div className="w-16 h-16 rounded-full bg-[#064343] flex items-center justify-center mb-3.5 mx-auto">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>

          {/* Tiêu đề font-heading Bold đậm nét text-2xl */}
          <h1 className="font-heading font-bold text-2xl sm:text-[26px] leading-tight text-[#0A0A0A] text-center tracking-tight">
            ĐĂNG KÝ TÀI KHOẢN
          </h1>
          <p className="font-sans text-xs sm:text-sm leading-relaxed text-muted-foreground text-center mt-2 max-w-[440px]">
            Chào mừng bạn đến với GymX, đăng ký ngay để bắt đầu
          </p>
        </div>

        {/* Form Fields – default không stroke, khi nhập stroke trùng màu logo #064343, khi có lỗi hiện viền đỏ */}
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
            className={`h-[46px] bg-[#F4F5F6] rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none ${
              !errors.fullName
                ? 'border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white'
                : ''
            }`}
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
            className={`h-[46px] bg-[#F4F5F6] rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none ${
              !errors.email
                ? 'border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white'
                : ''
            }`}
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
            className={`h-[46px] bg-[#F4F5F6] rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none ${
              !errors.phoneNumber
                ? 'border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white'
                : ''
            }`}
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
            className={`h-[46px] bg-[#F4F5F6] rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none ${
              !errors.password
                ? 'border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white'
                : ''
            }`}
          />

          {/* Submit Button - Chữ trắng tinh !text-white, style regular, hoàn toàn không có hover */}
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
              <span className="text-white font-normal">Đăng ký</span>
            </Button>
          </div>
        </form>

        {/* Footer Navigation - không gạch ngang */}
        <div className="mt-5 text-center font-sans text-xs sm:text-sm text-muted-foreground">
          Bạn đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#064343] hover:underline transition-colors ml-1"
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
            className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-border bg-white"
          >
            {errors.general}
          </Alert>
        </div>
      )}
    </div>
  );
}
