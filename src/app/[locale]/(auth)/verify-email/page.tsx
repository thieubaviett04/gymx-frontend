'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api/auth/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { Alert, Button } from '@/components/ui';
import { CheckCircle2, Dumbbell } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const loginToStore = useAuthStore((state) => state.login);

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

  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className="w-full max-w-[568px] mx-auto py-6">
      {/* Container xác thực chuẩn tỉ lệ Figma padding 64px 80px, bo góc 32px */}
      <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,0,0,0.2)] px-6 sm:px-14 md:px-20 py-10 sm:py-12 md:py-14 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] flex items-center justify-center shadow-none mb-3.5">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>

          {/* Tiêu đề chuẩn Inter SemiBold 30px, lineHeight 36px, tracking -0.0075em */}
          <h1 className="font-sans font-semibold text-[26px] sm:text-[30px] leading-tight sm:leading-[36px] tracking-[-0.0075em] text-[#0A0A0A]">
            XÁC THỰC MÃ OTP
          </h1>

          {/* Đoạn mô tả: cùng style font-normal, khoảng cách sát hơn */}
          <div className="font-sans text-center mt-1.5 space-y-0">
            <p className="text-[15px] sm:text-[16px] leading-[22px] sm:leading-[26px] text-[#525252]">
              Một mã xác thực được gửi tới email:
            </p>
            <p className="text-[15px] sm:text-[16px] leading-[22px] sm:leading-[26px] font-normal text-[#FF6B00] break-all">
              {email || 'Chưa cung cấp email'}
            </p>
          </div>
        </div>

        {/* OTP Input Form - Chiều rộng đúng 396px theo Figma */}
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-[396px] mx-auto">
          {/* 6 OTP Input Boxes - width 56px, height 64px, rounded-lg (8px), font SemiBold 36px, shadow-none */}
          <div className="grid grid-cols-6 gap-2.5 sm:gap-3 mt-6 mb-4 w-full" onPaste={handlePaste}>
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
                className="w-full h-14 sm:h-16 text-center font-sans text-[30px] sm:text-[36px] font-semibold rounded-lg bg-transparent text-[#0A0A0A] border border-[#E5E5E5] shadow-none transition-all duration-150 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
              />
            ))}
          </div>

          {/* Resend OTP Row - Font Inter 14px, lineHeight 24px */}
          <div className="flex items-center justify-between font-sans text-sm text-[#525252] mb-6 px-0.5 w-full">
            <span>Bạn chưa nhận được mã?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="font-medium text-[#FF6B00] hover:text-[#FF8833] hover:underline cursor-pointer transition-colors"
              >
                Gửi lại
              </button>
            ) : (
              <span className="text-[#525252]">
                Gửi lại sau <strong className="font-medium text-[#FF6B00]">{countdown}s</strong>
              </span>
            )}
          </div>

          {/* Submit Button - Width 395px, Height 44px, bo góc 8px (rounded-lg), shadow-none */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={loading}
            className="w-full h-11 font-sans text-sm sm:text-base font-semibold rounded-lg bg-[#FF6B00] text-white shadow-none hover:bg-[#FF8833] cursor-pointer transition-all duration-200"
          >
            Xác thực email
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
        <div className="p-8 text-center text-[#525252]">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
