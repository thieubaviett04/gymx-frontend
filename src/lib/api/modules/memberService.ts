import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { MemberProfile, MemberQueryParams, MemberQuickInfo, UpdateMemberProfileRequest } from '@/types/member';

export const memberService = {
  /** [Admin/Receptionist] Danh sách hội viên */
  list: (params?: MemberQueryParams) =>
    apiClient.get<unknown, ApiResponse<PaginatedResponse<MemberProfile>>>(ENDPOINTS.members.list, { params }),

  /** Thông tin hội viên hiện tại (đang đăng nhập) */
  me: () =>
    apiClient.get<unknown, ApiResponse<MemberProfile>>(ENDPOINTS.members.me),

  /** Thông tin hội viên theo ID */
  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<MemberProfile>>(ENDPOINTS.members.byId(id)),

  /** Cập nhật hồ sơ hội viên */
  updateProfile: (id: string, payload: UpdateMemberProfileRequest) =>
    apiClient.put<unknown, ApiResponse<MemberProfile>>(ENDPOINTS.members.updateProfile(id), payload),

  /** Upload ảnh đại diện */
  uploadAvatar: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<unknown, ApiResponse<{ avatarUrl: string }>>(ENDPOINTS.members.uploadAvatar(id), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Lấy thông tin nhanh để check-in (tìm theo name/phone/code) */
  quickSearch: (query: string) =>
    apiClient.get<unknown, ApiResponse<MemberQuickInfo[]>>(ENDPOINTS.members.list, {
      params: { search: query, pageSize: 10 },
    }),
};

export default memberService;
