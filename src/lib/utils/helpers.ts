/**
 * General helper functions
 */

/**
 * Lấy chữ cái đầu của tên để hiển thị Avatar: "Nguyễn Minh Khoa" → "NK"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return 'GX';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Rút gọn chuỗi dài: "Đây là một chuỗi..."
 */
export function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

/**
 * Delay thực thi (ms)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function helper
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), waitMs);
  };
}

/**
 * Xóa các field undefined/null/empty trong query object
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>;
}

/**
 * Quản lý lưu trữ tạm thời resetToken và resetEmail trong sessionStorage
 * Giúp chống mất trạng thái (State Loss) khi F5 hoặc vuốt quay lại
 */
export function saveResetSession(token: string, email?: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('gymx_reset_token', token);
    if (email) sessionStorage.setItem('gymx_reset_email', email);
  } catch {
    // Bỏ qua lỗi nếu sessionStorage bị chặn
  }
}

export function getResetSession(): { token: string | null; email: string | null } {
  if (typeof window === 'undefined') return { token: null, email: null };
  try {
    return {
      token: sessionStorage.getItem('gymx_reset_token'),
      email: sessionStorage.getItem('gymx_reset_email'),
    };
  } catch {
    return { token: null, email: null };
  }
}

export function clearResetSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem('gymx_reset_token');
    sessionStorage.removeItem('gymx_reset_email');
  } catch {
    // Bỏ qua lỗi
  }
}
