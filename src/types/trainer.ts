import { PaginationParams } from './api';
import { Package } from './package';
import { User } from './user';

// ─── Enums ───────────────────────────────────────────────────────────────────
export type TrainingSessionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type TrainerSpecialty =
  | 'STRENGTH'     // Thể hình & Sức mạnh
  | 'YOGA'
  | 'HIIT'
  | 'PILATES'
  | 'BOXING'
  | 'CARDIO'
  | 'NUTRITION';   // Dinh dưỡng

// ─── Trainer Profile ──────────────────────────────────────────────────────────
export interface TrainerProfile {
  id: string;
  user: User;
  specialties: TrainerSpecialty[];
  bio?: string;
  certifications: string[];
  yearsOfExperience: number;
  rating: number;         // 0.0 – 5.0
  totalSessions: number;
  isAvailable: boolean;
}

// ─── Training Session ─────────────────────────────────────────────────────────
export interface TrainingSession {
  id: string;
  trainerId: string;
  trainerName: string;
  memberId: string;
  memberName: string;
  memberAvatarUrl?: string;
  packageId?: string;
  package?: Package;
  scheduledAt: string;
  durationMinutes: number;
  status: TrainingSessionStatus;
  notes?: string;
  completedAt?: string;
}

// ─── Booking (đặt lịch PT) ────────────────────────────────────────────────────
export interface BookingRequest {
  trainerId: string;
  packageId: string;
  scheduledAt: string;    // ISO 8601
  notes?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────
export interface TrainerQueryParams extends PaginationParams {
  specialty?: TrainerSpecialty;
  isAvailable?: boolean;
}

export interface SessionQueryParams extends PaginationParams {
  trainerId?: string;
  memberId?: string;
  status?: TrainingSessionStatus;
  date?: string;          // YYYY-MM-DD
}
