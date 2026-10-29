import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CreateEmployeePayload,
  EmployeeDetail,
  EmployeeQueryParams,
  PagedEmployeeResult,
  UpdateEmployeePayload,
} from '@/types/employee';

export const employeeService = {
  /** [Admin] Lấy danh sách nhân viên có phân trang, tìm kiếm & lọc */
  list: (params?: EmployeeQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedEmployeeResult>>(ENDPOINTS.employees.list, { params }),

  /** [Admin] Lấy thông tin chi tiết một nhân viên */
  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.byId(id)),

  /** [Admin] Thêm mới nhân viên */
  create: (payload: CreateEmployeePayload) =>
    apiClient.post<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.create, payload),

  /** [Admin] Cập nhật thông tin nhân viên */
  update: (id: string, payload: UpdateEmployeePayload) =>
    apiClient.put<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.update(id), payload),

  /** [Admin] Xóa (Soft delete) nhân viên */
  delete: (id: string) =>
    apiClient.delete<unknown, ApiResponse<{ success: boolean; message?: string }>>(
      ENDPOINTS.employees.delete(id)
    ),

  /** [Employee] Lấy thông tin hồ sơ của chính mình */
  me: () =>
    apiClient.get<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.me),
};

export default employeeService;
