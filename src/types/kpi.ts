export type KpiRole = 'TRAINER' | 'RECEPTIONIST';
export type KpiStatus = 'IN_PROGRESS' | 'ACHIEVED' | 'FAILED' | 'CLOSED';
export type KpiTemplateStatus = 'ACTIVE' | 'INACTIVE';

export interface KpiTemplateLookup {
  id: string;
  name: string;
  targetRole: KpiRole;
  targetPtSessions?: number | null;
  targetRevenue: number;
  targetNewMembers?: number | null;
  targetBonusAmount: number;
}

export interface KpiTemplateSummary extends KpiTemplateLookup {
  description?: string | null;
  status: KpiTemplateStatus;
  createdDate: string;
}

export interface KpiTemplateDetail extends KpiTemplateSummary {
  lastModifiedDate?: string | null;
}

export interface CreateKpiTemplatePayload {
  name: string;
  targetRole: KpiRole;
  targetRevenue: number;
  targetBonusAmount: number;
  targetPtSessions?: number | null;
  targetNewMembers?: number | null;
  description?: string | null;
  status?: KpiTemplateStatus;
}

export interface UpdateKpiTemplatePayload {
  name: string;
  targetRole: KpiRole;
  targetRevenue: number;
  targetBonusAmount: number;
  targetPtSessions?: number | null;
  targetNewMembers?: number | null;
  description?: string | null;
  status: KpiTemplateStatus;
}

export interface EmployeeKpiProgressSummary {
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  position: KpiRole;
  templateName: string;
  month?: number;
  year?: number;
  targetPtSessions?: number | null;
  actualPtSessions: number;
  sessionProgress: number;
  targetRevenue: number;
  actualRevenue: number;
  revenueProgress: number;
  targetNewMembers?: number | null;
  actualNewMembers: number;
  overallProgress: number;
  targetBonusAmount: number;
  status: KpiStatus;
  note?: string | null;
  assignedAt: string;
}

export type EmployeeKpiProgressItem = EmployeeKpiProgressSummary;

export interface EmployeeKpiDetail extends EmployeeKpiProgressSummary {
  kpiTemplateId: string;
  month: number;
  year: number;
  completedPtSessionsList?: Array<{
    sessionId: string;
    memberName: string;
    completedAt: string;
    packageTitle?: string;
  }>;
  achievedOrdersList?: Array<{
    orderId: string;
    orderCode: string;
    customerName: string;
    amount: number;
    createdAt: string;
  }>;
}

export interface AssignKpiPayload {
  kpiTemplateId: string;
  month: number;
  year: number;
  employeeIds: string[];
  note?: string;
}

export interface AssignKpiResult {
  assignedCount: number;
  skippedCount: number;
  message: string;
}

export interface UpdateEmployeeKpiPayload {
  targetRevenue: number;
  targetBonusAmount: number;
  targetPtSessions?: number | null;
  targetNewMembers?: number | null;
  note?: string | null;
}

export interface MyKpiDetail {
  id: string;
  templateName: string;
  month: number;
  year: number;
  targetPtSessions?: number | null;
  actualPtSessions: number;
  sessionProgress: number;
  targetRevenue: number;
  actualRevenue: number;
  revenueProgress: number;
  targetBonusAmount: number;
  overallProgress: number;
  status: KpiStatus;
  note?: string | null;
}

export interface KpiTemplateQueryParams {
  search?: string;
  targetRole?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface EmployeeKpiQueryParams {
  month?: number;
  year?: number;
  search?: string;
  position?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

