import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Kích hoạt middleware gác cổng chuyển hướng ngôn ngữ cho toàn bộ ứng dụng
export const proxy = createMiddleware(routing);

export const config = {
  // Loại trừ file tĩnh (.*\\..*), hệ thống Next.js (_next) và đường dẫn API (/api)
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
