/**
 * Common Constants & Regex Patterns for GymX
 */

// Regex patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  VIETNAM_PHONE: /^(0[3|5|7|8|9])\d{8}$/,
  PASSWORD_HAS_UPPERCASE: /[A-Z]/,
  PASSWORD_HAS_LOWERCASE: /[a-z]/,
  PASSWORD_HAS_NUMBER: /\d/,
  PASSWORD_HAS_SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  FULL_NAME_MAX_LENGTH: 150,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_LENGTH: 10,
} as const;

// Default pagination
export const DEFAULT_PAGINATION = {
  PAGE_INDEX: 1,
  PAGE_SIZE: 10,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_STORAGE: 'gymx-auth-storage',
  THEME_STORAGE: 'gymx-theme',
} as const;
