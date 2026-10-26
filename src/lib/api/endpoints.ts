/**
 * Tập trung tất cả URL của GymX Backend API tại đây.
 * Thay vì hard-code URL rải rác trong từng service,
 * chỉ cần import ENDPOINTS và dùng hàm helper build().
 */

const V1 = '/v1';

export const ENDPOINTS = {
  // ─── Auth ────────────────────────────────────────────────────────────────
  auth: {
    login:          `${V1}/auth/login`,
    register:       `${V1}/auth/register`,
    verifyEmail:    `${V1}/auth/verify-email`,
    refreshToken:   `${V1}/auth/refresh-token`,
    logout:         `${V1}/auth/logout`,
    forgotPassword: `${V1}/auth/forgot-password`,
    verifyOtp:      `${V1}/auth/verify-otp`,
    resetPassword:  `${V1}/auth/reset-password`,
    googleLogin:    `${V1}/auth/google-login`,
  },

  // ─── Members ─────────────────────────────────────────────────────────────
  members: {
    list:           `${V1}/members`,
    me:             `${V1}/members/me`,
    byId:           (id: string) => `${V1}/members/${id}`,
    updateProfile:  (id: string) => `${V1}/members/${id}/profile`,
    uploadAvatar:   (id: string) => `${V1}/members/${id}/avatar`,
    packages:       (id: string) => `${V1}/members/${id}/packages`,
    qrCode:         (id: string) => `${V1}/members/${id}/qr-code`,
  },

  // ─── Trainers ─────────────────────────────────────────────────────────────
  trainers: {
    list:           `${V1}/trainers`,
    byId:           (id: string) => `${V1}/trainers/${id}`,
    sessions:       (id: string) => `${V1}/trainers/${id}/sessions`,
    schedule:       (id: string) => `${V1}/trainers/${id}/schedule`,
  },

  // ─── Training Sessions ────────────────────────────────────────────────────
  sessions: {
    list:           `${V1}/sessions`,
    byId:           (id: string) => `${V1}/sessions/${id}`,
    book:           `${V1}/sessions/book`,
    cancel:         (id: string) => `${V1}/sessions/${id}/cancel`,
    complete:       (id: string) => `${V1}/sessions/${id}/complete`,
    noShow:         (id: string) => `${V1}/sessions/${id}/no-show`,
  },

  // ─── Packages ─────────────────────────────────────────────────────────────
  packages: {
    list:           `${V1}/packages`,
    byId:           (id: string) => `${V1}/packages/${id}`,
    purchase:       `${V1}/packages/purchase`,
  },

  // ─── Attendance ───────────────────────────────────────────────────────────
  attendance: {
    list:           `${V1}/attendance`,
    checkIn:        `${V1}/attendance/check-in`,
    checkOut:       (id: string) => `${V1}/attendance/${id}/check-out`,
    today:          `${V1}/attendance/today`,
  },

  // ─── Branches ─────────────────────────────────────────────────────────────
  branches: {
    list:           `${V1}/branches`,
    byId:           (id: string) => `${V1}/branches/${id}`,
  },

  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: {
    users:          `${V1}/admin/users`,
    userById:       (id: string) => `${V1}/admin/users/${id}`,
    stats:          `${V1}/admin/stats`,
    revenue:        `${V1}/admin/revenue`,
  },
} as const;
