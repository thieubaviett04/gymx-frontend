import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { AttendanceQueryParams, AttendanceRecord, CheckInRequest, CheckInResponse } from '@/types/attendance';

export const attendanceService = {
  /** Danh sách lịch sử điểm danh */
  list: (params?: AttendanceQueryParams) =>
    apiClient.get<unknown, ApiResponse<PaginatedResponse<AttendanceRecord>>>(ENDPOINTS.attendance.list, { params }),

  /** Danh sách check-in hôm nay (cho màn hình Receptionist) */
  today: (branchId?: string) =>
    apiClient.get<unknown, ApiResponse<AttendanceRecord[]>>(ENDPOINTS.attendance.today, {
      params: branchId ? { branchId } : undefined,
    }),

  /** Check-in hội viên (QR Code / FaceID / Manual) */
  checkIn: (payload: CheckInRequest) =>
    apiClient.post<unknown, ApiResponse<CheckInResponse>>(ENDPOINTS.attendance.checkIn, payload),

  /** Check-out */
  checkOut: (attendanceId: string) =>
    apiClient.patch<unknown, ApiResponse<AttendanceRecord>>(ENDPOINTS.attendance.checkOut(attendanceId)),
};

export default attendanceService;
