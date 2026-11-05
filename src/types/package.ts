// ─── Enums / Constants ───────────────────────────────────────────────────────
export type PackageStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type PackageType = 'BASIC' | 'PRO' | 'ELITE' | 'CUSTOM';
export type DurationUnit = 'DAY' | 'MONTH' | 'YEAR';

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Chưa kích hoạt',
  DISCONTINUED: 'Ngừng kinh doanh',
};

export const PACKAGE_DURATION_OPTIONS = [
  { value: 'ALL', label: 'Tất cả thời hạn' },
  { value: '1', label: '1 tháng (≤ 1 tháng)' },
  { value: '6', label: '6 tháng (≤ 6 tháng)' },
  { value: '12', label: '12 tháng (≤ 1 năm)' },
] as const;

export const PACKAGE_SORT_OPTIONS = [
  { value: 'latest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp đến cao' },
  { value: 'price_desc', label: 'Giá: Cao đến thấp' },
] as const;

// ─── Backend DTOs ────────────────────────────────────────────────────────────

/** DTO tóm tắt gói tập từ API GetPackages */
export interface PackageSummary {
  id: string;
  packageCode: string;
  name: string;
  price: number;
  durationMonths: number;
  durationDays: number;
  maxCheckins: number | null;
  description: string | null;
  status: PackageStatus;
  effectiveStartDate: string; // YYYY-MM-DD
  effectiveEndDate: string | null; // YYYY-MM-DD
  previousPackageId: string | null;
  previousPackageCode: string | null;
  activeMembersCount: number;
  createdDate: string;
}

/** DTO chi tiết gói tập từ API GetPackageById */
export interface PackageDetail extends PackageSummary {
  lastModifiedDate: string | null;
}

/** Request payload tạo gói tập mới */
export interface CreatePackagePayload {
  name: string;
  price: number;
  durationMonths: number;
  maxCheckins?: number | null;
  description?: string | null;
  effectiveStartDate: string; // YYYY-MM-DD
  effectiveEndDate?: string | null; // YYYY-MM-DD
}

/** Request payload cập nhật gói tập */
export interface UpdatePackagePayload {
  name: string;
  price: number;
  durationMonths: number;
  maxCheckins?: number | null;
  description?: string | null;
  status?: PackageStatus;
  effectiveStartDate: string; // YYYY-MM-DD
  effectiveEndDate?: string | null; // YYYY-MM-DD
  mode?: 'DISCONTINUE_ONLY' | 'DISCONTINUE_AND_CREATE' | null;
}

/** Query params tìm kiếm và lọc gói tập */
export interface PackageQueryParams {
  search?: string;
  durationFilter?: string;
  status?: string;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}

/** Kết quả phân trang danh sách gói tập */
export interface PagedPackageResult {
  items: PackageSummary[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ─── Form State & Errors ─────────────────────────────────────────────────────

export interface PackageFormData {
  name: string;
  price: string | number;
  durationMonths: string | number;
  maxCheckins: string | number;
  description: string;
  status: PackageStatus;
  effectiveStartDate: string;
  effectiveEndDate: string;
}

export type PackageFormErrors = Partial<Record<keyof PackageFormData | 'general', string>>;

// ─── Legacy Types (Giữ nguyên để tương thích code cũ nếu có) ─────────────────
export interface Package {
  id: string;
  name: string;
  type?: PackageType;
  description?: string;
  price: number;
  duration: number;
  durationUnit?: DurationUnit;
  maxSessionsPerWeek?: number;
  ptSessionsIncluded?: number;
  imageUrl?: string;
  isPopular?: boolean;
  status: PackageStatus;
  createdAt?: string;
}

export type MemberPackageStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING';

export interface MemberPackage {
  id: string;
  memberId: string;
  packageId: string;
  package: Package;
  startDate: string;
  endDate: string;
  remainingPtSessions: number;
  status: MemberPackageStatus;
  purchasedAt: string;
}
