'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, RefreshCw } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const loginToStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    if (!email) {
      setErrorMsg('Vui lòng cung cấp địa chỉ email.');
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
      const errMsg = err.response?.data?.error?.description || err.response?.data?.message || err.message;
      setErrorMsg(errMsg || 'Mã OTP không hợp lệ. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E5E5E5] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight mb-2">
            Xác Thực Email
          </h1>
          <p className="text-sm text-[#525252]">
            Nhập mã OTP gồm 6 chữ số đã được gửi đến email:
          </p>
          <p className="text-sm text-[#FF6B00] font-semibold mt-1">
            {email || 'Email của bạn'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p className="flex-1">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <p className="flex-1">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!initialEmail && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A]">Địa chỉ Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hoi.vien@gymx.vn"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E5E5] text-[#0A0A0A] placeholder-[#525252]/60 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
              />
            </div>
          )}

          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl bg-white border-2 border-[#E5E5E5] text-[#0A0A0A] focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8833] active:bg-[#CC5500] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              'Xác Nhận & Đăng Nhập'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#525252]">
          <span>Chưa nhận được mã?</span>
          {canResend ? (
            <button
              type="button"
              onClick={() => {
                setCountdown(60);
                setCanResend(false);
              }}
              className="font-bold text-[#FF6B00] hover:text-[#CC5500] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Gửi lại mã
            </button>
          ) : (
            <span className="text-[#99A1AF] font-medium">Gửi lại sau {countdown}s</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#525252]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF6B00]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
