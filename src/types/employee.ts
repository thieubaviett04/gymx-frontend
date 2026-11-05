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
  trainerPricePerSession?: number | null;
  createdDate: string;
}

export interface TrainerDetailInfo {
  trainerId: string;
  specializationId: string;
  specializationName: string;
  experienceYears: number;
  pricePerSession?: number | null;
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
  pricePerSession?: number;
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
  pricePerSession?: number;
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

export interface SpecializationOption {
  id: string;
  name: string;
}

/** Danh sách các chuyên môn HLV chuẩn bị sẵn */
export const SPECIALIZATION_OPTIONS: SpecializationOption[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Gym & Thể hình' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Yoga & Thiền định' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Pilates' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Cardio & Giảm mỡ' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Kickboxing & Võ thuật' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Phục hồi chức năng' },
];

export type EmployeeDetailTab = 'general' | 'trainer' | 'history' | 'notes';

export interface EmployeeFormData {
  fullName: string;
  position: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  baseSalaryRate: number | string;
  address: string;
  nationalId: string;
  hiredAt: string;
  employmentStatus: string;
  specializationId: string;
  experienceYears: number | string;
  pricePerSession: number | string;
  salaryCoefficient?: number | string;
  description: string;
}

export type EmployeeFormErrors = Record<string, string>;

export interface CreateEmployeeFormProps {
  onSuccess?: (newEmployeeId?: string) => void;
  onCancel?: () => void;
}

export interface EditEmployeeFormProps {
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface EmployeeDetailPageProps {
  id?: string;
}

export interface EmployeeDetailTabProps {
  employee: EmployeeDetail;
  isEditing: boolean;
  formData: EmployeeFormData;
  errors: EmployeeFormErrors;
  onChangeField: <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => void;
  onClearFieldError?: (field: keyof EmployeeFormData) => void;
}
