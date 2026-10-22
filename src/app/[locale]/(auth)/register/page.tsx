'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { Button, Input } from '@/components/ui';
import {
  AlertCircle,
  ArrowRight,
  Dumbbell,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react';

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation & Loading State
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    terms?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên của bạn.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có tối thiểu 2 ký tự.';
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Địa chỉ email không đúng định dạng.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
    } else if (!/(0|\+84)[3|5|7|8|9][0-9]{8}\b/.test(phoneNumber.trim().replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (gồm 10 chữ số).';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có tối thiểu 8 ký tự.';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Bạn cần đồng ý với Điều khoản và Chính sách bảo mật.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
      });

      if (res.success) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        setErrors({ general: 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.' });
      }
    } catch (err: any) {
      const errCode = err.response?.data?.error?.code || err.response?.data?.code;
      const errMsg = err.response?.data?.error?.description || err.response?.data?.message || err.message;

      if (errCode === 'Auth.EmailExists') {
        setErrors({ email: 'Email này đã được đăng ký trong hệ thống.' });
      } else if (errCode === 'Auth.PhoneExists') {
        setErrors({ phoneNumber: 'Số điện thoại này đã được đăng ký.' });
      } else {
        setErrors({ general: errMsg || 'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      // Sẵn sàng tích hợp luồng Google OAuth hoặc SDK
      console.log('Initiate Google sign-up flow');
    } catch (error) {
      console.error(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[620px] mx-auto py-6">
      {/* Main Card - Styled as per Figma node 1277:10767 */}
      <div className="bg-white rounded-[32px] border border-[#E5E5E5] shadow-[0px_4px_24px_rgba(0,0,0,0.08)] px-6 sm:px-12 md:px-14 py-10 sm:py-12 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo Badge (80x80px rounded-full #FF6B00) */}
          <div className="w-20 h-20 rounded-full bg-[#FF6B00] flex items-center justify-center shadow-[0_8px_20px_rgba(255,107,0,0.3)] mb-5">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-[#0A0A0A] font-['Plus_Jakarta_Sans',sans-serif] leading-tight mb-2">
            ĐĂNG KÝ TÀI KHOẢN
          </h1>
          <p className="text-sm sm:text-base text-[#525252] font-normal leading-relaxed">
            Chào mừng bạn tới với hệ thống, đăng nhập để bắt đầu
          </p>
        </div>

        {/* Global Error Alert */}
        {errors.general && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <p className="flex-1">{errors.general}</p>
          </div>
        )}

        {/* Social Register Button (Google) */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            isLoading={googleLoading}
            onClick={handleGoogleSignUp}
            leftIcon={<GoogleIcon className="w-4 h-4 shrink-0" />}
            className="w-full h-11 text-sm font-medium text-[#0A0A0A] border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] rounded-lg shadow-sm"
          >
            Đăng ký bằng Google
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mt-6 mb-2">
            <div className="border-t border-[#E5E5E5] w-full" />
            <span className="bg-white px-3 text-xs sm:text-sm text-[#A3A3A3] whitespace-nowrap absolute">
              hoặc đăng ký bằng
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <Input
            label="Họ tên"
            required
            type="text"
            placeholder="Nhập họ tên của bạn"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            leftIcon={<User className="size-4" />}
            error={errors.fullName}
          />

          {/* Email */}
          <Input
            label="Email"
            required
            type="email"
            placeholder="nguyenvana@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            leftIcon={<Mail className="size-4" />}
            error={errors.email}
          />

          {/* Phone Number */}
          <Input
            label="Số điện thoại"
            required
            type="tel"
            placeholder="0334841260"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
            }}
            leftIcon={<Phone className="size-4" />}
            error={errors.phoneNumber}
          />

          {/* Password */}
          <Input
            label="Mật khẩu"
            required
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            showPasswordToggle
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            leftIcon={<Lock className="size-4" />}
            error={errors.password}
          />

          {/* Terms & Conditions Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
                className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/20 accent-[#FF6B00] cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-[#525252] leading-normal">
                Tôi đồng ý với{' '}
                <Link href="/terms" className="text-primary hover:underline font-medium">
                  Điều khoản
                </Link>{' '}
                và{' '}
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  Chính sách bảo mật
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-normal">
                {errors.terms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              rightIcon={<ArrowRight className="size-4" />}
              className="w-full h-11 text-sm font-semibold rounded-lg shadow-[0_4px_14px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.4)]"
            >
              Đăng ký
            </Button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 text-center text-xs sm:text-sm text-[#525252]">
          Bạn đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary-light hover:underline transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
