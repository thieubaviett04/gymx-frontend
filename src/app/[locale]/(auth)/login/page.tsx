'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { Alert, Button, Input } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

type FormErrors = {
  email?: string;
  password?: string;
};

function validateField(name: string, value: string): string | undefined {
  switch (name) {
    case 'email':
      if (!value.trim()) return 'Email không được để trống.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Email không đúng định dạng.';
      return undefined;
    case 'password':
      if (!value) return 'Mật khẩu không được để trống.';
      return undefined;
    default:
      return undefined;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const loginToStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  // Auto-dismiss error alert after 6 seconds
  React.useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setUnverifiedEmail(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleFocus = () => {
    setErrors({});
    setErrorMsg(null);
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    if (err) {
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleChange = (field: string, value: string) => {
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    (Object.keys(newErrors) as (keyof FormErrors)[]).forEach((k) => {
      if (newErrors[k] === undefined) delete newErrors[k];
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ email: true, password: true });
    setErrorMsg(null);
    setUnverifiedEmail(false);

    if (!validateAll()) return;

    setLoading(true);

    try {
      const res = await authService.login({ email: email.trim(), password });

      if (res.success && res.data) {
        loginToStore(res.data);

        const roles = res.data.roles || [];
        if (roles.includes('ADMIN')) {
          router.push('/admin');
        } else if (roles.includes('TRAINER')) {
          router.push('/trainer');
        } else if (roles.includes('RECEPTIONIST')) {
          router.push('/receptionist');
        } else {
          router.push('/member');
        }
      } else {
        setErrorMsg('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      const errCode = err.response?.data?.error?.code || err.response?.data?.code;
      const errMsg = err.response?.data?.error?.description || err.response?.data?.message || err.message;

      if (errCode === 'Auth.UnverifiedEmail') {
        setUnverifiedEmail(true);
        setErrorMsg('Tài khoản chưa xác thực email. Vui lòng nhập mã OTP đã gửi đến email của bạn.');
      } else if (errCode === 'Auth.InvalidCredentials') {
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      } else if (errCode === 'Auth.AccountLocked') {
        setErrorMsg('Tài khoản của bạn tạm thời bị khóa. Vui lòng liên hệ quản trị viên.');
      } else {
        setErrorMsg(errMsg || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto py-4">
      <div className="bg-white rounded-3xl border border-[#E5E5E5] shadow-[0px_4px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8 md:p-9 transition-all">
        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A] font-['Plus_Jakarta_Sans',sans-serif] leading-tight mb-1.5">
            ĐĂNG NHẬP
          </h1>
          <p className="text-sm text-[#525252] font-normal leading-relaxed">
            Truy cập nền tảng hội viên và quản lý lịch tập luyện
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">
          <Input
            label="Địa chỉ Email"
            required
            type="email"
            autoComplete="off"
            placeholder="hoi.vien@gymx.vn"
            value={email}
            onFocus={handleFocus}
            onChange={(e) => { setEmail(e.target.value); handleChange('email', e.target.value); }}
            onBlur={() => handleBlur('email', email)}
            error={errors.email}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-[#0A0A0A]">
                Mật khẩu <span className="text-danger ml-0.5">*</span>
              </span>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-light transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              required
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              showPasswordToggle
              value={password}
              onFocus={handleFocus}
              onChange={(e) => { setPassword(e.target.value); handleChange('password', e.target.value); }}
              onBlur={() => handleBlur('password', password)}
              error={errors.password}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              rightIcon={<ArrowRight className="size-4" />}
              className="w-full h-11 text-sm font-semibold rounded-lg shadow-[0_4px_14px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.4)]"
            >
              Đăng Nhập
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs sm:text-sm text-[#525252]">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary-light hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>

      {/* Toast Alert – Góc phải màn hình */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[420px] w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Alert
            variant="danger"
            onClose={() => { setErrorMsg(null); setUnverifiedEmail(false); }}
            className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#E5E5E5] bg-white"
          >
            <div>
              <p>{errorMsg}</p>
              {unverifiedEmail && (
                <Link
                  href={`/verify-email?email=${encodeURIComponent(email.trim())}`}
                  className="mt-1.5 inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs"
                >
                  Xác thực email ngay <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
