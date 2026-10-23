import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Package, PackageQueryParams } from '@/types/package';
import type { MemberPackage } from '@/types/package';

export const packageService = {
  /** Danh sách gói tập (public) */
  list: (params?: PackageQueryParams) =>
    apiClient.get<unknown, ApiResponse<PaginatedResponse<Package>>>(ENDPOINTS.packages.list, { params }),

  /** Chi tiết một gói tập */
  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<Package>>(ENDPOINTS.packages.byId(id)),

  /** Đăng ký / mua gói tập */
  purchase: (packageId: string, memberId: string) =>
    apiClient.post<unknown, ApiResponse<MemberPackage>>(ENDPOINTS.packages.purchase, { packageId, memberId }),

  /** Danh sách gói tập của một hội viên */
  memberPackages: (memberId: string) =>
    apiClient.get<unknown, ApiResponse<MemberPackage[]>>(ENDPOINTS.members.packages(memberId)),
};

export default packageService;
