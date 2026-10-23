'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { authService } from '@/lib/api/auth/authService';
import { Alert, Button, Input } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

function validatePassword(value: string): string | undefined {
  if (!value) return 'Mật khẩu không được để trống.';
  if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (!/[A-Z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa.';
  if (!/[a-z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường.';
  if (!/\d/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ số.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.';
  return undefined;
}

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

  // Field-level error + touched state per step
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  // Auto-dismiss alerts after 6 seconds
  React.useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  const handleFocus = () => {
    setErrors({});
    setErrorMsg(null);
  };

  const handleBlurField = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let err: string | undefined;
    if (field === 'email') {
      if (!value.trim()) err = 'Email không được để trống.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) err = 'Email không đúng định dạng.';
    } else if (field === 'otp') {
      if (!value.trim()) err = 'Vui lòng nhập mã OTP.';
      else if (value.trim().length !== 6) err = 'Mã OTP phải đúng 6 chữ số.';
    } else if (field === 'newPassword') {
      err = validatePassword(value);
    } else if (field === 'confirmPassword') {
      if (!value) err = 'Vui lòng nhập lại mật khẩu.';
      else if (value !== newPassword) err = 'Mật khẩu xác nhận không khớp.';
    }
    if (err) {
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleChangeField = (field: string, value: string) => {
    if (errors[field]) {
      handleBlurField(field, value);
    }
  };

  // Step 1 — Send email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched((prev) => ({ ...prev, email: true }));

    let emailErr: string | undefined;
    if (!email.trim()) emailErr = 'Email không được để trống.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) emailErr = 'Email không đúng định dạng.';
    setErrors({ email: emailErr });
    if (emailErr) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSuccessMsg('Mã xác thực đã được gửi về email của bạn.');
      setSubmitted(false);
      setTouched({});
      setErrors({});
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.error?.description || err.response?.data?.message || err.message;
      setErrorMsg(msg || 'Không thể gửi mã xác thực. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched((prev) => ({ ...prev, otp: true }));

    let otpErr: string | undefined;
    if (!otp.trim()) otpErr = 'Vui lòng nhập mã OTP.';
    else if (otp.trim().length !== 6) otpErr = 'Mã OTP phải đúng 6 chữ số.';
    setErrors({ otp: otpErr });
    if (otpErr) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ email: email.trim(), otp: otp.trim() });
      if (res?.token) {
        setResetToken(res.token);
        setSubmitted(false);
        setTouched({});
        setErrors({});
        setStep(3);
      } else {
        setErrorMsg('Mã OTP không hợp lệ.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.description || err.response?.data?.message || err.message;
      setErrorMsg(msg || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ newPassword: true, confirmPassword: true });

    const newPwErr = validatePassword(newPassword);
    let confirmErr: string | undefined;
    if (!confirmPassword) confirmErr = 'Vui lòng nhập lại mật khẩu.';
    else if (confirmPassword !== newPassword) confirmErr = 'Mật khẩu xác nhận không khớp.';

    setErrors({ newPassword: newPwErr, confirmPassword: confirmErr });
    if (newPwErr || confirmErr) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      await authService.resetPassword({ email: email.trim(), token: resetToken, newPassword });
      setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển về đăng nhập...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.error?.description || err.response?.data?.message || err.message;
      setErrorMsg(msg || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
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
            KHÔI PHỤC MẬT KHẨU
          </h1>
          <p className="text-sm text-[#525252] font-normal leading-relaxed">
            {step === 1 && 'Nhập email tài khoản để nhận mã OTP khôi phục'}
            {step === 2 && 'Nhập mã OTP 6 chữ số đã gửi về email'}
            {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} noValidate autoComplete="off" className="space-y-4">
            <Input
              label="Địa chỉ Email"
              required
              type="email"
              autoComplete="off"
              placeholder="hoi.vien@gymx.vn"
              value={email}
              onFocus={handleFocus}
              onChange={(e) => { setEmail(e.target.value); handleChangeField('email', e.target.value); }}
              onBlur={() => handleBlurField('email', email)}
              error={errors.email}
            />
            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                disabled={loading}
                className="w-full h-11 text-sm font-semibold rounded-lg shadow-[0_4px_14px_rgba(255,107,0,0.3)]"
              >
                Gửi Mã Xác Thực
              </Button>
            </div>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate autoComplete="off" className="space-y-4">
            <Input
              label="Mã OTP (6 chữ số)"
              required
              type="text"
              autoComplete="off"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onFocus={handleFocus}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setOtp(val);
                handleChangeField('otp', val);
              }}
              onBlur={() => handleBlurField('otp', otp)}
              error={errors.otp}
              className="tracking-[0.3em] text-center font-bold text-lg"
            />
            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                disabled={loading}
                className="w-full h-11 text-sm font-semibold rounded-lg shadow-[0_4px_14px_rgba(255,107,0,0.3)]"
              >
                Xác Nhận Mã OTP
              </Button>
            </div>
          </form>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate autoComplete="off" className="space-y-4">
            <Input
              label="Mật khẩu mới"
              required
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
              showPasswordToggle
              value={newPassword}
              onFocus={handleFocus}
              onChange={(e) => { setNewPassword(e.target.value); handleChangeField('newPassword', e.target.value); }}
              onBlur={() => handleBlurField('newPassword', newPassword)}
              error={errors.newPassword}
            />
            <Input
              label="Nhập lại mật khẩu mới"
              required
              type="password"
              autoComplete="new-password"
              placeholder="Xác nhận mật khẩu"
              showPasswordToggle
              value={confirmPassword}
              onFocus={handleFocus}
              onChange={(e) => { setConfirmPassword(e.target.value); handleChangeField('confirmPassword', e.target.value); }}
              onBlur={() => handleBlurField('confirmPassword', confirmPassword)}
              error={errors.confirmPassword}
            />
            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                disabled={loading}
                className="w-full h-11 text-sm font-semibold rounded-lg shadow-[0_4px_14px_rgba(255,107,0,0.3)]"
              >
                Lưu Mật Khẩu Mới
              </Button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#525252] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại trang Đăng nhập
          </Link>
        </div>
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
              {successMsg}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
