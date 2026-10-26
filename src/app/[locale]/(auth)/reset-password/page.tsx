'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api/auth/authService';
import { useGuestGuard } from '@/lib/hooks';
import {
  clearResetSession,
  getResetSession,
  saveResetSession,
} from '@/lib/utils';
import { Alert, Button, Input } from '@/components/ui';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Chặn truy cập ngược nếu người dùng đã đăng nhập
  const { isCheckingAuth } = useGuestGuard();

  // 2. Phục hồi token và email từ URL hoặc sessionStorage để chống State Loss (F5, reload)
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Alerts & errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Load session token on mount
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    const session = getResetSession();

    const activeToken = urlToken || session.token || '';
    const activeEmail = urlEmail || session.email || '';

    setToken(activeToken);
    setEmail(activeEmail);

    if (activeToken) {
      // Đảm bảo lưu vào sessionStorage nếu lấy từ URL
      saveResetSession(activeToken, activeEmail);
    }

    setIsSessionLoaded(true);
  }, [searchParams]);

  // Real-time confirm password matching validation
  useEffect(() => {
    if (!confirmPassword) {
      setConfirmError(null);
      return;
    }
    if (confirmPassword !== newPassword) {
      setConfirmError('Mật khẩu nhập lại không khớp với mật khẩu mới.');
    } else {
      setConfirmError(null);
    }
  }, [newPassword, confirmPassword]);

  // Auto-dismiss floating alerts
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Handle submit reset password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMsg('Không tìm thấy token hợp lệ. Vui lòng yêu cầu lại mã OTP.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu mới.');
      return;
    }

    const isValidPassword =
      newPassword.length >= 6 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword);

    if (!isValidPassword) {
      setErrorMsg('Mật khẩu mới tối thiểu 6 ký tự gồm chữ hoa, chữ thường và chữ số.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.resetPassword({
        token,
        newPassword,
      });

      // Dọn dẹp sạch sẽ sessionStorage ngay sau khi thành công
      clearResetSession();
      setIsSuccess(true);
    } catch (err: any) {
      if (!err.response) {
        setErrorMsg('Không thể kết nối đến máy chủ backend (Network Error). Vui lòng thử lại sau.');
        return;
      }

      const data = err.response?.data;

      // Xử lý validation errors từ backend
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
        'Không thể đặt lại mật khẩu. Token có thể đã hết hạn hoặc không hợp lệ.';
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Thoát khỏi luồng và xóa session
  const handleExitFlow = () => {
    clearResetSession();
    router.push('/login');
  };

  if (isCheckingAuth || !isSessionLoaded) {
    return null;
  }

  // Trường hợp không có token (truy cập bất hợp lệ hoặc token đã hết hạn)
  if (!token && !isSuccess) {
    return (
      <div className="w-full max-w-[540px] mx-auto">
        <div className="bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.22)] p-8 sm:px-12 sm:pt-10 sm:pb-12 text-center transition-all">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-[26px] text-[#0A0A0A] mb-2 text-center">
            Phiên làm việc không hợp lệ
          </h1>
          <p className="font-sans text-xs sm:text-sm leading-relaxed text-[#525252] mb-6 text-center">
            Không tìm thấy mã phiên đặt lại mật khẩu hoặc phiên đã hết hạn. Vui lòng thực hiện lại từ đầu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="auth"
              size="lg"
              onClick={() => router.push('/forgot-password')}
              className="w-full sm:w-auto h-12 px-5 text-[14px] !font-normal rounded-lg !text-white active:scale-[0.99] transition-none cursor-pointer shadow-sm"
            >
              <span className="text-white font-normal">Yêu cầu mã mới</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleExitFlow}
              className="w-full sm:w-auto h-12 px-5 text-[14px] !font-normal rounded-lg border-[#E5E5E5] text-[#0A0A0A] hover:bg-neutral-50 shadow-none cursor-pointer"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // TRẠNG THÁI 2: ĐỔI MẬT KHẨU THÀNH CÔNG (Chuẩn Figma Node 1329:15427)
  if (isSuccess) {
    return (
      <div className="w-full max-w-[540px] mx-auto">
        <div className="bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.22)] p-8 sm:px-12 sm:pt-12 sm:pb-14 text-center transition-all">
          <div className="flex flex-col items-center text-center">
            {/* Vuesax Bold Shield-Tick Icon chuẩn Figma */}
            <div className="flex justify-center mb-6">
              <svg width="88" height="88" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M83.4296 18.54L58.6796 9.27003C56.1146 8.32503 51.9296 8.32503 49.3646 9.27003L24.6146 18.54C19.8446 20.34 15.9746 25.92 15.9746 31.005V67.455C15.9746 71.1 18.3596 75.915 21.2846 78.075L46.0346 96.57C50.3996 99.855 57.5546 99.855 61.9196 96.57L86.6696 78.075C89.5946 75.87 91.9796 71.1 91.9796 67.455V31.005C92.0246 25.92 88.1546 20.34 83.4296 18.54ZM69.6596 43.74L50.3096 63.09C49.6346 63.765 48.7796 64.08 47.9246 64.08C47.0696 64.08 46.2146 63.765 45.5396 63.09L38.3396 55.8C37.0346 54.495 37.0346 52.335 38.3396 51.03C39.6446 49.725 41.8046 49.725 43.1096 51.03L47.9696 55.89L64.9346 38.925C66.2396 37.62 68.3996 37.62 69.7046 38.925C71.0096 40.23 71.0096 42.435 69.6596 43.74Z" fill="#22C55E"/>
              </svg>
            </div>

            {/* Tiêu đề */}
            <h1 className="font-heading font-bold text-2xl sm:text-[26px] leading-tight text-[#0A0A0A] mb-8 text-center">
              Đổi mật khẩu thành công
            </h1>

            {/* Nút Đăng nhập */}
            <Button
              type="button"
              variant="auth"
              size="lg"
              onClick={() => router.push('/login')}
              className="w-full max-w-[286px] mx-auto h-12 text-[14px] !font-normal rounded-lg !text-white active:scale-[0.99] transition-none cursor-pointer shadow-sm flex items-center justify-center"
            >
              <span className="text-white font-normal">Đăng nhập</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFormFilled = newPassword.length > 0 && confirmPassword.length > 0;

  // TRẠNG THÁI 1: FORM THIẾT LẬP MẬT KHẨU
  return (
    <div className="w-full max-w-[540px] mx-auto">
      <div className="bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.22)] p-8 sm:px-12 sm:pt-9 sm:pb-12 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 rounded-full bg-[#064343] flex items-center justify-center mb-3.5 mx-auto">
            <KeyRound className="w-8 h-8 text-white" />
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-[26px] leading-tight text-[#0A0A0A] text-center tracking-tight">
            THIẾT LẬP MẬT KHẨU
          </h1>

          {/* Mô tả phụ - Chuẩn Design System 14px */}
          <p className="font-sans text-xs sm:text-sm leading-relaxed text-muted-foreground text-center mt-2 max-w-[440px]">
            Mật khẩu mới tối thiểu 6 ký tự gồm chữ hoa, chữ thường và chữ số.
          </p>
        </div>

        {/* Form đặt lại mật khẩu */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Ô nhập mật khẩu mới */}
          <div>
            <Input
              name="newPassword"
              label="Mật khẩu mới"
              required
              type="password"
              autoComplete="new-password"
              placeholder="Nhập mật khẩu mới"
              showPasswordToggle
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-[46px] bg-[#F4F5F6] border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none"
            />
          </div>

          {/* Ô nhập lại mật khẩu mới */}
          <div>
            <Input
              name="confirmPassword"
              label="Nhập lại mật khẩu mới"
              required
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu mới"
              showPasswordToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmError || undefined}
              className={`h-[46px] bg-[#F4F5F6] rounded-lg text-sm placeholder:text-[#A3A3A3] placeholder:font-normal transition-all duration-150 outline-none ${
                !confirmError
                  ? 'border border-transparent hover:border-transparent focus:border-[#064343] focus:ring-1 focus:ring-[#064343] focus:bg-white'
                  : ''
              }`}
            />
          </div>

          {/* Nút submit: "Lưu mật khẩu" - hoàn toàn không có hover */}
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
              <span className="text-white font-normal">Lưu mật khẩu</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Toast Alert nổi góc màn hình */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[420px] w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Alert
            variant="danger"
            onClose={() => setErrorMsg(null)}
            className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#E5E5E5] bg-white"
          >
            {errorMsg}
          </Alert>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
