/**
 * Types cho module Quản lý nhân viên (Admin Module - P6.1)
 * Đối chiếu theo Backend GymX.Application.Modules.Employees.DTOs
 */

export interface EmployeeSummary {
  id: string;
  userId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  nationalId?: string | null;
  position: string;
  baseSalaryRate: number;
  hiredAt: string;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | string;
  avatarUrl?: string | null;
  trainerSpecialization?: string | null;
  trainerExperienceYears?: number | null;
  createdDate: string;
}

export interface TrainerDetailInfo {
  trainerId: string;
  specializationId: string;
  specializationName: string;
  experienceYears: number;
  salaryCoefficient?: number | null;
  description?: string | null;
  ratingAvg: number;
  ratingCount: number;
}

export interface EmployeeDetail {
  id: string;
  userId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  nationalId?: string | null;
  gender?: 'NAM' | 'NU' | 'KHAC' | string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  position: string;
  baseSalaryRate: number;
  hiredAt: string;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | string;
  isDeleted: boolean;
  createdDate: string;
  trainerInfo?: TrainerDetailInfo | null;
}

export interface CreateEmployeePayload {
  fullName: string;
  email: string;
  nationalId: string;
  position: string;
  baseSalaryRate: number;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  hiredAt?: string;

  // HLV info (khi Position === 'TRAINER')
  specializationId?: string;
  experienceYears?: number;
  salaryCoefficient?: number;
  description?: string;
}

export interface UpdateEmployeePayload {
  fullName: string;
  email: string;
  position: string;
  baseSalaryRate: number;
  employmentStatus: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;

  // HLV info (khi Position === 'TRAINER')
  specializationId?: string;
  experienceYears?: number;
  salaryCoefficient?: number;
  description?: string;
}

export interface EmployeeQueryParams {
  search?: string;
  position?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PagedEmployeeResult {
  items: EmployeeSummary[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Danh sách vai trò / chức vụ nhân viên */
export const EMPLOYEE_POSITIONS = [
  { value: 'TRAINER', label: 'Huấn luyện viên (Trainer)' },
  { value: 'RECEPTIONIST', label: 'Lễ tân' },
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'STAFF', label: 'Tạp vụ / Nhân viên' },
] as const;

/** Danh sách trạng thái làm việc */
export const EMPLOYEE_STATUSES = [
  { value: 'ACTIVE', label: 'Đang làm', color: '#10B981' },
  { value: 'INACTIVE', label: 'Đã nghỉ', color: '#64748B' },
] as const;
