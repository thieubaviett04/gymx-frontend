export type PackageStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type PackageFormStatus = PackageStatus | 'UPCOMING';
export type ComputedPackageStatus = 'ACTIVE' | 'UPCOMING' | 'INACTIVE' | 'DISCONTINUED';
export type PackageType = 'BASIC' | 'PRO' | 'ELITE' | 'CUSTOM';
export type DurationUnit = 'DAY' | 'MONTH' | 'YEAR';

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  ACTIVE: 'Đang bán',
  INACTIVE: 'Tạm ngưng',
  DISCONTINUED: 'Ngừng bán',
};

export function getPackageStatusBadge(
  status?: PackageStatus | string | null,
  effectiveStartDate?: string | null
): { label: string; variant: 'active' | 'upcoming' | 'inactive' | 'discontinued' } {
  const norm = (status || '').toUpperCase();
  if (norm === 'DISCONTINUED') {
    return { label: 'Ngừng bán', variant: 'discontinued' };
  }
  if (norm === 'INACTIVE') {
    return { label: 'Tạm ngưng', variant: 'inactive' };
  }
  if (norm === 'UPCOMING') {
    return { label: 'Chuẩn bị', variant: 'upcoming' };
  }
  if (effectiveStartDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(effectiveStartDate);
    start.setHours(0, 0, 0, 0);
    if (!isNaN(start.getTime()) && start > today) {
      return { label: 'Chuẩn bị', variant: 'upcoming' };
    }
  }
  return { label: 'Đang bán', variant: 'active' };
}

export const PACKAGE_DURATION_OPTIONS = [
  { value: 'ALL', label: 'Tất cả thời hạn' },
  { value: '1', label: 'Dưới 1 tháng' },
  { value: '3', label: 'Dưới 3 tháng' },
  { value: '6', label: 'Dưới 6 tháng' },
  { value: '12', label: 'Dưới 12 tháng' },
] as const;

export const PACKAGE_SORT_OPTIONS = [
  { value: 'latest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp đến cao' },
  { value: 'price_desc', label: 'Giá: Cao đến thấp' },
] as const;

export interface PackageCategoryLookup {
  id: string;
  code: string;
  name: string;
}

export interface PackageSummary {
  id: string;
  packageCode: string;
  name: string;
  price: number;
  durationMonths: number;
  durationDays: number;
  description: string | null;
  status: PackageStatus;
  effectiveStartDate: string;
  categoryId: string | null;
  categoryCode: string | null;
  categoryName: string | null;
  previousPackageId: string | null;
  previousPackageCode: string | null;
  activeMembersCount: number;
  hasAnyPurchase?: boolean;
  hasEverBeenPurchased?: boolean;
  createdDate: string;
}

export interface PackageDetail extends PackageSummary {
  lastModifiedDate: string | null;
}

export interface CreatePackagePayload {
  name: string;
  price: number;
  status?: PackageStatus | string;
  durationMonths: number;
  description?: string | null;
  categoryId?: string | null;
  effectiveStartDate: string;
}

export interface UpdatePackagePayload {
  name: string;
  price: number;
  durationMonths: number;
  description?: string | null;
  categoryId?: string | null;
  status?: PackageStatus | string;
  effectiveStartDate: string;
  mode?: 'DISCONTINUE_ONLY' | 'DISCONTINUE_AND_CREATE' | null;
}

export interface PackageQueryParams {
  search?: string;
  durationFilter?: string;
  status?: string;
  sortBy?: string;
  categoryId?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PagedPackageResult {
  items: PackageSummary[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PackageFormData {
  name: string;
  price: string | number;
  durationMonths: string | number;
  categoryId: string;
  description: string;
  status: PackageFormStatus;
  effectiveStartDate: string;
}

export type PackageFormErrors = Partial<Record<keyof PackageFormData | 'general', string>>;

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
