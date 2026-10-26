import { Plus_Jakarta_Sans, Inter } from 'next/font/google';

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

// Backward compatibility exports for existing layouts/components
export const sfPro = plusJakartaSans;
export const inder = inter;
