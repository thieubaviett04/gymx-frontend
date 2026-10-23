import type { FormErrors } from './validators';

/**
 * Trích xuất message thông báo lỗi thân thiện từ Error, AxiosError hoặc string
 */
export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const axiosErr = err as {
      response?: {
        data?: {
          message?: string;
          detail?: string;
          title?: string;
          error?: { description?: string; message?: string; code?: string };
        };
      };
      message?: string;
    };

    return (
      axiosErr.response?.data?.error?.description ??
      axiosErr.response?.data?.error?.message ??
      axiosErr.response?.data?.detail ??
      axiosErr.response?.data?.message ??
      axiosErr.response?.data?.title ??
      axiosErr.message ??
      'Đã có lỗi xảy ra. Vui lòng thử lại.'
    );
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

/**
 * Bóc tách lỗi từ Backend ASP.NET Core (FluentValidation 400 + Business Error Codes)
 */
export function parseAuthBackendError(err: any): FormErrors {
  if (!err?.response) {
    return {
      general:
        'Không thể kết nối đến máy chủ backend (Network Error). Vui lòng đảm bảo backend API đang chạy.',
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
      else if (lowerKey === 'phonenumber' || lowerKey === 'phone') backendErrors.phoneNumber = msg;
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
    return { general: errDesc || 'Hệ thống đang gặp sự cố khi gửi email xác thực. Vui lòng thử lại sau.' };
  } else if (errCode === 'Auth.InvalidCredentials') {
    return { general: errDesc || 'Email hoặc mật khẩu không chính xác.' };
  } else if (errCode === 'Auth.EmailNotConfirmed') {
    return { general: errDesc || 'Email chưa được xác thực. Vui lòng kiểm tra hòm thư.' };
  }

  return { general: errDesc || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' };
}
