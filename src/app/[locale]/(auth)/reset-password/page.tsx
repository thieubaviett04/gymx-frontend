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
import { PasswordChecklist, isPasswordValid } from '@/components/shared';
import {
  AlertCircle,
  ArrowLeft,
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

    if (!isPasswordValid(newPassword)) {
      setErrorMsg('Mật khẩu mới chưa thỏa mãn đầy đủ các tiêu chuẩn bảo mật.');
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
      <div className="w-full max-w-[560px] mx-auto py-6">
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,0,0,0.2)] px-8 sm:px-12 md:px-14 py-10 sm:py-12 text-center transition-all">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-sans font-semibold text-[22px] sm:text-[24px] text-[#0A0A0A] mb-2">
            Phiên làm việc không hợp lệ
          </h1>
          <p className="font-sans text-[14px] sm:text-[15px] leading-[22px] text-[#525252] mb-6">
            Không tìm thấy mã phiên đặt lại mật khẩu hoặc phiên đã hết hạn. Vui lòng thực hiện lại từ đầu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push('/forgot-password')}
              className="w-full sm:w-auto h-11 px-6 font-sans text-sm font-semibold rounded-lg bg-[#FF6B00] text-white hover:bg-[#FF8833] shadow-none"
            >
              Yêu cầu mã mới
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExitFlow}
              className="w-full sm:w-auto h-11 px-6 font-sans text-sm font-semibold rounded-lg border-[#E5E5E5] text-[#0A0A0A] hover:bg-neutral-50 shadow-none"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // TRẠNG THÁI 2: ĐỔI MẬT KHẨU THÀNH CÔNG (Figma 172:1501 / 172:1503)
  if (isSuccess) {
    return (
      <div className="w-full max-w-[560px] mx-auto py-6">
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,0,0,0.2)] px-8 sm:px-12 md:px-14 py-10 sm:py-12 transition-all">
          <div className="flex flex-col items-center text-center">
            {/* ShieldCheck Icon 108x108px đúng tỷ lệ Figma 172:1507 */}
            <div className="w-[108px] h-[108px] rounded-full bg-[#FFF4EC] border border-[#FFD8BF] flex items-center justify-center mb-6 shadow-[0_12px_32px_rgba(255,107,0,0.12)]">
              <ShieldCheck className="w-[68px] h-[68px] text-[#FF6B00] stroke-[1.8]" />
            </div>

            {/* Tiêu đề Inter SemiBold 24px (h3) theo Figma 172:1509 */}
            <h1 className="font-sans font-semibold text-[24px] sm:text-[26px] leading-[32px] tracking-[-0.006em] text-[#0A0A0A] mb-2.5">
              Đổi mật khẩu thành công
            </h1>

            {/* Mô tả phụ */}
            <p className="font-sans text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#525252] max-w-[380px] mb-8">
              Mật khẩu tài khoản của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.
            </p>

            {/* Nút Đăng nhập 213px x 44px theo Figma 172:1511 */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => router.push('/login')}
              className="w-[213px] h-11 font-sans text-sm sm:text-base font-semibold rounded-lg bg-[#FF6B00] text-white shadow-none hover:bg-[#FF8833] cursor-pointer transition-all duration-200"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid =
    isPasswordValid(newPassword) &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  // TRẠNG THÁI 1: FORM THIẾT LẬP MẬT KHẨU (Figma 172:1474)
  return (
    <div className="w-full max-w-[560px] mx-auto py-6">
      <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,0,0,0.2)] px-8 sm:px-12 md:px-14 py-8 sm:py-10 transition-all">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] flex items-center justify-center shadow-none mb-3.5">
            <KeyRound className="w-7 h-7 text-white" />
          </div>

          <h1 className="font-sans font-semibold text-[26px] sm:text-[28px] leading-tight sm:leading-[34px] tracking-[-0.0075em] text-[#0A0A0A]">
            THIẾT LẬP MẬT KHẨU
          </h1>

          <p className="font-sans text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-[#525252] text-center mt-1.5 max-w-[420px]">
            {email ? (
              <>
                Đặt lại mật khẩu cho tài khoản{' '}
                <strong className="text-[#0A0A0A] font-medium">{email}</strong>
              </>
            ) : (
              'Vui lòng nhập mật khẩu mới đạt tiêu chuẩn bảo mật cho tài khoản của bạn.'
            )}
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
              className="bg-transparent focus:bg-transparent"
            />

            {/* Checklist động kiểm tra tiêu chuẩn mật khẩu thời gian thực */}
            <PasswordChecklist password={newPassword} className="mt-2" />
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
              className="bg-transparent focus:bg-transparent"
            />
          </div>

          {/* Nút submit: "Lưu mật khẩu" (Figma 172:1500) */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading || !isFormValid}
              className="w-full h-11 font-sans text-sm sm:text-base font-semibold rounded-lg bg-[#FF6B00] text-white shadow-none hover:bg-[#FF8833] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lưu mật khẩu
            </Button>
          </div>

          {/* Nút quay lại đăng nhập / hủy bỏ quy trình */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleExitFlow}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#737373] hover:text-[#0A0A0A] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại đăng nhập</span>
            </button>
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
        <div className="p-8 text-center text-[#525252]">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
