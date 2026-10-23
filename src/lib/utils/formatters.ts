/**
 * Utility functions for formatting currencies, dates, numbers, and strings
 */

/**
 * Định dạng số thành tiền tệ VNĐ: 1499000 → "1.499.000 ₫"
 */
export function formatVND(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Định dạng số gọn hơn: 1499000 → "1.499.000đ"
 */
export function formatVNDShort(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '0đ';
  return `${amount.toLocaleString('vi-VN')}đ`;
}

/**
 * Định dạng ngày ISO sang ngày VN: "2025-10-23T14:30:00" → "23/10/2025"
 */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
}

/**
 * Định dạng ngày giờ: "2025-10-23T14:30:00" → "14:30 – 23/10/2025"
 */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Tính số ngày còn lại từ hôm nay đến hạn
 */
export function daysUntil(expiryIso: string | Date | null | undefined): number {
  if (!expiryIso) return 0;
  const target = typeof expiryIso === 'string' ? new Date(expiryIso).getTime() : expiryIso.getTime();
  const diff = target - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Định dạng số điện thoại VN có khoảng cách: "0987654321" → "0987 654 321"
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return clean.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
}
