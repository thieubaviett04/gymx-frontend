export type RegisterFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type FormErrors = Partial<Record<keyof RegisterFormData | 'general', string>>;

/**
 * Validate Họ và tên
 */
export function validateFullName(value: string): string | undefined {
  if (!value.trim()) return 'Họ và tên không được để trống.';
  if (value.trim().length > 150) return 'Họ và tên tối đa 150 ký tự.';
  return undefined;
}

/**
 * Validate Email
 */
export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email không được để trống.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Email không đúng định dạng.';
  return undefined;
}

/**
 * Validate Số điện thoại VN
 */
export function validatePhone(value: string): string | undefined {
  const clean = value.trim().replace(/[\s.-]/g, '');
  if (!clean) return 'Số điện thoại không được để trống.';
  if (!/^(0[3|5|7|8|9])\d{8}$/.test(clean)) return 'Số điện thoại không hợp lệ (VD: 0987654321).';
  return undefined;
}

/**
 * Validate Mật khẩu (tối thiểu 8 ký tự, hoa, thường, số, ký tự đặc biệt)
 */
export function validatePassword(value: string): string | undefined {
  if (!value) return 'Mật khẩu không được để trống.';
  if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (!/[A-Z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa.';
  if (!/[a-z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường.';
  if (!/\d/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ số.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (VD: @, #, $, !...).';
  return undefined;
}

/**
 * Validate theo tên trường (dùng cho blur/change event)
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
 * Bóc tách lỗi từ Backend ASP.NET Core (FluentValidation + Business Error Codes)
 */
export function parseAuthBackendError(err: any): FormErrors {
  if (!err.response) {
    return {
      general:
        'Không thể kết nối đến máy chủ backend (Network Error). Vui lòng đảm bảo backend API đang chạy tại http://localhost:5113.',
    };
  }

  const data = err.response?.data;

  // Case 1: Backend FluentValidation (ValidationProblemDetails 400)
  if (data?.errors && typeof data.errors === 'object') {
    const backendErrors: FormErrors = {};
    for (const [key, msgs] of Object.entries(data.errors)) {
      const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'fullname') backendErrors.fullName = msg;
      else if (lowerKey === 'email') backendErrors.email = msg;
      else if (lowerKey === 'phonenumber') backendErrors.phoneNumber = msg;
      else if (lowerKey === 'password') backendErrors.password = msg;
      else backendErrors.general = msg;
    }
    return backendErrors;
  }

  // Case 2: Backend Business Error Code
  const errCode = data?.error?.code || data?.code;
  const errDesc =
    data?.error?.description ||
    data?.error?.message ||
    data?.message ||
    data?.detail ||
    data?.title;

  if (errCode === 'Auth.EmailExists') {
    return { email: errDesc || 'Email này đã được đăng ký. Vui lòng đăng nhập tài khoản.' };
  } else if (errCode === 'Auth.PhoneExists') {
    return { phoneNumber: errDesc || 'Số điện thoại này đã được sử dụng. Vui lòng dùng số khác.' };
  } else if (errCode === 'Auth.EmailFailed') {
    return { general: errDesc || 'Hệ thống đang gặp sự cố khi gửi email OTP. Vui lòng thử lại sau.' };
  }

  return { general: errDesc || 'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.' };
}

