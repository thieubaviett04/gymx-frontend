import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { BookingRequest, SessionQueryParams, TrainerProfile, TrainerQueryParams, TrainingSession } from '@/types/trainer';

export const trainerService = {
  /** Danh sách HLV (public) */
  list: (params?: TrainerQueryParams) =>
    apiClient.get<unknown, ApiResponse<PaginatedResponse<TrainerProfile>>>(ENDPOINTS.trainers.list, { params }),

  /** Chi tiết HLV */
  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<TrainerProfile>>(ENDPOINTS.trainers.byId(id)),

  /** Danh sách buổi tập của HLV */
  sessions: (trainerId: string, params?: SessionQueryParams) =>
    apiClient.get<unknown, ApiResponse<PaginatedResponse<TrainingSession>>>(
      ENDPOINTS.trainers.sessions(trainerId),
      { params },
    ),

  /** Lịch làm việc của HLV (để hiện slot available khi booking) */
  schedule: (trainerId: string, week?: string) =>
    apiClient.get<unknown, ApiResponse<Record<string, string[]>>>(ENDPOINTS.trainers.schedule(trainerId), {
      params: week ? { week } : undefined,
    }),

  /** Đặt lịch buổi tập PT */
  bookSession: (payload: BookingRequest) =>
    apiClient.post<unknown, ApiResponse<TrainingSession>>(ENDPOINTS.sessions.book, payload),

  /** Hủy buổi tập */
  cancelSession: (sessionId: string) =>
    apiClient.patch<unknown, ApiResponse<TrainingSession>>(ENDPOINTS.sessions.cancel(sessionId)),

  /** [Trainer only] Đánh dấu hoàn thành */
  completeSession: (sessionId: string, notes?: string) =>
    apiClient.patch<unknown, ApiResponse<TrainingSession>>(ENDPOINTS.sessions.complete(sessionId), { notes }),

  /** [Trainer only] Đánh dấu vắng mặt */
  noShowSession: (sessionId: string) =>
    apiClient.patch<unknown, ApiResponse<TrainingSession>>(ENDPOINTS.sessions.noShow(sessionId)),
};

export default trainerService;
