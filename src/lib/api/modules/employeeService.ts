import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CreateEmployeePayload,
  EmployeeDetail,
  EmployeeFaceDetail,
  EmployeeQueryParams,
  PagedEmployeeResult,
  UpdateEmployeePayload,
} from '@/types/employee';

export const employeeService = {
  list: (params?: EmployeeQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedEmployeeResult>>(ENDPOINTS.employees.list, { params }),

  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.byId(id)),

  create: (payload: CreateEmployeePayload) =>
    apiClient.post<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.create, payload),

  update: (id: string, payload: UpdateEmployeePayload) =>
    apiClient.put<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.update(id), payload),

  delete: (id: string) =>
    apiClient.delete<unknown, { success: boolean; message?: string }>(
      ENDPOINTS.employees.delete(id)
    ),

  me: () =>
    apiClient.get<unknown, ApiResponse<EmployeeDetail>>(ENDPOINTS.employees.me),

  getFaceDetail: (employeeId: string) =>
    apiClient.get<unknown, ApiResponse<EmployeeFaceDetail>>(
      ENDPOINTS.employees.face(employeeId)
    ),

  getFaceDetailByCode: (employeeCode: string) =>
    apiClient.get<unknown, ApiResponse<EmployeeFaceDetail>>(
      ENDPOINTS.employees.faceByCode(employeeCode)
    ),

  registerFace: (employeeId: string, file: File | Blob) => {
    const formData = new FormData();
    const fileName = file instanceof File ? file.name : 'camera-snapshot.jpg';
    formData.append('file', file, fileName);

    return apiClient.post<unknown, ApiResponse<EmployeeFaceDetail>>(
      ENDPOINTS.employees.face(employeeId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  removeFace: (employeeId: string) =>
    apiClient.delete<unknown, { success: boolean; message?: string }>(
      ENDPOINTS.employees.face(employeeId)
    ),
};

export default employeeService;
