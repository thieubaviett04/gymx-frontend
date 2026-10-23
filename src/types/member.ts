import { PaginationParams } from './api';
import { MemberPackage } from './package';
import { User } from './user';

// ─── Enums ───────────────────────────────────────────────────────────────────
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

// ─── Member Profile ───────────────────────────────────────────────────────────
export interface MemberProfile {
  id: string;
  user: User;
  memberCode: string;       // Mã hội viên (VD: MEM-2025-0001)
  qrCode: string;           // QR để check-in
  dateOfBirth?: string;
  gender?: number;          // 0: Nam | 1: Nữ | 2: Khác
  height?: number;          // cm
  weight?: number;          // kg
  emergencyContact?: string;
  status: MemberStatus;
  activePackage?: MemberPackage;
  branchId?: string;
  joinedAt: string;
}

// ─── Quick info (dùng khi check-in hoặc search) ──────────────────────────────
export interface MemberQuickInfo {
  id: string;
  memberCode: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  activePackageStatus?: string;
  expiresAt?: string;
}

// ─── Update Profile Request ───────────────────────────────────────────────────
export interface UpdateMemberProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  height?: number;
  weight?: number;
  emergencyContact?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────
export interface MemberQueryParams extends PaginationParams {
  status?: MemberStatus;
  branchId?: string;
}
