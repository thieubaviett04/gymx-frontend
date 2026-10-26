import { ApiResponse } from './api';

// ─── Roles ───────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'TRAINER' | 'MEMBER';

// ─── Auth Token ──────────────────────────────────────────────────────────────
export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  roles: UserRole[];
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

// ─── Auth API Response shortcuts ─────────────────────────────────────────────
export type AuthApiResponse<T = AuthTokenData> = ApiResponse<T>;

// ─── Request Payloads ────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  gender?: number;
  dateOfBirth?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otpCode?: string;
  otp?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp?: string;
  otpCode?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
