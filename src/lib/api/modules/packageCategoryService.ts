import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CreatePackageCategoryPayload,
  PackageCategoryDetail,
  PackageCategoryLookup,
  PackageCategoryQueryParams,
  PagedPackageCategoryResult,
  UpdatePackageCategoryPayload,
} from '@/types/packageCategory';

export const packageCategoryService = {
  list: (params?: PackageCategoryQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedPackageCategoryResult>>(
      ENDPOINTS.adminPackageCategories.list,
      { params }
    ),
  lookup: () =>
    apiClient.get<unknown, ApiResponse<PackageCategoryLookup[]>>(
      ENDPOINTS.adminPackageCategories.lookup
    ),
  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<PackageCategoryDetail>>(
      ENDPOINTS.adminPackageCategories.byId(id)
    ),
  create: (payload: CreatePackageCategoryPayload) =>
    apiClient.post<unknown, ApiResponse<PackageCategoryDetail>>(
      ENDPOINTS.adminPackageCategories.create,
      payload
    ),
  update: (id: string, payload: UpdatePackageCategoryPayload) =>
    apiClient.put<unknown, ApiResponse<PackageCategoryDetail>>(
      ENDPOINTS.adminPackageCategories.update(id),
      payload
    ),
  delete: (id: string) =>
    apiClient.delete<unknown, ApiResponse<null>>(
      ENDPOINTS.adminPackageCategories.delete(id)
    ),
};

export default packageCategoryService;

