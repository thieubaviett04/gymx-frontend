'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api/auth/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { useGuestGuard } from '@/lib/hooks';
import { saveResetSession } from '@/lib/utils';
import { Alert, Button } from '@/components/ui';
import { CheckCircle2, Dumbbell } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const flow = searchParams.get('flow') || '';

  // Chặn truy cập ngược nếu người dùng đã đăng nhập
  const { isCheckingAuth } = useGuestGuard();

  const loginToStore = useAuthStore((state) => state.login);

  const isResetPasswordFlow = flow === 'reset-password';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Auto-dismiss alerts after 6 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only accept digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input or blur on complete
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (cleaned && index === 5) {
      inputRefs.current[5]?.blur();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const digits = pastedData.slice(0, 6).split('');
      setOtp(digits);
      inputRefs.current[5]?.blur();
    } else if (pastedData.length > 0) {
      const digits = [...otp];
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        digits[i] = pastedData[i];
      }
      setOtp(digits);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (!email.trim()) {
      setErrorMsg('Email không được để trống.');
      return;
    }

    // Trường hợp để trống OTP
    if (!fullOtp) {
      setErrorMsg('Mã OTP không được để trống.');
      return;
    }

    // Trường hợp nhập chưa đủ 6 ký tự
    if (fullOtp.length < 6) {
      setErrorMsg('Mã OTP phải có 6 chữ số.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isResetPasswordFlow) {
        // Luồng Quên mật khẩu: Xác thực OTP để lấy resetToken
        const res = await authService.verifyOtp({
          email: email.trim(),
          otp: fullOtp,
        });

        const resetToken = (res as any)?.token || (res as any)?.Token || '';
        if (!resetToken) {
          setErrorMsg('Không tìm thấy token hợp lệ từ hệ thống.');
          return;
        }

        // Lưu tạm resetToken vào sessionStorage để chống mất trạng thái F5 / reload
        saveResetSession(resetToken, email.trim());
        setSuccessMsg('Xác thực OTP thành công! Đang chuyển tiếp...');

        setTimeout(() => {
          router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
        }, 1000);
      } else {
        // Luồng Đăng ký tài khoản: Xác thực Email và tự động đăng nhập
        const res = await authService.verifyEmail({
          email: email.trim(),
          otp: fullOtp,
        });

        if (res.success && res.data) {
          loginToStore(res.data);
          setSuccessMsg('Xác thực email thành công! Đang chuyển hướng...');

          setTimeout(() => {
            const roles = res.data.roles || [];
            if (roles.includes('ADMIN')) {
              router.push('/admin');
            } else {
              router.push('/member');
            }
          }, 1200);
        } else {
          setErrorMsg('Mã OTP không hợp lệ hoặc đã hết hạn.');
        }
      }
    } catch (err: any) {
      if (!err.response) {
        setErrorMsg('Không thể kết nối đến máy chủ backend (Network Error). Vui lòng kiểm tra lại kết nối.');
        return;
      }
      const data = err.response?.data;

      // Bóc tách lỗi validation từ FluentValidation Backend (ValidationProblemDetails 400)
      if (data?.errors && typeof data.errors === 'object') {
        const errorList: string[] = [];
        for (const [_, msgs] of Object.entries(data.errors)) {
          if (Array.isArray(msgs)) {
            errorList.push(...msgs);
          } else if (msgs) {
            errorList.push(String(msgs));
          }
        }
        if (errorList.length > 0) {
          setErrorMsg(errorList[0]);
          return;
        }
      }

      const errMsg =
        data?.error?.description ||
        data?.error?.message ||
        data?.message ||
        data?.detail ||
        'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại.';
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    if (!email.trim()) {
      setErrorMsg('Vui lòng cung cấp email trước khi gửi lại mã OTP.');
      return;
    }

    setResendLoading(true);
    setErrorMsg(null);

    try {
      if (isResetPasswordFlow) {
        await authService.forgotPassword({ email: email.trim() });
      }
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg(`Mã OTP mới đã được gửi tới email ${email.trim()}`);
    } catch (err: any) {
      const data = err.response?.data;
      setErrorMsg(data?.error?.description || data?.message || 'Không thể gửi lại mã OTP lúc này.');
    } finally {
      setResendLoading(false);
    }
  };

  if (isCheckingAuth) {
    return null;
  }

  const isOtpComplete = otp.join('').length === 6;

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
            {isResetPasswordFlow ? 'XÁC THỰC MÃ OTP' : 'XÁC THỰC EMAIL'}
          </h1>

          {/* Đoạn mô tả - Chuẩn Design System 14px */}
          <p className="font-sans text-xs sm:text-sm leading-relaxed text-muted-foreground text-center mt-2 max-w-[440px]">
            Mã xác thực đã được gửi tới email:{' '}
            <strong className="font-semibold text-[#064343]">{email || 'của bạn'}</strong>
          </p>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-[316px] sm:max-w-[396px] mx-auto">
          {/* 6 OTP Input Boxes chuẩn Figma (56x64, border-2 #94A3B8, bg-white, text #29303C) */}
          <div className="flex items-center justify-between sm:gap-3 mb-5 w-full" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onFocus={(e) => {
                  setErrorMsg(null);
                  e.target.select();
                }}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-[46px] h-[54px] sm:w-[56px] sm:h-[64px] shrink-0 text-center font-sans text-2xl sm:text-[32px] font-semibold rounded-lg bg-white text-[#29303C] border-2 border-[#94A3B8] hover:border-[#64748B] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] transition-all duration-150"
              />
            ))}
          </div>

          {/* Resend OTP Row */}
          <div className="flex items-center justify-between font-sans text-xs sm:text-sm text-muted-foreground mb-5 px-0.5 w-full">
            <span>Bạn chưa nhận được mã?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="font-semibold text-[#064343] hover:underline cursor-pointer transition-colors"
              >
                Gửi lại
              </button>
            ) : (
              <span className="text-muted-foreground">
                Gửi lại sau <strong className="font-semibold text-[#064343]">{countdown}s</strong>
              </span>
            )}
          </div>

          {/* Submit Button - Khớp chính xác 100% chiều rộng hàng ô OTP (396px trên desktop, 316px trên mobile) */}
          <Button
            type="submit"
            variant="auth"
            size="lg"
            isLoading={loading}
            disabled={loading}
            className={`w-full h-12 text-[14px] !font-normal rounded-lg !text-white active:scale-[0.99] transition-none cursor-pointer shadow-sm ${
              isOtpComplete ? 'opacity-100 shadow-md' : 'opacity-60'
            }`}
          >
            <span className="text-white font-normal">
              {isResetPasswordFlow ? 'Xác thực mã' : 'Xác thực email'}
            </span>
          </Button>
        </form>
      </div>

      {/* Toast Alert – Góc phải màn hình */}
      {(errorMsg || successMsg) && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[420px] w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          {errorMsg && (
            <Alert
              variant="danger"
              onClose={() => setErrorMsg(null)}
              className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#E5E5E5] bg-white"
            >
              {errorMsg}
            </Alert>
          )}
          {successMsg && (
            <Alert
              variant="success"
              onClose={() => setSuccessMsg(null)}
              className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#E5E5E5] bg-white"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
