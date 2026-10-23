import { REGEX, VALIDATION_LIMITS } from './constants';

export type RegisterFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type FormErrors = Partial<Record<keyof RegisterFormData | 'general', string>>;

/**
 * Validate Họ và tên
 */
export function validateFullName(value: string): string | undefined {
  if (!value.trim()) return 'Họ và tên không được để trống.';
  if (value.trim().length > VALIDATION_LIMITS.FULL_NAME_MAX_LENGTH) {
    return `Họ và tên tối đa ${VALIDATION_LIMITS.FULL_NAME_MAX_LENGTH} ký tự.`;
  }
  return undefined;
}

/**
 * Validate Email
 */
export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email không được để trống.';
  if (!REGEX.EMAIL.test(value.trim())) return 'Email không đúng định dạng.';
  return undefined;
}

/**
 * Validate Số điện thoại VN
 */
export function validatePhone(value: string): string | undefined {
  const clean = value.trim().replace(/[\s.-]/g, '');
  if (!clean) return 'Số điện thoại không được để trống.';
  if (!REGEX.VIETNAM_PHONE.test(clean)) return 'Số điện thoại không hợp lệ (VD: 0987654321).';
  return undefined;
}

/**
 * Validate Mật khẩu (tối thiểu 8 ký tự, hoa, thường, số, ký tự đặc biệt)
 */
export function validatePassword(value: string): string | undefined {
  if (!value) return 'Mật khẩu không được để trống.';
  if (value.length < VALIDATION_LIMITS.PASSWORD_MIN_LENGTH) {
    return `Mật khẩu phải có ít nhất ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} ký tự.`;
  }
  if (!REGEX.PASSWORD_HAS_UPPERCASE.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa.';
  if (!REGEX.PASSWORD_HAS_LOWERCASE.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường.';
  if (!REGEX.PASSWORD_HAS_NUMBER.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ số.';
  if (!REGEX.PASSWORD_HAS_SPECIAL.test(value)) {
    return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (VD: @, #, $, !...).';
  }
  return undefined;
}

/**
 * Validate theo tên trường (dùng cho blur/change event của auth form)
 */
export function validateAuthField(name: string, value: string): string | undefined {
  switch (name) {
    case 'fullName':
      return validateFullName(value);
    case 'email':
      return validateEmail(value);
    case 'phoneNumber':
    case 'phone':
      return validatePhone(value);
    case 'password':
      return validatePassword(value);
    default:
      return undefined;
  }
}

/**
 * Validate toàn bộ form đăng ký
 */
export function validateRegisterForm(data: RegisterFormData): FormErrors {
  const errors: FormErrors = {};

  const fnErr = validateFullName(data.fullName);
  if (fnErr) errors.fullName = fnErr;

  const emErr = validateEmail(data.email);
  if (emErr) errors.email = emErr;

  const phErr = validatePhone(data.phoneNumber);
  if (phErr) errors.phoneNumber = phErr;

  const pwErr = validatePassword(data.password);
  if (pwErr) errors.password = pwErr;

  return errors;
}

/**
 * Validate toàn bộ form đăng nhập
 */
export function validateLoginForm(data: LoginFormData): FormErrors {
  const errors: FormErrors = {};

  const emErr = validateEmail(data.email);
  if (emErr) errors.email = emErr;

  if (!data.password) {
    errors.password = 'Mật khẩu không được để trống.';
  }

  return errors;
}
