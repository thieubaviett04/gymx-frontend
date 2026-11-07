import type { FormErrors } from './validators';
import type { EmployeeFormErrors } from '@/types/employee';
import type { PenaltyRuleFormErrors } from '@/types/penaltyRule';
import type { PackageFormErrors } from '@/types/package';

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
 * Chuẩn hóa thông báo lỗi thân thiện cho người dùng
 */
export function formatErrorMessage(msg: string): string {
  if (!msg) return 'Có lỗi xảy ra. Vui lòng kiểm tra lại.';
  const trimmed = msg.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.includes('network error') ||
    lower.includes('err_network') ||
    lower.includes('connection refused') ||
    lower.includes('failed to fetch') ||
    lower === 'networkerror'
  ) {
    return 'Lỗi kết nối mạng: Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối internet!';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại sau!';
  }
  if (lower.includes('status code 500') || lower === 'internal server error') {
    return 'Lỗi máy chủ nội bộ (500). Vui lòng thử lại sau hoặc liên hệ quản trị viên!';
  }
  if (lower.includes('status code 404') || lower === 'not found') {
    return 'Không tìm thấy dữ liệu hoặc dịch vụ yêu cầu (404).';
  }
  if (lower.includes('status code 401') || lower.includes('unauthorized')) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (lower.includes('status code 403') || lower.includes('forbidden')) {
    return 'Bạn không có quyền thực hiện thao tác này (403).';
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
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
  } else if (errCode === 'Auth.EmailNotConfirmed' || errCode === 'Auth.UnverifiedEmail') {
    return {
      general: errDesc || 'Tài khoản chưa xác thực email. Vui lòng nhập mã OTP đã gửi đến email của bạn.',
      unverifiedEmail: true,
    };
  } else if (errCode === 'Auth.AccountLocked') {
    return { general: errDesc || 'Tài khoản của bạn tạm thời bị khóa. Vui lòng liên hệ quản trị viên.' };
  } else if (errCode === 'Auth.AccountInactive') {
    return { general: errDesc || 'Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị viên.' };
  }

  return { general: errDesc || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' };
}

/**
 * Phân tích lỗi từ backend API trả về cho module Employee
 */
export function parseEmployeeBackendError(err: unknown): {
  fieldErrors: EmployeeFormErrors;
  generalError: string;
} {
  const errObj = err as {
    response?: {
      data?: {
        errors?: Record<string, unknown>;
        error?: { code?: string; description?: string; message?: string };
        code?: string;
        message?: string;
        detail?: string;
        title?: string;
      };
    };
    message?: string;
  };

  const data = errObj?.response?.data;
  const fieldErrors: EmployeeFormErrors = {};

  // 1. FluentValidation dictionary
  if (data?.errors && typeof data.errors === 'object') {
    for (const [key, msgs] of Object.entries(data.errors)) {
      const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'email') fieldErrors.email = msg;
      else if (lowerKey === 'phonenumber' || lowerKey === 'phone') fieldErrors.phoneNumber = msg;
      else if (lowerKey === 'nationalid' || lowerKey === 'citizenid') fieldErrors.nationalId = msg;
      else if (lowerKey === 'fullname') fieldErrors.fullName = msg;
      else if (lowerKey === 'position') fieldErrors.position = msg;
      else if (lowerKey === 'basesalaryrate') fieldErrors.baseSalaryRate = msg;
      else if (lowerKey === 'address') fieldErrors.address = msg;
      else if (lowerKey === 'employmentstatus') fieldErrors.employmentStatus = msg;
      else if (lowerKey === 'specializationid') fieldErrors.specializationId = msg;
      else if (lowerKey === 'experienceyears') fieldErrors.experienceYears = msg;
      else if (lowerKey === 'pricepersession') fieldErrors.pricePerSession = msg;
      else if (lowerKey === 'salarycoefficient') {
        fieldErrors.salaryCoefficient = msg;
        fieldErrors.pricePerSession = msg;
      }
    }
  }

  // 2. Business Error Code & Detailed Messages từ Backend
  const errCode = String(data?.error?.code || data?.code || '');
  const rawDesc =
    data?.error?.description ||
    data?.error?.message ||
    data?.message ||
    data?.detail ||
    data?.title ||
    errObj?.message ||
    '';

  const formattedMsg = formatErrorMessage(rawDesc);

  if (
    errCode.includes('Email') ||
    /email/i.test(errCode) ||
    /email.*(tồn tại|sử dụng|đã có|trùng|exists|duplicate|already)/i.test(rawDesc)
  ) {
    fieldErrors.email = formatErrorMessage(rawDesc || 'Email này đã tồn tại trong hệ thống.');
  } else if (
    errCode.includes('Phone') ||
    /phone/i.test(errCode) ||
    /(sđt|số điện thoại).*(tồn tại|sử dụng|đã có|trùng|exists|duplicate|already)/i.test(rawDesc)
  ) {
    fieldErrors.phoneNumber = formatErrorMessage(rawDesc || 'Số điện thoại này đã tồn tại trong hệ thống.');
  } else if (
    errCode.includes('CitizenId') ||
    errCode.includes('NationalId') ||
    /cccd|citizen|national/i.test(errCode) ||
    /(cccd|căn cước).*(tồn tại|sử dụng|đã có|trùng|exists|duplicate|already)/i.test(rawDesc)
  ) {
    fieldErrors.nationalId = formatErrorMessage(rawDesc || 'Số CCCD này đã tồn tại trong hệ thống.');
  }

  return {
    fieldErrors,
    generalError: formattedMsg,
  };
}

export function parsePenaltyRuleBackendError(err: unknown): {
  fieldErrors: PenaltyRuleFormErrors;
  generalError: string;
} {
  const errObj = err as {
    response?: {
      data?: {
        errors?: Record<string, unknown>;
        error?: { code?: string; description?: string; message?: string };
        code?: string;
        message?: string;
        detail?: string;
        title?: string;
      };
    };
    message?: string;
  };

  const data = errObj?.response?.data;
  const fieldErrors: PenaltyRuleFormErrors = {};

  if (data?.errors && typeof data.errors === 'object') {
    for (const [key, msgs] of Object.entries(data.errors)) {
      const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'name') fieldErrors.name = msg;
      else if (lowerKey === 'fineamount') fieldErrors.fineAmount = msg;
      else if (lowerKey === 'severitylevel') fieldErrors.severityLevel = msg;
      else if (lowerKey === 'effectivedate' || lowerKey === 'effectivefrom') fieldErrors.effectiveDate = msg;
      else if (lowerKey === 'status') fieldErrors.status = msg;
      else if (lowerKey === 'violationtype' || lowerKey === 'targetaudience') fieldErrors.violationType = msg;
      else if (lowerKey === 'description') fieldErrors.description = msg;
      else fieldErrors.general = msg;
    }
  }

  const rawDesc =
    data?.error?.description ||
    data?.error?.message ||
    data?.detail ||
    data?.message ||
    data?.title ||
    errObj?.message ||
    '';

  const formattedMsg = formatErrorMessage(rawDesc);
  if (/chưa áp dụng|đang áp dụng|ngày tương lai|hiện tại|quá khứ|chờ áp dụng|ngày hiệu lực|ngày bắt đầu/i.test(rawDesc) || /effectivedate|effectivefrom/i.test(rawDesc)) {
    fieldErrors.effectiveDate = rawDesc;
  } else if (/tiền phạt/i.test(rawDesc)) {
    fieldErrors.fineAmount = rawDesc;
  }

  return {
    fieldErrors,
    generalError: formattedMsg,
  };
}

export function parsePackageBackendError(err: unknown): {
  fieldErrors: PackageFormErrors;
  generalError: string;
} {
  const errObj = err as {
    response?: {
      data?: {
        errors?: Record<string, unknown>;
        error?: { code?: string; description?: string; message?: string };
        code?: string;
        message?: string;
        detail?: string;
        title?: string;
      };
    };
    message?: string;
  };

  const data = errObj?.response?.data;
  const fieldErrors: PackageFormErrors = {};

  if (data?.errors && typeof data.errors === 'object') {
    for (const [key, msgs] of Object.entries(data.errors)) {
      const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'name') fieldErrors.name = msg;
      else if (lowerKey === 'price') fieldErrors.price = msg;
      else if (lowerKey === 'durationmonths') fieldErrors.durationMonths = msg;
      else if (lowerKey === 'categoryid') fieldErrors.categoryId = msg;
      else if (lowerKey === 'status') fieldErrors.status = msg;
      else if (lowerKey === 'effectivestartdate') fieldErrors.effectiveStartDate = msg;
      else if (lowerKey === 'description') fieldErrors.description = msg;
      else fieldErrors.general = msg;
    }
  }

  const rawDesc =
    data?.error?.description ||
    data?.error?.message ||
    data?.detail ||
    data?.message ||
    data?.title ||
    errObj?.message ||
    '';

  const formattedMsg = formatErrorMessage(rawDesc);
  if (/chưa áp dụng|đang áp dụng|ngày tương lai|hiện tại|quá khứ|chờ áp dụng|ngày hiệu lực|ngày bắt đầu/i.test(rawDesc) || /effectivestartdate/i.test(rawDesc)) {
    fieldErrors.effectiveStartDate = rawDesc;
  }

  return {
    fieldErrors,
    generalError: formattedMsg,
  };
}
