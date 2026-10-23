import { PaginationParams } from './api';

// ─── Enums ───────────────────────────────────────────────────────────────────
export type AttendanceStatus = 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';
export type CheckInMethod = 'QR_CODE' | 'FACE_ID' | 'MANUAL';

// ─── Attendance Record ────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatarUrl?: string;
  branchId: string;
  checkInTime: string;
  checkOutTime?: string;
  method: CheckInMethod;
  status: AttendanceStatus;
  notes?: string;
}

// ─── Check-in Request ─────────────────────────────────────────────────────────
export interface CheckInRequest {
  memberId?: string;
  qrCode?: string;
  method: CheckInMethod;
  branchId: string;
}

export interface CheckInResponse {
  attendanceId: string;
  member: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    memberPackageStatus: string;
    expiresAt?: string;
  };
  checkInTime: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────
export interface AttendanceQueryParams extends PaginationParams {
  memberId?: string;
  branchId?: string;
  date?: string;           // YYYY-MM-DD
  status?: AttendanceStatus;
}
