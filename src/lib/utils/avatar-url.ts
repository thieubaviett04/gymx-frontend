import { getMediaUrl } from './media-url';
import { getInitials } from './helpers';

/**
 * Lấy avatar URL với fallback UI Avatars nếu user chưa có ảnh
 */
export function getAvatarUrl(
  avatarPath: string | null | undefined,
  fullName?: string | null
): string {
  if (avatarPath) {
    return getMediaUrl(avatarPath);
  }

  const initials = getInitials(fullName);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0A0A0A&color=E6FF00&bold=true`;
}
