import apiClient from '@/lib/api/core/client';
import {
  AuthApiResponse,
  AuthTokenData,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyOtpRequest,
} from '@/types/auth';

export const authService = {
  login: async (payload: LoginRequest): Promise<AuthApiResponse<AuthTokenData>> => {
    return apiClient.post('/auth/login', payload);
  },

  register: async (payload: RegisterRequest): Promise<{ success: boolean; message: string; email?: string }> => {
    const res = await apiClient.post<unknown, { message?: string; email?: string } | string>('/auth/register', payload);
    const message = typeof res === 'string' ? res : res?.message || 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.';
    const email = typeof res === 'object' && res?.email ? res.email : payload.email;
    return { success: true, message, email };
  },

  verifyEmail: async (payload: VerifyEmailRequest): Promise<AuthApiResponse<AuthTokenData>> => {
    return apiClient.post('/auth/verify-email', {
      email: payload.email,
      otpCode: payload.otpCode || payload.otp,
    });
  },

  googleLogin: async (idToken: string): Promise<AuthApiResponse<AuthTokenData>> => {
    return apiClient.post('/auth/google-login', { idToken });
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post('/auth/forgot-password', payload);
  },

  verifyOtp: async (payload: VerifyOtpRequest): Promise<{ token: string; expiresAt: string }> => {
    return apiClient.post('/auth/verify-otp', payload);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<string> => {
    return apiClient.post('/auth/reset-password', payload);
  },

  logout: async (refreshToken: string): Promise<{ message: string }> => {
    return apiClient.post('/auth/logout', { refreshToken });
  },
};

export default authService;
