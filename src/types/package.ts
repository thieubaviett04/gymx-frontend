import { PaginationParams } from './api';

// ─── Enums / Constants ───────────────────────────────────────────────────────
export type PackageType = 'BASIC' | 'PRO' | 'ELITE' | 'CUSTOM';
export type PackageStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type DurationUnit = 'DAY' | 'MONTH' | 'YEAR';

// ─── Gói tập ─────────────────────────────────────────────────────────────────
export interface Package {
  id: string;
  name: string;
  type: PackageType;
  description?: string;
  price: number;                  // VND
  duration: number;               // số lượng theo đơn vị
  durationUnit: DurationUnit;
  maxSessionsPerWeek?: number;
  ptSessionsIncluded: number;     // buổi PT kèm theo
  imageUrl?: string;
  isPopular: boolean;
  status: PackageStatus;
  createdAt: string;
}

// ─── Gói tập đã đăng ký của Member ───────────────────────────────────────────
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

// ─── Query Params ─────────────────────────────────────────────────────────────
export interface PackageQueryParams extends PaginationParams {
  type?: PackageType;
  status?: PackageStatus;
}
