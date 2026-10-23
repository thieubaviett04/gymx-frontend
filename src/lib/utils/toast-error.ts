import { getErrorMessage } from './error-helper';

/**
 * Log và format lỗi cho toast notification
 */
export function toastError(err: unknown, fallbackMessage = 'Đã có lỗi xảy ra'): string {
  const message = getErrorMessage(err);
  return message || fallbackMessage;
}
