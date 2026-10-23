import axios from 'axios';
import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  AuthApiResponse,
  AuthTokenData,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyOtpRequest,
} from '@/types/auth';

export const authService = {
  // Đăng nhập qua Route Handler BFF để set HttpOnly Cookie cho refreshToken
  login: async (payload: LoginRequest): Promise<AuthApiResponse<AuthTokenData>> => {
    const res = await axios.post<AuthApiResponse<AuthTokenData>>('/api/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterRequest): Promise<{ success: boolean; message: string; email: string }> => {
    const res = await apiClient.post<unknown, { message?: string; email?: string } | string>(
      ENDPOINTS.auth.register,
      payload,
    );
    const message =
      typeof res === 'string'
        ? res
        : res?.message || 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.';
    const email = typeof res === 'object' && res?.email ? res.email : payload.email;
    return { success: true, message, email };
  },

  verifyEmail: (payload: VerifyEmailRequest) =>
    apiClient.post<unknown, AuthApiResponse<AuthTokenData>>(ENDPOINTS.auth.verifyEmail, {
      email: payload.email,
      otpCode: payload.otpCode ?? payload.otp,
    }),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<unknown, { message: string }>(ENDPOINTS.auth.forgotPassword, payload),

  verifyOtp: (payload: VerifyOtpRequest) =>
    apiClient.post<unknown, { token: string; expiresAt: string }>(ENDPOINTS.auth.verifyOtp, payload),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient.post<unknown, string>(ENDPOINTS.auth.resetPassword, payload),

  refreshToken: async (_payload?: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const res = await axios.post<{ success: boolean; data: RefreshTokenResponse }>('/api/auth/refresh');
    return res.data.data;
  },

  googleLogin: (idToken: string) =>
    apiClient.post<unknown, AuthApiResponse<AuthTokenData>>(ENDPOINTS.auth.googleLogin, { idToken }),

  logout: async (_refreshToken?: string): Promise<{ message: string }> => {
    const res = await axios.post<{ success: boolean; message?: string }>('/api/auth/logout');
    return { message: res.data.message || 'Đăng xuất thành công' };
  },
};

export default authService;
