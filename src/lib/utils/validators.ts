import { REGEX, VALIDATION_LIMITS } from './constants';
import type { EmployeeFormData, EmployeeFormErrors } from '@/types/employee';
import type { PackageFormData, PackageFormErrors } from '@/types/package';

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

export type FormErrors = Partial<Record<keyof RegisterFormData | 'general', string>> & {
  unverifiedEmail?: boolean;
};

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

/**
 * Validate form thêm mới nhân viên
 */
export function validateCreateEmployee(form: EmployeeFormData): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};

  // 1. Họ và tên
  if (!form.fullName.trim()) {
    errors.fullName = 'Họ và tên không được để trống.';
  } else if (form.fullName.trim().length > VALIDATION_LIMITS.FULL_NAME_MAX_LENGTH) {
    errors.fullName = `Họ và tên tối đa ${VALIDATION_LIMITS.FULL_NAME_MAX_LENGTH} ký tự.`;
  }

  // 2. Email
  if (!form.email.trim()) {
    errors.email = 'Email không được để trống.';
  } else if (!REGEX.EMAIL.test(form.email.trim())) {
    errors.email = 'Email không đúng định dạng.';
  }

  // 3. Vai trò
  if (!form.position) {
    errors.position = 'Vui lòng chọn vai trò làm việc.';
  }

  // 4. Số điện thoại (Nếu nhập thì phải có 10 chữ số bắt đầu bằng 0)
  if (form.phoneNumber.trim()) {
    const cleanPhone = form.phoneNumber.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(cleanPhone)) {
      errors.phoneNumber = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.';
    }
  }

  // 5. Số CCCD (Bắt buộc đúng 12 chữ số theo BE & thực tế)
  if (!form.nationalId.trim()) {
    errors.nationalId = 'Số CCCD không được để trống.';
  } else if (!/^\d{12}$/.test(form.nationalId.trim())) {
    errors.nationalId = 'Số CCCD phải bao gồm đúng 12 chữ số.';
  }

  // 6. Mức lương cơ bản
  if (
    form.baseSalaryRate === '' ||
    isNaN(Number(form.baseSalaryRate)) ||
    Number(form.baseSalaryRate) < 0
  ) {
    errors.baseSalaryRate = 'Mức lương cơ bản phải là số không âm.';
  }

  // 7. Địa chỉ thường trú
  if (!form.address.trim()) {
    errors.address = 'Địa chỉ thường trú không được để trống.';
  }

  // 8. Ràng buộc riêng khi chọn Huấn luyện viên
  if (form.position === 'TRAINER') {
    if (!form.specializationId) {
      errors.specializationId = 'Vui lòng chọn chuyên môn HLV.';
    }

    if (
      form.experienceYears === '' ||
      isNaN(Number(form.experienceYears)) ||
      Number(form.experienceYears) <= 0
    ) {
      errors.experienceYears = 'Số năm kinh nghiệm của HLV phải lớn hơn 0.';
    }

    if (
      form.pricePerSession === '' ||
      isNaN(Number(form.pricePerSession)) ||
      Number(form.pricePerSession) < 0
    ) {
      errors.pricePerSession = 'Giá buổi tập phải lớn hơn hoặc bằng 0.';
    }
  }

  return errors;
}

/**
 * Validate form cập nhật nhân viên (In-place edit / Edit form)
 */
export function validateUpdateEmployee(form: EmployeeFormData): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Họ tên nhân viên không được để trống.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email không được để trống.';
  } else if (!REGEX.EMAIL.test(form.email.trim())) {
    errors.email = 'Email không đúng định dạng.';
  }

  if (!form.position) {
    errors.position = 'Vui lòng chọn vai trò làm việc.';
  }

  if (
    form.baseSalaryRate === '' ||
    isNaN(Number(form.baseSalaryRate)) ||
    Number(form.baseSalaryRate) < 0
  ) {
    errors.baseSalaryRate = 'Mức lương cơ bản phải là số không âm.';
  }

  if (form.phoneNumber.trim()) {
    const cleanPhone = form.phoneNumber.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(cleanPhone)) {
      errors.phoneNumber = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.';
    }
  }

  if (form.position === 'TRAINER') {
    if (!form.specializationId) {
      errors.specializationId = 'Vui lòng chọn chuyên môn HLV.';
    }
    if (
      form.experienceYears === '' ||
      isNaN(Number(form.experienceYears)) ||
      Number(form.experienceYears) <= 0
    ) {
      errors.experienceYears = 'Số năm kinh nghiệm phải lớn hơn 0 (tối thiểu 1 năm).';
    }
    if (
      form.pricePerSession !== undefined &&
      form.pricePerSession !== '' &&
      (isNaN(Number(form.pricePerSession)) || Number(form.pricePerSession) < 0)
    ) {
      errors.pricePerSession = 'Giá buổi tập phải lớn hơn hoặc bằng 0.';
    }
  }

  return errors;
}

/**
 * Validate form Gói tập (Tạo mới & Cập nhật)
 */
export function validatePackageForm(
  form: PackageFormData,
  isEdit = false
): PackageFormErrors {
  const errors: PackageFormErrors = {};

  // 1. Tên gói tập
  if (!form.name.trim()) {
    errors.name = 'Tên gói tập không được để trống.';
  } else if (form.name.trim().length > 100) {
    errors.name = 'Tên gói tập tối đa 100 ký tự.';
  }

  // 2. Giá gói tập
  if (form.price === '' || form.price === undefined || form.price === null) {
    errors.price = 'Vui lòng nhập giá của gói tập.';
  } else {
    const numPrice = Number(form.price);
    if (isNaN(numPrice) || numPrice < 0) {
      errors.price = 'Giá gói tập phải là số thực không âm.';
    }
  }

  // 3. Thời hạn (tháng)
  if (form.durationMonths === '' || form.durationMonths === undefined || form.durationMonths === null) {
    errors.durationMonths = 'Vui lòng nhập thời hạn gói tập.';
  } else {
    const numMonths = Number(form.durationMonths);
    if (isNaN(numMonths) || numMonths <= 0 || !Number.isInteger(numMonths)) {
      errors.durationMonths = 'Thời hạn gói tập phải là số nguyên dương lớn hơn 0.';
    }
  }

  // 4. Giới hạn check-in (tùy chọn)
  if (form.maxCheckins !== '' && form.maxCheckins !== undefined && form.maxCheckins !== null) {
    const numCheckins = Number(form.maxCheckins);
    if (isNaN(numCheckins) || numCheckins <= 0 || !Number.isInteger(numCheckins)) {
      errors.maxCheckins = 'Số lượt check-in tối đa phải là số nguyên dương.';
    }
  }

  // 5. Ngày bắt đầu áp dụng
  if (!form.effectiveStartDate) {
    errors.effectiveStartDate = 'Vui lòng chọn ngày bắt đầu áp dụng.';
  } else if (!isEdit) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (form.effectiveStartDate < todayStr) {
      errors.effectiveStartDate = 'Ngày bắt đầu áp dụng không được chọn ngày ở quá khứ.';
    }
  }

  // 6. Ngày kết thúc áp dụng (tùy chọn)
  if (form.effectiveEndDate) {
    if (form.effectiveStartDate && form.effectiveEndDate < form.effectiveStartDate) {
      errors.effectiveEndDate = 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu áp dụng.';
    }
  }

  return errors;
}
