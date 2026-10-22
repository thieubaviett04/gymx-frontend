export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'TRAINER' | 'MEMBER';

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

export interface AuthApiResponse<T = AuthTokenData> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  gender?: number;
  dateOfBirth?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}
