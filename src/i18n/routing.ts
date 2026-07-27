import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// Cấu hình danh sách ngôn ngữ hỗ trợ cho hệ thống GymX
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
});

// Các bộ công cụ điều hướng thông minh giữ nguyên định dạng ngôn ngữ trên URL
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
