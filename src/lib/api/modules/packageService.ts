import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CreatePackagePayload,
  MemberPackage,
  Package,
  PackageDetail,
  PackageQueryParams,
  PagedPackageResult,
  UpdatePackagePayload,
} from '@/types/package';

export const packageService = {
  // ─── Public Methods ────────────────────────────────────────────────────────
  /** Danh sách gói tập (public) */
  list: (params?: PackageQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedPackageResult>>(ENDPOINTS.packages.list, { params }),

  /** Chi tiết một gói tập (public) */
  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<Package>>(ENDPOINTS.packages.byId(id)),

  /** Đăng ký / mua gói tập */
  purchase: (packageId: string, memberId: string) =>
    apiClient.post<unknown, ApiResponse<MemberPackage>>(ENDPOINTS.packages.purchase, { packageId, memberId }),

  /** Danh sách gói tập của một hội viên */
  memberPackages: (memberId: string) =>
    apiClient.get<unknown, ApiResponse<MemberPackage[]>>(ENDPOINTS.members.packages(memberId)),

  // ─── Admin Methods ─────────────────────────────────────────────────────────
  /** [Admin] Danh sách gói tập có phân trang, tìm kiếm & lọc */
  adminList: (params?: PackageQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedPackageResult>>(ENDPOINTS.adminPackages.list, { params }),

  /** [Admin] Lấy chi tiết gói tập theo ID */
  adminById: (id: string) =>
    apiClient.get<unknown, ApiResponse<PackageDetail>>(ENDPOINTS.adminPackages.byId(id)),

  /** [Admin] Tạo gói tập mới */
  create: (payload: CreatePackagePayload) =>
    apiClient.post<unknown, ApiResponse<PackageDetail>>(ENDPOINTS.adminPackages.create, payload),

  /** [Admin] Cập nhật gói tập (hỗ trợ mode DISCONTINUE_AND_CREATE khi gói đang dùng) */
  update: (id: string, payload: UpdatePackagePayload) =>
    apiClient.put<unknown, ApiResponse<PackageDetail>>(ENDPOINTS.adminPackages.update(id), payload),

  /** [Admin] Xóa mềm gói tập */
  delete: (id: string) =>
    apiClient.delete<unknown, ApiResponse<null>>(ENDPOINTS.adminPackages.delete(id)),

  /** [Admin] Ngừng kinh doanh gói tập */
  discontinue: (id: string) =>
    apiClient.patch<unknown, ApiResponse<null>>(ENDPOINTS.adminPackages.discontinue(id)),
};

export default packageService;
