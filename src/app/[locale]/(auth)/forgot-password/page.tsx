'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim() });
      setSuccessMsg('Mã xác thực đã được gửi về email của bạn.');
      setStep(2);
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.description || err.response?.data?.message || err.message;
      setErrorMsg(errMsg || 'Không thể gửi mã xác thực. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await authService.verifyOtp({ email: email.trim(), otp: otp.trim() });
      if (res && res.token) {
        setResetToken(res.token);
        setStep(3);
      } else {
        setErrorMsg('Mã OTP không hợp lệ.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.description || err.response?.data?.message || err.message;
      setErrorMsg(errMsg || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email: email.trim(),
        token: resetToken,
        newPassword,
      });

      setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển về đăng nhập...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.description || err.response?.data?.message || err.message;
      setErrorMsg(errMsg || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
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
            Khôi Phục Mật Khẩu
          </h1>
          <p className="text-sm text-[#525252]">
            {step === 1 && 'Nhập email tài khoản để nhận mã OTP khôi phục'}
            {step === 2 && 'Nhập mã OTP 6 chữ số đã gửi về email'}
            {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
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

        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A]">Địa chỉ Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hoi.vien@gymx.vn"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5E5] text-[#0A0A0A] placeholder-[#525252]/60 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                />
                <Mail className="w-4 h-4 text-[#525252]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8833] active:bg-[#CC5500] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi Mã Xác Thực'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A]">Mã OTP (6 chữ số)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full tracking-widest text-center py-3 rounded-xl bg-white border-2 border-[#E5E5E5] text-[#0A0A0A] text-lg font-bold focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8833] active:bg-[#CC5500] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác Nhận Mã OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A]">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5E5] text-[#0A0A0A] placeholder-[#525252]/60 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                />
                <Lock className="w-4 h-4 text-[#525252]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A]">Nhập lại mật khẩu mới</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5E5] text-[#0A0A0A] placeholder-[#525252]/60 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                />
                <Lock className="w-4 h-4 text-[#525252]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8833] active:bg-[#CC5500] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu Mật Khẩu Mới'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#525252] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
