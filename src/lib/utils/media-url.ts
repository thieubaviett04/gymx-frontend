/**
 * Xử lý URL hình ảnh, media từ Backend
 */
export function getMediaUrl(path: string | null | undefined, defaultPlaceholder = '/images/placeholder.png'): string {
  if (!path) return defaultPlaceholder;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5113';
  const cleanBase = backendUrl.replace(/\/api$/, '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
