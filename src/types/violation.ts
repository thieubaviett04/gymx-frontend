import type { PagedResult } from './api';

export interface EmployeeLookupItem {
  id: string;
  employeeCode: string;
  fullName: string;
  position: 'TRAINER' | 'RECEPTIONIST' | string;
  phoneNumber?: string;
  hasShiftToday: boolean;
}

export interface PenaltyRuleLookupItem {
  id: string;
  ruleCode: string;
  name: string;
  fineAmount: number;
  severityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetAudience: 'GENERAL' | 'STAFF' | 'TRAINER';
  effectiveDate: string;
  description?: string;
}

export interface CreateViolationPayload {
  employeeId: string;
  penaltyRuleId: string;
  occurredAt: string;
  attendanceRecordId?: string | null;
  evidenceUrl?: string | null;
  note?: string | null;
}

export interface ViolationSummaryItem {
  id: string;
  violationCode: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeePosition: string;
  penaltyRuleId: string;
  ruleCode: string;
  ruleName: string;
  fineAmount: number;
  occurredAt: string;
  status: 'ACTIVE' | 'CANCELLED' | string;
  evidenceUrl?: string | null;
  note?: string | null;
  createdDate: string;
}

export interface ViolationDetail {
  id: string;
  violationCode: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeePosition: string;
  penaltyRuleId: string;
  penaltyRuleCode: string;
  penaltyRuleName: string;
  fineAmount: number;
  occurredAt: string;
  attendanceRecordId?: string | null;
  evidenceUrl?: string | null;
  note?: string | null;
  status: string;
  createdDate: string;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  cancelledByName?: string | null;
  recordedByName?: string | null;
}

export interface ViolationDetailDto extends ViolationDetail {}

export interface ViolationQueryParams {
  search?: string;
  employeeId?: string;
  penaltyRuleId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface CancelViolationPayload {
  cancellationReason?: string;
}

export type PagedViolationResult = PagedResult<ViolationSummaryItem>;
