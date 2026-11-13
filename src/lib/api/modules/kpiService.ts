import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PagedResult } from '@/types/api';
import type {
  AssignKpiPayload,
  AssignKpiResult,
  CreateKpiTemplatePayload,
  EmployeeKpiDetail,
  EmployeeKpiProgressSummary,
  EmployeeKpiQueryParams,
  KpiTemplateDetail,
  KpiTemplateLookup,
  KpiTemplateQueryParams,
  KpiTemplateSummary,
  MyKpiDetail,
  UpdateEmployeeKpiPayload,
  UpdateKpiTemplatePayload,
} from '@/types/kpi';

export const kpiService = {
  getTemplates: (params?: KpiTemplateQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedResult<KpiTemplateSummary>>>(
      ENDPOINTS.adminKpi.templates.list,
      { params }
    ),

  getTemplatesLookup: (targetRole?: string) =>
    apiClient.get<unknown, ApiResponse<KpiTemplateLookup[]>>(
      ENDPOINTS.adminKpi.templates.lookup,
      { params: targetRole ? { targetRole } : undefined }
    ),

  getTemplateById: (id: string) =>
    apiClient.get<unknown, ApiResponse<KpiTemplateDetail>>(
      ENDPOINTS.adminKpi.templates.byId(id)
    ),

  createTemplate: (payload: CreateKpiTemplatePayload) =>
    apiClient.post<unknown, ApiResponse<KpiTemplateDetail>>(
      ENDPOINTS.adminKpi.templates.create,
      payload
    ),

  updateTemplate: (id: string, payload: UpdateKpiTemplatePayload) =>
    apiClient.put<unknown, ApiResponse<KpiTemplateDetail>>(
      ENDPOINTS.adminKpi.templates.update(id),
      payload
    ),

  deleteTemplate: (id: string) =>
    apiClient.delete<unknown, ApiResponse<{ success: boolean; message: string }>>(
      ENDPOINTS.adminKpi.templates.delete(id)
    ),

  getEmployeeKpis: (params?: EmployeeKpiQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedResult<EmployeeKpiProgressSummary>>>(
      ENDPOINTS.adminKpi.employeeKpis.list,
      { params }
    ),

  getEmployeeKpiById: (id: string) =>
    apiClient.get<unknown, ApiResponse<EmployeeKpiDetail>>(
      ENDPOINTS.adminKpi.employeeKpis.byId(id)
    ),

  assignKpi: (payload: AssignKpiPayload) =>
    apiClient.post<unknown, ApiResponse<AssignKpiResult>>(
      ENDPOINTS.adminKpi.employeeKpis.assign,
      payload
    ),

  updateEmployeeKpi: (id: string, payload: UpdateEmployeeKpiPayload) =>
    apiClient.put<unknown, ApiResponse<{ success: boolean; message: string }>>(
      ENDPOINTS.adminKpi.employeeKpis.update(id),
      payload
    ),

  deleteEmployeeKpi: (id: string) =>
    apiClient.delete<unknown, ApiResponse<{ success: boolean; message: string }>>(
      ENDPOINTS.adminKpi.employeeKpis.delete(id)
    ),

  getMyKpi: (params?: { month?: number; year?: number }) =>
    apiClient.get<unknown, ApiResponse<MyKpiDetail>>(
      ENDPOINTS.employeeKpi.myKpi,
      { params }
    ),
};

export default kpiService;

