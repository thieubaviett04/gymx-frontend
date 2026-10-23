import { UserRole } from './auth';
import { Branch } from './branch';

/** Hồ sơ đầy đủ của User (trả về từ /users/:id) */
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  roles: UserRole[];
  branchId?: string;
  branch?: Branch;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Dữ liệu User tối giản lưu trong AuthStore */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  avatarUrl?: string | null;
}
