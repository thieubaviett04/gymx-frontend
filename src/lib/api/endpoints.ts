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

  adminPackages: {
    list:           `${V1}/admin/packages`,
    byId:           (id: string) => `${V1}/admin/packages/${id}`,
    create:         `${V1}/admin/packages`,
    update:         (id: string) => `${V1}/admin/packages/${id}`,
    delete:         (id: string) => `${V1}/admin/packages/${id}`,
    discontinue:    (id: string) => `${V1}/admin/packages/${id}/discontinue`,
  },

  adminPackageCategories: {
    list:           `${V1}/admin/package-categories`,
    lookup:         `${V1}/admin/package-categories/lookup`,
    byId:           (id: string) => `${V1}/admin/package-categories/${id}`,
    create:         `${V1}/admin/package-categories`,
    update:         (id: string) => `${V1}/admin/package-categories/${id}`,
    delete:         (id: string) => `${V1}/admin/package-categories/${id}`,
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

  employees: {
    list:           `${V1}/admin/employees`,
    byId:           (id: string) => `${V1}/admin/employees/${id}`,
    create:         `${V1}/admin/employees`,
    update:         (id: string) => `${V1}/admin/employees/${id}`,
    delete:         (id: string) => `${V1}/admin/employees/${id}`,
    me:             `${V1}/employees/me`,
  },

  adminPenaltyRules: {
    list:           `${V1}/admin/penalty-rules`,
    lookup:         `${V1}/admin/penalty-rules/lookup`,
    byId:           (id: string) => `${V1}/admin/penalty-rules/${id}`,
    create:         `${V1}/admin/penalty-rules`,
    update:         (id: string) => `${V1}/admin/penalty-rules/${id}`,
    delete:         (id: string) => `${V1}/admin/penalty-rules/${id}`,
    discontinue:    (id: string) => `${V1}/admin/penalty-rules/${id}/discontinue`,
  },

  adminViolations: {
    list:            `${V1}/admin/violations`,
    byId:            (id: string) => `${V1}/admin/violations/${id}`,
    create:          `${V1}/admin/violations`,
    delete:          (id: string) => `${V1}/admin/violations/${id}`,
    uploadEvidence:  `${V1}/admin/violations/upload-evidence`,
    employeesLookup: `${V1}/admin/violations/employees-lookup`,
  },

  adminPayroll: {
    formulas: {
      list: `${V1}/admin/payroll/formulas`,
      lookup: `${V1}/admin/payroll/formulas/lookup`,
      byId: (id: string) => `${V1}/admin/payroll/formulas/${id}`,
      create: `${V1}/admin/payroll/formulas`,
      update: (id: string) => `${V1}/admin/payroll/formulas/${id}`,
      toggleStatus: (id: string) => `${V1}/admin/payroll/formulas/${id}/status`,
    },
    periods: {
      list: `${V1}/admin/payroll/periods`,
      byId: (id: string) => `${V1}/admin/payroll/periods/${id}`,
      calculate: `${V1}/admin/payroll/periods/calculate`,
      lock: (id: string) => `${V1}/admin/payroll/periods/${id}/lock`,
    },
    payslips: {
      list: `${V1}/admin/payroll/payslips`,
      byId: (id: string) => `${V1}/admin/payroll/payslips/${id}`,
      updateKpiBonus: (id: string) => `${V1}/admin/payroll/payslips/${id}/kpi-bonus`,
    },
    bonuses: {
      list: `${V1}/admin/payroll/bonuses`,
      employeesLookup: `${V1}/admin/payroll/bonuses/employees-lookup`,
      byId: (id: string) => `${V1}/admin/payroll/bonuses/${id}`,
    },
  },

  adminFinance: {
    expenses: {
      list: `${V1}/admin/expenses`,
      categories: `${V1}/admin/expenses/categories`,
      byId: (id: string) => `${V1}/admin/expenses/${id}`,
      create: `${V1}/admin/expenses`,
      cancel: (id: string) => `${V1}/admin/expenses/${id}/cancel`,
    },
    invoices: {
      list: `${V1}/admin/invoices`,
    },
    analytics: {
      revenue: `${V1}/admin/analytics/revenue`,
      export: `${V1}/admin/analytics/export`,
    },
  },

  adminKpi: {
    templates: {
      list: `${V1}/admin/kpi-templates`,
      lookup: `${V1}/admin/kpi-templates/lookup`,
      byId: (id: string) => `${V1}/admin/kpi-templates/${id}`,
      create: `${V1}/admin/kpi-templates`,
      update: (id: string) => `${V1}/admin/kpi-templates/${id}`,
      delete: (id: string) => `${V1}/admin/kpi-templates/${id}`,
    },
    employeeKpis: {
      list: `${V1}/admin/employee-kpis`,
      byId: (id: string) => `${V1}/admin/employee-kpis/${id}`,
      assign: `${V1}/admin/employee-kpis/assign`,
      update: (id: string) => `${V1}/admin/employee-kpis/${id}`,
      delete: (id: string) => `${V1}/admin/employee-kpis/${id}`,
    },
  },

  employeeKpi: {
    myKpi: `${V1}/employees/my-kpi`,
  },
  staffPayroll: {
    myPayslips: `${V1}/staff/payroll/my-payslips`,
  },
} as const;
