export type PackageCategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface PackageCategorySummary {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: PackageCategoryStatus;
  packagesCount: number;
  createdDate: string;
  lastModifiedDate: string | null;
}

export type PackageCategoryDetail = PackageCategorySummary;

export interface PackageCategoryLookup {
  id: string;
  code: string;
  name: string;
}

export interface CreatePackageCategoryPayload {
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdatePackageCategoryPayload {
  name: string;
  description?: string | null;
  status: PackageCategoryStatus;
}

export interface PackageCategoryQueryParams {
  search?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PagedPackageCategoryResult {
  items: PackageCategorySummary[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const PACKAGE_CATEGORY_STATUS_LABELS: Record<PackageCategoryStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};

export interface PackageCategoryFormData {
  code: string;
  name: string;
  description: string;
  status: PackageCategoryStatus;
}

export interface PackageCategoryFormErrors {
  code?: string;
  name?: string;
  description?: string;
}
