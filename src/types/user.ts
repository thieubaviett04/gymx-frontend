export type Role = 'admin' | 'trainer' | 'receptionist' | 'member';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: Role;
  branchId?: string;
  createdAt: string;
}
