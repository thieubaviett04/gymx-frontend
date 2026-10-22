'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const loginToStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUnverifiedEmail(false);
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
    <div className="w-full max-w-md">
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E5E5E5] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight mb-2">
            Đăng Nhập Gym Max
          </h1>
          <p className="text-sm text-[#525252]">
            Truy cập nền tảng hội viên và quản lý lịch tập luyện
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">
              <p>{errorMsg}</p>
              {unverifiedEmail && (
                <Link
                  href={`/verify-email?email=${encodeURIComponent(email.trim())}`}
                  className="mt-2 inline-flex items-center gap-1 font-bold text-[#FF6B00] hover:underline"
                >
                  Xác thực email ngay <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0A0A0A]">Địa chỉ Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hoi.vien@gymmax.vn"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5E5] text-[#0A0A0A] placeholder-[#99A1AF] text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
              />
              <Mail className="w-4 h-4 text-[#99A1AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0A0A0A]">Mật khẩu</label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#FF6B00] hover:text-[#FF8833] transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#E5E5E5] text-[#0A0A0A] placeholder-[#99A1AF] text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
              />
              <Lock className="w-4 h-4 text-[#99A1AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#99A1AF] hover:text-[#0A0A0A] absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8833] active:bg-[#CC5500] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Đăng Nhập
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center text-xs text-[#525252]">
          Chưa có tài khoản hội viên?{' '}
          <Link href="/register" className="font-bold text-[#FF6B00] hover:text-[#FF8833] transition-colors">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
